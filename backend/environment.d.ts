export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENV: "dev" | "prod";
      ACCESS_TOKEN_SECRET: string;
      PORT: number;
      DATABASE_URL: string;
    }
  }
}
