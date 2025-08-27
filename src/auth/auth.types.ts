// auth.types.ts
export interface AuthService {
  signIn(email: string, password: string): Promise<User>;
  signInByToken(token: string,lms:string): Promise<User>;
  signOut(): Promise<void>;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
  signUp(email: string, password: string): Promise<User>;
  forgotPassword(email: string): Promise<void>;
}

export type User = {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};


export interface SignInByExternalTokenRequest {
  token: string;
  externalApiUrl: string;
  lms: string;
}


export interface  SignInByExternalTokenResponse {
  success: boolean;
  customToken: string;
  user: {
    uid: string;
    email: string;
    isNewUser: boolean;
  };
  message?: string;
}
