import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC13-C_qrAPHXZkeC9QHX5UL2xa5F4MdNo",
  authDomain: "orion-1441e.firebaseapp.com",
  databaseURL: "https://orion-1441e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "orion-1441e",
  storageBucket: "orion-1441e.appspot.com",
  messagingSenderId: "257906097203",
  appId: "1:257906097203:web:d62d6d52d66ccd6d927746"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
