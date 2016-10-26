import psycopg2
import psycopg2.extensions
from .config import Config

def connect_to_postgres(cfg: Config): psycopg2.extensions.connection
def import_archive(cfg: Config, archive_filename: str) -> None: ...