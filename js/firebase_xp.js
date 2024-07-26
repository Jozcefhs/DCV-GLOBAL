//export initializeApp, collection, configuration, etc
import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, initializeFirestore, addDoc, and, setDoc, collection, collectionGroup, deleteDoc, deleteField, disableNetwork, doc, enableNetwork, getCountFromServer, getDoc, getDocs, increment, limit, memoryLocalCache, onSnapshot, or, orderBy, persistentLocalCache, persistentMultipleTabManager, query, runTransaction, serverTimestamp, startAfter, updateDoc, where } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { getStorage, getDownloadURL, getBlob, ref, uploadBytes, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";

export function fbInitializer() {
    const firebaseConfig = {
        apiKey: "AIzaSyDW147JTSQ5DLcYIKppxOFOpcdC56umCsw",
        authDomain: "webmart-d7812.firebaseapp.com",
        projectId: "webmart-d7812",
        storageBucket: "webmart-d7812.appspot.com",
        messagingSenderId: "570156229824",
        appId: "1:570156229824:web:e119840f5621e13184f925",
        measurementId: "G-BN80W5M1EJ"
    };
    let app = initializeApp(firebaseConfig);
    // let db = getFirestore(app);
    return app;
}

export { deleteApp, addDoc, and, collection, deleteDoc, deleteField, doc, getCountFromServer, setDoc, getDoc, getDocs, limit, or, orderBy, query, serverTimestamp, startAfter, where };
export {disableNetwork, enableNetwork, getFirestore, increment, initializeFirestore, memoryLocalCache, onSnapshot, persistentLocalCache, persistentMultipleTabManager, runTransaction, updateDoc};
export { getStorage, getDownloadURL, getBlob, ref, uploadBytes, uploadBytesResumable };