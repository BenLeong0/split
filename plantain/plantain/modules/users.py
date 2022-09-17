'''
Users module.

Split.
'''

from db import DatabaseConnection

def store_user(store_user_request):
    with DatabaseConnection() as db:
        db.cursor.execute("SELECT * FROM users")
        print(db.cursor.fetchall())
