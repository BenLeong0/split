import hashlib

from split_types.message_types import CreateUserMessageData


def create_user(message_data: CreateUserMessageData) -> None:
    email = message_data['email']
    password = message_data['password']

    salt = hash_string(email)
    hashed_password = hash_string(password + salt)




def hash_string(input_string: str) -> str:
    return hashlib.md5(input_string).hexdigest()
