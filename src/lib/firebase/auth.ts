export {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";

export {
  isFirebaseConfigured,
  getFirebaseAuth,
  getFirebaseDb,
  getFirebaseStorage,
} from "./config";
