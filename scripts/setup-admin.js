// Admin Setup Script
// Run this once to create admin user in Firestore

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase config (same as your app)
const firebaseConfig = {
    apiKey: "AIzaSyBL83onFWj8psW6qER2RrTXbBPDMDXcACI",
    authDomain: "much-shop.firebaseapp.com",
    projectId: "much-shop",
    storageBucket: "much-shop.firebasestorage.app",
    messagingSenderId: "693565449450",
    appId: "1:693565449450:web:655f23fdbab20f1a102393"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = 'p@gmail.com';
const ADMIN_PASSWORD = 'chetan1234';

async function setupAdmin() {
    try {
        console.log('🔄 Creating admin user...');

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            ADMIN_EMAIL,
            ADMIN_PASSWORD
        );

        const user = userCredential.user;
        console.log('✅ Admin user created with UID:', user.uid);

        // Create admin document in Firestore
        await setDoc(doc(db, 'admins', user.uid), {
            admin: true,
            email: ADMIN_EMAIL,
            createdAt: new Date().toISOString()
        });

        console.log('✅ Admin document created in Firestore');
        console.log('\n🎉 Admin setup complete!');
        console.log('📧 Email:', ADMIN_EMAIL);
        console.log('🔑 Password:', ADMIN_PASSWORD);
        console.log('\n✨ You can now login and access /admin');

        process.exit(0);
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('ℹ️  Admin user already exists');
            console.log('If you need to mark them as admin in Firestore:');
            console.log('1. Go to Firebase Console');
            console.log('2. Firestore Database → admins collection');
            console.log('3. Create document with User UID as ID');
            console.log('4. Add field: admin = true');
        } else {
            console.error('❌ Error:', error.message);
        }
        process.exit(1);
    }
}

setupAdmin();
