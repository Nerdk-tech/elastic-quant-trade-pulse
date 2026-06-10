import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBN73ivE0kmDJH4zej9RZuc3zt7oIdB61U",
  authDomain: "elastic-quant-trade-bda37.firebaseapp.com",
  projectId: "elastic-quant-trade-bda37",
  storageBucket: "elastic-quant-trade-bda37.firebasestorage.app",
  messagingSenderId: "457498642263",
  appId: "1:457498642263:web:cb4b7034240c5b8ca1a012",
  measurementId: "G-XQ90MQ3TLJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword };
