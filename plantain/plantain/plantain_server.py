import json
import sys
from typing import Optional

import pika

import modules.users as users

from split_types.message_types import Message

def consume_and_respond(_ch, _method, _properties, body) -> Optional[str]:
    try:
        message: Message = json.loads(body)

        print(f"Received {message[0]} message.")

        if message[0] == "store_user":
            store_user_request = message[1]
            return json.dumps((
                "store_user_response",
                users.store_user(store_user_request)
            ))

    except Exception as e:
        print(e)


def main_loop(args):
    print(args)
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()

    channel.queue_declare(queue="plantain")

    channel.basic_consume(
        queue="plantain",
        on_message_callback=consume_and_respond,
        auto_ack=True
    )

    print(" [*] Waiting for messages. ")
    channel.start_consuming()


if __name__ == "__main__":
    main_loop(sys.argv)
