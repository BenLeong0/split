import json
import sys

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


if __name__ == "__main__":
    main_loop(sys.argv)
