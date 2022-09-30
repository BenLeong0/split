export interface AccessTokenData {
  userId: string;
  iat: string;
  exp: string;
}

export interface CreateUserRequestBody {
  email: string;
}

export interface LoginRequestBody {
  email: string;
}
