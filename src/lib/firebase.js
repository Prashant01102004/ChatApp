// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {getStorage} from "firebase/storage";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "react-chat-aedf5.firebaseapp.com",
  projectId: "react-chat-aedf5",
  storageBucket: "react-chat-aedf5.appspot.com",
  messagingSenderId: "830955160878",
  appId: "1:830955160878:web:e29277a7cce27ab6cd66bf"
};

const app = initializeApp(firebaseConfig);

export const auth =getAuth()
export const db =getFirestore()
export const storage =getStorage()
