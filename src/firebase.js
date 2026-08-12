import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAVSGuQURJdd_PWntU-lxTFIs9TmHyqodI",
  authDomain: "seattle-parking-b5032.firebaseapp.com",
  projectId: "seattle-parking-b5032",
  storageBucket: "seattle-parking-b5032.firebasestorage.app",
  messagingSenderId: "450980737689",
  appId: "1:450980737689:web:3b8f0b05b938d26423be08",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
