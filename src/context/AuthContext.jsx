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
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import LoadingScreen from "../components/LoadingScreen";
import { getOrCreateUserProfile } from "../services/usersService";
import { setCartUser, loadCartFromFirestore } from "../services/cartService";

const AuthContext = createContext();

// Create Google provider
const googleProvider = new GoogleAuthProvider();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
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
            console.log('🔐 Auth state changed:', currentUser?.email || 'No user');

            setUser(currentUser);
            setUserProfile(null);
            setIsAdmin(false);

            if (currentUser) {
                try {
                    console.log('📝 Fetching user profile for:', currentUser.uid);

                    // Get or create user profile in Firestore
                    const profile = await getOrCreateUserProfile(currentUser.uid, {
                        email: currentUser.email,
                        name: currentUser.displayName || '',
                        photoURL: currentUser.photoURL
                    });

                    console.log('✅ Profile loaded:', profile);
                    console.log('👤 User role:', profile?.role);

                    setUserProfile(profile);

                    // Check if user is admin from profile role
                    if (profile?.role === 'admin') {
                        console.log('👑 USER IS ADMIN - Setting isAdmin to TRUE');
                        setIsAdmin(true);
                    } else {
                        console.log('👤 User is not admin, checking admins collection...');
                        // Fallback: check admins collection
                        const adminDoc = await getDoc(doc(db, "admins", currentUser.uid));
                        if (adminDoc.exists()) {
                            console.log('👑 Found in admins collection - Setting isAdmin to TRUE');
                            setIsAdmin(true);
                        } else {
                            console.log('❌ Not found in admins collection - isAdmin remains FALSE');
                        }
                    }
                } catch (error) {
                    console.error('❌ Error fetching user profile:', error);
                    console.warn('Unable to fetch user profile:', error.message);
                }
            } else {
                console.log('🚪 User logged out');
            }

            console.log('✅ Auth loading complete');
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
            userProfile,
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
