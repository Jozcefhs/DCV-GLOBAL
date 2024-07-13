// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, addDoc, setDoc, collection, collectionGroup, doc, getDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
//   import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyCnGk02gQeUZ9nJeOBxHMk3jlC2_pG_jZo",
authDomain: "flutterspace-d2385.firebaseapp.com",
projectId: "flutterspace-d2385",
storageBucket: "flutterspace-d2385.appspot.com",
messagingSenderId: "979544012314",
appId: "1:979544012314:web:c2eef86fccbae61f17c3a3",
measurementId: "G-5E3NVV96HY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const colGroup = await getDocs(collectionGroup(db, "products"));
colGroup.docs.forEach(d => {
    console.log(d.data())
    console.log(d.id)
})
/*
const snapshot = await addDoc(collection(db, "category", "textbooks", "products"), {
    items: 0,    //use to count how many products are registered to a particular category, e.g. stationery
    createdAt: Date.now(),
    timestamp: serverTimestamp(),
});
*/
//toggle hamburger on or off
const nav = document.querySelector("nav");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");

navTogglers.forEach(toggler => {
    toggler.addEventListener("click", (e) => {
        if (toggler.dataset.navToggler == 'io') {//input/output
            nav.classList.toggle("active");
            return;
        }
        nav.classList.toggle("active", false);
    });
});