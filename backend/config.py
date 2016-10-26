class Config(object):
    def __init__(self):
        self.DB_HOST = "localhost"
        self.DB_PORT = 5432
        self.DB_USER = "cbit"
        self.DB_PASS = "2076a675b6d813b582977189c13a3279cc9cf02a9aeab01389798d9167cf259c8b247aee9a2be149"
        self.DB_NAME = "cbit"

        self.FILE_ENCODING = "cp1252"  # All files are coming from Windows and ISAcreator uses this encoding for output (!)
