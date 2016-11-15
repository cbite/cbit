import falcon_cors

def CORSMiddleware():
    """See https://pypi.python.org/pypi/falcon-cors for CORS info"""

    cors_origins = ['http://localhost:8080']
    cors = falcon_cors.CORS(
        allow_origins_list=cors_origins,
        allow_credentials_origins_list=cors_origins,
        allow_all_methods=True,
        allow_all_headers=True
    )
    return cors.middleware
