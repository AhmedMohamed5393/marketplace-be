export interface AuthenticatedUserInterface {
  id: string;
  username: string;
  email: string;
  is_admin?: boolean;
}
