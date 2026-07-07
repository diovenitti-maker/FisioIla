// ============================================================
// ⚠️  SOSTITUISCI QUESTO BLOCCO CON IL TUO firebaseConfig
//     (lo ottieni dalla console Firebase dopo aver creato il progetto)
// ============================================================
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAYFiIRiDpSUcdmbLaf7djYssUbVW-G0SI",
  authDomain: "fisioila.firebaseapp.com",
  projectId: "fisioila",
  storageBucket: "fisioila.firebasestorage.app",
  messagingSenderId: "199845842854",
  appId: "1:199845842854:web:c090a3769adc0c6d7ec967"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// ── PAZIENTI ─────────────────────────────────────────────────
export const getPatientsFS = () => getDocs(collection(db, 'patients'))
export const addPatientFS  = (data) => addDoc(collection(db, 'patients'), { ...data, createdAt: serverTimestamp() })
export const updatePatientFS = (id, data) => updateDoc(doc(db, 'patients', id), data)
export const deletePatientFS = (id) => deleteDoc(doc(db, 'patients', id))

// ── ESERCIZI ─────────────────────────────────────────────────
export const getExercisesFS  = () => getDocs(collection(db, 'exercises'))
export const addExerciseFS   = (data) => addDoc(collection(db, 'exercises'), { ...data, createdAt: serverTimestamp() })
export const updateExerciseFS = (id, data) => updateDoc(doc(db, 'exercises', id), data)
export const deleteExerciseFS = (id) => deleteDoc(doc(db, 'exercises', id))

// ── TEORIA ───────────────────────────────────────────────────
export const getTheoryFS   = () => getDocs(collection(db, 'theory'))
export const addTheoryFS   = (data) => addDoc(collection(db, 'theory'), { ...data, createdAt: serverTimestamp() })
export const updateTheoryFS = (id, data) => updateDoc(doc(db, 'theory', id), data)
export const deleteTheoryFS = (id) => deleteDoc(doc(db, 'theory', id))

// ── DIARIO ───────────────────────────────────────────────────
export const getDiaryByPatientFS = (patientCode) =>
  getDocs(query(collection(db, 'diary'), where('patientCode', '==', patientCode), orderBy('date', 'desc')))
export const getAllDiaryFS = () =>
  getDocs(query(collection(db, 'diary'), orderBy('date', 'desc')))
export const addDiaryFS    = (data) => addDoc(collection(db, 'diary'), { ...data, createdAt: serverTimestamp() })
export const deleteDiaryFS = (id) => deleteDoc(doc(db, 'diary', id))

// ── APPUNTAMENTI ─────────────────────────────────────────────
export const getAppointmentsFS = () =>
  getDocs(query(collection(db, 'appointments'), orderBy('date', 'asc')))
export const addAppointmentFS    = (data) => addDoc(collection(db, 'appointments'), { ...data, createdAt: serverTimestamp() })
export const deleteAppointmentFS = (id) => deleteDoc(doc(db, 'appointments', id))
