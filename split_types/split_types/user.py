from typing import Literal, Tuple, TypedDict, Union


class User(TypedDict):
    user_id: str
    email: str
    hashed_password: str
    name: str
    creation_time: str


StoreUserMessage = Tuple[Literal['store_user'], User]


class CreateUserMessageData(TypedDict):
    email: str
    password: str


CreateUserMessage = Tuple[Literal['create_user'], CreateUserMessageData]


class GetTokenMessageData(TypedDict):
    email: str
    password: str


GetTokenMessage = Tuple[Literal['get_token'], GetTokenMessageData]


UserMessage = Union[
    CreateUserMessage,
    StoreUserMessage,
    GetTokenMessage,
]