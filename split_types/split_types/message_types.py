from typing import Literal, Tuple, TypedDict, Union


class CreateUserMessageData(TypedDict):
    email: str
    password: str

CreateUserMessage = Tuple[Literal['create_user'], CreateUserMessageData]


class GetTokenMessageData(TypedDict):
    email: str
    password: str

GetTokenMessage = Tuple[Literal['get_token'], GetTokenMessageData]


Message = Union[
    CreateUserMessage,
    GetTokenMessage,
]