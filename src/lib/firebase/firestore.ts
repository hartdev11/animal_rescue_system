export {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  runTransaction,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";

export { getFirebaseDb } from "./config";
