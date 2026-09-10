import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocFromServer,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const googleProvider = googleAuthProvider;
export const firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const db = firestore;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate connection to Firestore on boot
 */
async function testConnection() {
  try {
    await getDocFromServer(doc(firestore, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Firestore client is offline or database standby.');
    }
  }
}
testConnection();

/**
 * Save / update authenticated farmer profile in Firestore
 */
export async function saveFarmerProfileToFirestore(uid: string, profile: Record<string, any>) {
  const path = `farmers/${uid}`;
  try {
    const userRef = doc(firestore, 'farmers', uid);
    await setDoc(
      userRef,
      {
        ...profile,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn('Firestore profile save warning:', err);
    return false;
  }
}

/**
 * Persist token appointment in Firestore
 */
export async function saveTokenToFirestore(token: Record<string, any>) {
  if (!token?.tokenNumber) return false;
  const path = `mandi_tokens/${token.tokenNumber}`;
  try {
    const tokenRef = doc(firestore, 'mandi_tokens', token.tokenNumber);
    await setDoc(
      tokenRef,
      {
        ...token,
        lastSynced: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn('Firestore token sync warning:', err);
    return false;
  }
}

/**
 * Real-time listener for mandi_tokens collection in Firestore
 */
export function listenToMandiTokens(
  onTokensUpdated: (tokens: any[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = 'mandi_tokens';
  try {
    const tokensCol = collection(firestore, path);
    return onSnapshot(
      tokensCol,
      (snapshot) => {
        const tokenList: any[] = [];
        snapshot.forEach((docSnap) => {
          tokenList.push({ id: docSnap.id, ...docSnap.data() });
        });
        onTokensUpdated(tokenList);
      },
      (error) => {
        console.warn('[Firebase] Firestore onSnapshot warning:', error.message);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('[Firebase] Snapshot subscription fallback:', err);
    return () => {};
  }
}

