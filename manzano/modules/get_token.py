import arrow
import jwt

from split_types.user import User, UserToken


JWT_SECRET = "NOTHING'S FREE THESE DAYS!"


def make_user_token(user: User) -> str:
    expiry_timestamp = make_expiry_timestamp()
    data: UserToken = {
        'user_id': user['user_id'],
        'email': user['email'],
        'creation_time': arrow.utcnow().isoformat(),
        'expiry_time': expiry_timestamp,
    }
    token = jwt.encode(data, JWT_SECRET, algorithm='HS512')
    return token


def make_expiry_timestamp() -> str:
    return arrow.utcnow().shift(days=1).isoformat()
