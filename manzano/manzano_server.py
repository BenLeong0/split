import json
import sys
from typing import Optional

import pika
from split_types.message_types import Message

from modules.create_user import create_user_and_get_token


def consume_and_respond(_ch, _method, _properties, body) -> Optional[str]:
    try:
        message: Message = json.loads(body)

        print(f"Received {message[0]} message.")

        if message[0] == "create_user_and_get_token":
            resp = create_user_and_get_token(message[1])
            return json.dumps(("user_token", resp))

    except Exception as e:
        print(e)


def main_loop(args):
    print(args)
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()

    channel.queue_declare(queue="manzano")

    channel.basic_consume(
        queue="manzano",
        on_message_callback=consume_and_respond,
        auto_ack=True
    )

    print(" [*] Waiting for messages. ")
    channel.start_consuming()


if __name__ == "__main__":
    main_loop(sys.argv)