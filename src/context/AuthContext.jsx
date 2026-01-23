import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import LoadingScreen from "../components/LoadingScreen";

const AuthContext = createContext();

// Create Google provider
const googleProvider = new GoogleAuthProvider();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Timeout fallback - prevent infinite loading
        const timeout = setTimeout(() => {
            if (loading) {
                console.warn('⚠️ Auth initialization timeout (5s) - proceeding without auth');
                setLoading(false);
            }
        }, 5000);

        const unsub = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setIsAdmin(false);

            if (currentUser) {
                try {
                    const adminDoc = await getDoc(doc(db, "admins", currentUser.uid));
                    if (adminDoc.exists()) setIsAdmin(true);
                } catch (error) {
                    // Silently handle offline errors - user is not admin if we can't check
                    console.warn('Unable to check admin status (offline or network error):', error.message);
                }
            }

            setLoading(false);
            clearTimeout(timeout);
        });

        return () => {
            unsub();
            clearTimeout(timeout);
        };
    }, []);

    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function loginWithGoogle() {
        return signInWithPopup(auth, googleProvider);
    }

    function signout() {
        return signOut(auth);
    }

    // Helper to check if user can place orders (not anonymous)
    function isCompleteUser() {
        return user && !user.isAnonymous;
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAdmin,
            loading,
            signup,
            login,
            loginWithGoogle,
            signout,
            isCompleteUser
        }}>
            {loading ? <LoadingScreen /> : children}
        </AuthContext.Provider>
    );
}
