'''
Users module.

Split.
'''
import uuid

from db import DatabaseConnection

from split_types.message_types import StoreTransactionMessageData

def store_transaction(store_transaction_request: StoreTransactionMessageData):
    transaction_id = uuid.uuid4()
    date = store_transaction_request['date']
    description = store_transaction_request['description']

    transaction_components = store_transaction_request['components']

    with DatabaseConnection() as db:
        # TODO: generate ID
        db.cursor.execute(
            f"INSERT INTO transactions"
            f"VALUES ({transaction_id} {date} {description})"
        )

        for component in transaction_components:
            db.cursor.execute(
                """
                INSERT INTO transaction_components
                VALUES ({id}, {transaction_id}, {payer_id}, {payee_id}, {amount}, {paid})
                """.format(
                    uuid.uuid4(),
                    transaction_id,
                    component['payer_id'],
                    component['payee_id'],
                    component['amount'],
                    False,
                )
            )
        print(db.cursor.fetchall())
