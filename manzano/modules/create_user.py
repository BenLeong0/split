import hashlib
import uuid

from split_types.message_types import CreateUserMessageData
from split_types.user import User


def create_user_and_get_token(message_data: CreateUserMessageData) -> None:
    email = message_data['email']
    password = message_data['password']
    name = message_data['name']

    salt = hash_string(email)
    hashed_password = hash_string(password + salt)

    user: User = {
        "user_id": str(uuid.uuid4()),
        "email": email,
        "hashed_password": hashed_password,
        "name": name,
        "creation_time": message_data['timestamp'],
        "is_active": True,
    }

    return


def hash_string(input_string: str) -> str:
    return hashlib.md5(input_string.encode()).hexdigest()
