'''
Users module.

Split.
'''

from db import DatabaseConnection

def store_user(store_user_request):
    first_name = store_user_request['first_name']
    last_name = store_user_request['last_name']
    email = store_user_request['email']
    password = store_user_request['password']
    with DatabaseConnection() as db:
        # TODO: generate ID
        db.cursor.execute(
            f"INSERT INTO users"
            f"VALUES ({1, first_name, last_name, email, password})"
        )
        print(db.cursor.fetchall())
