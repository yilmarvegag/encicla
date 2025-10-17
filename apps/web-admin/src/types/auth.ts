import { EnciclaUserDto } from "./user";

export interface CreateTokenDto {
  username: string;
  password: string;
}
export interface CreateTokenResponse {
  token: string;
  expiration: string; // ISO
  user: EnciclaUserDto;
}
