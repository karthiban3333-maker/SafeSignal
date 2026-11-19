import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register company admin
  async function registerCompany(adminName, companyName, email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    const companyId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    // Create company doc
    await setDoc(doc(db, 'companies', companyId), {
      companyName,
      adminName,
      adminEmail: email,
      adminUid: uid,
      createdAt: serverTimestamp()
    });

    const newUser = {
      name: adminName,
      email,
      role: 'company_admin',
      companyId,
      fcmToken: '',
      mobile: ''
    };

    // Create user doc
    await setDoc(doc(db, 'users', uid), newUser);
    setUserData({ uid, ...newUser });

    return { uid, companyId };
  }

  // Register staff
  async function registerStaff(name, email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    const newUser = {
      name,
      email,
      role: 'staff',
      companyId: '',
      fcmToken: '',
      mobile: ''
    };

    await setDoc(doc(db, 'users', uid), newUser);
    setUserData({ uid, ...newUser });

    return uid;
  }

  // Set staff company
  async function setStaffCompany(uid, companyId) {
    await setDoc(doc(db, 'users', uid), { companyId }, { merge: true });
    setUserData(prev => ({ ...prev, companyId }));
  }

  // Login
  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Guest login
  async function guestLogin(name, roomNumber, mobile, companyId) {
    const cred = await signInAnonymously(auth);
    const uid = cred.user.uid;

    await setDoc(doc(db, 'guests', uid), {
      name,
      roomNumber,
      mobile,
      companyId,
      fcmToken: '',
      joinedAt: serverTimestamp()
    });

    const newUser = {
      name,
      role: 'guest',
      companyId,
      fcmToken: '',
      mobile
    };

    await setDoc(doc(db, 'users', uid), newUser);
    setUserData({ uid, ...newUser });

    return uid;
  }

  // Logout
  async function logout() {
    setUserData(null);
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData({ uid: user.uid, ...userDoc.data() });
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    registerCompany,
    registerStaff,
    setStaffCompany,
    login,
    guestLogin,
    logout,
    setUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
