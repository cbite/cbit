import {AuthenticationService} from "../core/authentication/authentication.service";
/**
 * Allow bufferable requests to a REST end-point, caching responses.
 *
 * The REST endpoint specifed in `url` should accept a POST request with JSON payload of an array with string IDs, e.g.,
 *
 *   [ 'id_1', 'id_2', ... ]
 *
 * The response should be an object with each of the requested IDs as a key, e.g.,
 *
 *   {
 *     'id_1': ...,
 *     'id_2': ...,
 *     ...
 *   }
 *
 * Individual requests will be buffered up to `requestBufferTimeMs` before a single bulk request
 * is made to the endpoint.  Responses will be cached for `cacheTimeMs` after reception and/or last access.
 * You can manually flush all the response cache with `flushCache()`.
 */

export class CacheableBulkRequester<T> {

  // PUBLIC INTERFACE
  // ================

  constructor(
    public readonly name: string,
    public readonly url: string,
    private readonly _auth: AuthenticationService,
    public readonly cacheTimeMs: number,
    public readonly requestBufferTimeMs: number)
  { }

  get(id: string): Promise<T> {

    this.checkCacheExpiration();

    if (id in this.cache) {

      // Case 1: Data is in cache already
      this.touch(id);
      return Promise.resolve(this.cache[id].data);

    } else if (id in this.idsToFetch) {

      // Case 2: Requested ID already queued for fetching
      return this.idsToFetch[id].promise;

    } else {

      // Case 3: Need to add requested ID to fetch queue
      return this.initiateFetch(id);

    }
  }

  flushCache(): void {
    this.cache = {};
  }

  // IMPLEMENTATION (Caching)
  // ========================

  private cache: {
    [id: string]: {
      expirationTimeMs: number,
      data: T
    }
  } = {};

  private addToCache(id: string, data: T): void {
    if (!(id in this.cache)) {
      this.cache[id] = {
        data: data,
        expirationTimeMs: 0
      };
      this.touch(id);
    }
  }

  private touch(id: string): void {
    this.cache[id].expirationTimeMs = Date.now() + this.cacheTimeMs;
  }

  private checkCacheExpiration(): void {
    let timeNowMs = Date.now();

    for (let id in this.cache) {
      if (this.cache[id].expirationTimeMs < timeNowMs) {
        delete this.cache[id];
      }
    }
  }

  // IMPLEMENTATION (Async Requests)
  // ===============================

  private fetchTimeoutActivated: boolean = false;

  private idsToFetch: {
    [id: string]: {
      promise: Promise<T>,
      resolve: (data: T) => void
    }
  } = {};


  private initiateFetch(id: string): Promise<T> {
    let toFetch = {
      promise: null as Promise<T>,
      resolve: null as (data: T) => void
    }
    toFetch.promise = new Promise(resolve => { toFetch.resolve = resolve; });

    this.idsToFetch[id] = toFetch;

    let self = this;
    if (!this.fetchTimeoutActivated) {
      setTimeout(function() { self.doFetch() }, this.requestBufferTimeMs);
      this.fetchTimeoutActivated = true;
    }

    return toFetch.promise;
  }

  private doFetch(): void {

    let saveIdsToFetch = this.idsToFetch;
    this.idsToFetch = {};
    this.fetchTimeoutActivated = false;

    let ids = Object.keys(saveIdsToFetch);

    let self = this;
    $.ajax({
      type: 'POST',
      url: this.url,
      headers: this._auth.headers(),
      contentType: 'application/json',
      data: JSON.stringify(ids),

      success: function(data: { [id: string]: T }) {

        for (let id in data) {
          saveIdsToFetch[id].resolve(data[id]);
          self.addToCache(id, data[id]);
        }

      }

      // TODO: Add error handling!

    });
  }
}
