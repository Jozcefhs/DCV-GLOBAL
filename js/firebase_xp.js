//export initializeApp, collection, configuration, etc
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, addDoc, and, setDoc, collection, collectionGroup, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, getDownloadURL, getBlob, ref, uploadBytes, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

export function fbInitializer() {
    const firebaseConfig = {
        apiKey: "AIzaSyCnGk02gQeUZ9nJeOBxHMk3jlC2_pG_jZo",
        authDomain: "flutterspace-d2385.firebaseapp.com",
        projectId: "flutterspace-d2385",
        storageBucket: "flutterspace-d2385.appspot.com",
        messagingSenderId: "979544012314",
        appId: "1:979544012314:web:c2eef86fccbae61f17c3a3",
        measurementId: "G-5E3NVV96HY"
    };
    let app = initializeApp(firebaseConfig);
    let db = getFirestore(app);
    return db;
}

export { addDoc, and, collection, doc, setDoc, getDoc, getDocs, limit, orderBy, query, where };
export { getStorage, getDownloadURL, getBlob, ref, uploadBytes, uploadBytesResumable };