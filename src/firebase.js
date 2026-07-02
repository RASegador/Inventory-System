// Firebase setup for Stock It.
//
// These values identify your Firebase project (inventory-system-c98f0).
// They are safe to commit to git - Firebase's web config is not a secret.
// Access is controlled by the security rules on Firestore and Authentication,
// not by hiding this file.

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCp93lfs6qMZeI_qrXf_60o3--uDeN_NiI',
  authDomain: 'inventory-system-c98f0.firebaseapp.com',
  projectId: 'inventory-system-c98f0',
  storageBucket: 'inventory-system-c98f0.firebasestorage.app',
  messagingSenderId: '496472688913',
  appId: '1:496472688913:web:19dca28c5aa60b9cc664b0',
  measurementId: 'G-9VNT5SVTDV',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);