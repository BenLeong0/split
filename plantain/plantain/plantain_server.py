import json
import sys

import pika

import modules.users as users

def consume_and_respond(_headers: dict, body: str) -> Optional[str]:
    try:
        message = json.loads(body)

        print(f"Received {message[0]} message.")

        if message[0] == "create_user":
            create_user_request = message[1]
            return json.dumps((
                "create_user_response",
                users.create_user(create_user_request)
            ))

    except Exception as e:
        print(e)


def main_loop(args):
    print(args)
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()

    channel.queue_declare(queue="plantain")

    channel.basic_consume(queue="plantain", on_message_callback=consume_and_respond, auto_ack=True)

    print(" [*] Waiting for messages. ")
    channel.start_consuming()


if __name__ == "__main__":
    main_loop(sys.argv)
