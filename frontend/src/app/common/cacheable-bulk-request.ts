import {AuthenticationService} from '../core/authentication/authentication.service';
import {HttpGatewayService} from '../core/services/http-gateway.service';

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

  constructor(public readonly name: string,
              public readonly url: string,
              private readonly httpGatewayService: HttpGatewayService,
              public readonly cacheTimeMs: number,
              public readonly requestBufferTimeMs: number) {
  }

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
    const timeNowMs = Date.now();

    for (const id in this.cache) {
      if (this.cache[id].expirationTimeMs < timeNowMs) {
        delete this.cache[id];
      }
    }
  }

  // IMPLEMENTATION (Async Requests)
  // ===============================

  private fetchTimeoutActivated = false;

  private idsToFetch: {
    [id: string]: {
      promise: Promise<T>,
      resolve: (data: T) => void
    }
  } = {};


  private initiateFetch(id: string): Promise<T> {
    const toFetch = {
      promise: null as Promise<T>,
      resolve: null as (data: T) => void
    };
    toFetch.promise = new Promise(resolve => {
      toFetch.resolve = resolve;
    });

    this.idsToFetch[id] = toFetch;

    const self = this;
    if (!this.fetchTimeoutActivated) {
      setTimeout(function () {
        self.doFetch();
      }, this.requestBufferTimeMs);
      this.fetchTimeoutActivated = true;
    }

    return toFetch.promise;
  }

  private doFetch(): void {

    const saveIdsToFetch = this.idsToFetch;
    this.idsToFetch = {};
    this.fetchTimeoutActivated = false;

    const ids = Object.keys(saveIdsToFetch);

    const self = this;
    this.httpGatewayService.post(this.url, JSON.stringify(ids)).subscribe(data => {
      for (const id in data) {
        if (data.hasOwnProperty(id)) {
          saveIdsToFetch[id].resolve(data[id]);
          self.addToCache(id, data[id]);
        }
      }
    });
  }
}
