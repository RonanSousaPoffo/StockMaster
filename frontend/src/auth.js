// src/auth.js
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

