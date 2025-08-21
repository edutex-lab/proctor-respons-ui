// Import the functions you need from the SDKs you need
import { getApp, initializeApp ,type FirebaseApp} from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQzajTCiU-QMSI3cTDNtmVFjgy2MwNcGM",
  authDomain: "cognisia-proctor-dev.firebaseapp.com",
  projectId: "cognisia-proctor-dev",
  storageBucket: "cognisia-proctor-dev.firebasestorage.app",
  messagingSenderId: "793015566159",
  appId: "1:793015566159:web:a137b67ea1a6afab6d8f3a"
};

// Initialize Firebase
// This check prevents re-initializing the app on hot reloads
let app: FirebaseApp;
try {
  app = getApp();
} catch (error) {
  app = initializeApp(firebaseConfig);
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


export { app, auth, db, storage};