
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Initializes Firebase.
 * Returns null values during SSR to prevent destructuring errors.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return {
      firebaseApp: null,
      firestore: null,
      auth: null
    } as any;
  }

  if (!getApps().length) {
    let firebaseApp: FirebaseApp;
    try {
      // Basic initialization with config
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      console.error("Firebase init failed:", e);
      // Fallback
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
