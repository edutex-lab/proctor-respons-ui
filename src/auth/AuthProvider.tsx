// AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { type AuthService, type User } from "./auth.types";
import { firebaseAuthService } from "./firebaseAuthService";
import FullPageLoading from "../components/FullPageLoading";
const auth = firebaseAuthService; // could be swapped later

const AuthContext = createContext<{ user: User | null; auth: AuthService } | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currUser)=>{
        setUser(currUser);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);


  if(isLoading){
    return <FullPageLoading/>
  }

  return (
    <AuthContext.Provider value={{ user, auth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
