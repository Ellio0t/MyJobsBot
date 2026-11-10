import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FIREBASE_CONFIG } from '../config/firebase';
import { UserSession } from '../types';

// Inicialización Singleton de Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Convierte un usuario nativo de Firebase en la interfaz UserSession del sistema
 */
export function formatUserSession(user: FirebaseUser | null): UserSession {
  if (!user) {
    return { isAuthenticated: false };
  }
  return {
    isAuthenticated: true,
    uid: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'Candidato Profesional',
    email: user.email || '',
    photoURL: user.photoURL || undefined,
    authProvider: user.providerData?.[0]?.providerId?.includes('google') ? 'google' : 'email',
  };
}

/**
 * Registra o sincroniza el perfil del usuario en Firestore bajo /users/{uid}
 */
async function syncUserToFirestore(user: FirebaseUser) {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('No se pudo sincronizar usuario en Firestore (puede ser por reglas offline):', err);
  }
}

/**
 * Autenticación Real con Google
 */
export async function signInWithGoogleReal(): Promise<UserSession> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    await syncUserToFirestore(cred.user);
    return formatUserSession(cred.user);
  } catch (error: any) {
    console.error('Error en Google Sign-In:', error);
    throw new Error(error.message || 'No se pudo iniciar sesión con Google.');
  }
}

/**
 * Inicio de Sesión Real con Correo y Contraseña
 */
export async function signInWithEmailReal(email: string, pass: string): Promise<UserSession> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await syncUserToFirestore(cred.user);
    return formatUserSession(cred.user);
  } catch (error: any) {
    console.error('Error en Email Sign-In:', error);
    let msg = 'Error al iniciar sesión.';
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      msg = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
    } else if (error.code === 'auth/user-not-found') {
      msg = 'No existe una cuenta registrada con este correo.';
    } else if (error.code === 'auth/invalid-email') {
      msg = 'El formato del correo electrónico no es válido.';
    }
    throw new Error(msg);
  }
}

/**
 * Registro Real con Correo, Contraseña y Nombre
 */
export async function registerWithEmailReal(
  email: string,
  pass: string,
  displayName: string
): Promise<UserSession> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    await syncUserToFirestore(cred.user);
    return formatUserSession(cred.user);
  } catch (error: any) {
    console.error('Error en Email Register:', error);
    let msg = 'Error al registrar cuenta.';
    if (error.code === 'auth/email-already-in-use') {
      msg = 'Este correo electrónico ya está registrado. Por favor inicia sesión.';
    } else if (error.code === 'auth/weak-password') {
      msg = 'La contraseña debe tener al menos 6 caracteres.';
    } else if (error.code === 'auth/invalid-email') {
      msg = 'El formato del correo electrónico no es válido.';
    }
    throw new Error(msg);
  }
}

/**
 * Cierre de Sesión Real
 */
export async function logoutUserReal(): Promise<void> {
  await signOut(auth);
}

/**
 * Observador reactivo de estado de sesión
 */
export function onAuthStatusChanged(callback: (session: UserSession) => void) {
  return onAuthStateChanged(auth, (user) => {
    callback(formatUserSession(user));
  });
}
