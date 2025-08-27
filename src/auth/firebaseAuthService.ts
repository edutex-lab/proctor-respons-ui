// firebaseAuthService.ts
import { createLmsApi } from "../services";
import { auth, functions } from "../services/firebase";
import { type AuthService, type SignInByExternalTokenRequest, type SignInByExternalTokenResponse} from "./auth.types";
import {
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";

export const firebaseAuthService: AuthService = {
  async signIn(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return {
      id: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName,
      photoURL: cred.user.photoURL, 
    };
  },
  async signInByToken(token, lms) {
    const signInByTokenFunction = httpsCallable<SignInByExternalTokenRequest, SignInByExternalTokenResponse>(functions, 'auth-signInByExternalToken');
    
    const lmsApi = createLmsApi(lms);
    const result = await signInByTokenFunction({ 
      token,
      lms,
      externalApiUrl:`${lmsApi.baseURL}${lmsApi.endpoints.profile}`
    });
    
    const { customToken } = result.data;
    await setPersistence(auth,browserSessionPersistence);
    const userCredential = await signInWithCustomToken(auth, customToken);
      
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem(`${lms}-token`,token);
      window.sessionStorage.setItem("lms",lms);
    }
    return {
      id: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      photoURL: userCredential.user.photoURL,
    };
  },
  async signOut() {
    await signOut(auth);
  },
  onAuthStateChanged(callback) {
    return fbOnAuthStateChanged(auth, async (fbUser) => {
    //  const idTokenResult = await fbUser?.getIdTokenResult();
    // console.log(idTokenResult?.claims?.role)
      if (!fbUser) return callback(null);
      callback({ id: fbUser.uid, email: fbUser.email, displayName: fbUser.displayName, photoURL: fbUser.photoURL });
    });
  }, async signUp(email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return {
      id: cred.user.uid,
      email: cred.user.email!,
      displayName: cred.user.displayName!,
      photoURL: cred.user.photoURL!,
    };
  },

  async forgotPassword(email) {
    await sendPasswordResetEmail(auth, email);
  },

};
