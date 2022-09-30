export interface AccessTokenData {
  userId: string;
  iat: string;
  exp: string;
}

export interface LoginRequestBody {
  email: string;
}

export interface CreateUserRequestBody {
  email: string;
}
