import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// my firebase config - got this from firebase console
const firebaseConfig = {
  apiKey: "AIzaSyCjG9BmkDkfGfnRy3EgsWJbKBnKIu3t2lk",
  authDomain: "bachelor-pad.firebaseapp.com",
  projectId: "bachelor-pad",
  storageBucket: "bachelor-pad.firebasestorage.app",
  messagingSenderId: "480364791348",
  appId: "1:480364791348:web:ea17082cc2a17f7322ec61",
  measurementId: "G-244VFXT0VP"
}

// initialize firebase
const app = initializeApp(firebaseConfig)

// exporting auth and db so i can use it in other files
export const auth = getAuth(app)
export const db = getFirestore(app)
