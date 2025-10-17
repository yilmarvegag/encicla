export interface CreateTokenDto {
  username: string;
  password: string;
}
export interface CreateTokenResponse {
  token: string;
  expiration: string; // ISO
  user: {
    id: string;
    fullName: string;
    email: string;
    // ...resto si lo necesitamos luego
  };
}
