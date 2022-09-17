import sqlite3

class DatabaseConnection():
    connection = None
    cursor = None

    def __enter__(self):
        self.connection = sqlite3.connect("split.db")
        self.cursor = self.connection.cursor()
        print("Successfully connected to database")
        return self

    def __exit__(self, type, value, traceback):
        self.cursor.close()
        self.connection.close()
