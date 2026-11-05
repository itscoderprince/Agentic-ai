import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "agentic-ai-project-cd0c7.firebaseapp.com",
  projectId: "agentic-ai-project-cd0c7",
  storageBucket: "agentic-ai-project-cd0c7.firebasestorage.app",
  messagingSenderId: "23545998382",
  appId: "1:23545998382:web:225343177e8e83c9e9c3bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});
