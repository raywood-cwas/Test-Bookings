//auth.js

import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { app } from './firebase-config.js'; 

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function signIn() {
  return signInWithPopup(auth, provider);
}

export function signUserOut() {
  return signOut(auth);
}

export function onAuthStateChangedListener(callback) {
  return auth.onAuthStateChanged(callback);
}
