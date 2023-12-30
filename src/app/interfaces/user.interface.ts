export interface UserInterface {
  user: {
    name: string;
    password: string;
    id: string;
  };
  accessToken: string;
  refreshToken: string;
}
