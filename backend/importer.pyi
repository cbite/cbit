import psycopg2
import psycopg2.extensions
from .config import Config
from elasticsearch import Elasticsearch
from uuid import UUID

def connect_to_postgres(cfg: Config): psycopg2.extensions.connection
def import_archive(cfg: Config,
                   db_conn: psycopg2.extensions.connection,
                   es: Elasticsearch,
                   archive_filename: str,
                   study_uuid: UUID) -> None: ...