import { addDoc, and, collection, doc, fbInitializer, getCountFromServer, getDoc, getDocs, getFirestore, limit, mainJSDoc, or, query, serverTimestamp, where } from "./firebase_xp.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-messaging.js";
const app = fbInitializer();
const db = getFirestore(app);
//register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../firebase-messaging-sw.js')
        .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
}

const messaging = getMessaging(app);
//Add public key generated from the console
getToken(messaging, {vapidKey: "BOBajgOp6r-0H6xWPZj29zqG3QjzZ2wU2aCEACEkkb06ohUshrBp0IWR8BVZucLsJASTpe4-E9taKmNots5tYeQ"}).then((currentToken) => {
    if (currentToken) {
        console.log(currentToken);
        // Send the token to your server and update the UI if necessary
        // ...
    } else {
        // Show permission request UI
        console.log('No registration token available. Request permission to generate one.');
    }
}).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
// ...
});

onMessage(messaging, (payload) => console.log("Message received: ", payload));

let ME = JSON.parse(localStorage.getItem('user'));

function searchUser() {
    if (ME?.profile.isSuperuser || ME?.profile.isStaffer) {
        window.location.href = `./u/${ME.profile.userPath}/htm/home.html`;
    } else {
        document.body.removeAttribute('style');
    };
}
searchUser();

const forms = document.forms;
//search form event
const searchInput = document.querySelector('input#search');
forms[0].addEventListener('submit', (e) => {
    e.preventDefault();
    const searchValue = searchInput.value;
    if (searchValue) window.location.href = `https://www.google.com/search?q=${searchValue}`;
});

const password = document.querySelectorAll('#pword');

//sign up form
forms[1].addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.classList.add('disabled');
    e.submitter.value = '. . .';
    const fd = new FormData(forms[1]);
    //match key
    const mstr = await getDoc(doc(db, 'users', mainJSDoc));
    const key = sha256(fd.get('key'));
    if (key != mstr.data().suk) {
        alert("Incorrect key.");
        e.submitter.classList.remove('disabled');
        e.submitter.value = 'SIGN UP';
        return;
    }
    //check for existing email
    const email = fd.get('email').trim();
    const foundEmail = await getCountFromServer(query(collection(db, 'users'), where('email', '==', email)));
    if (foundEmail.data().count) {
        alert("Email already exists.");
        e.submitter.classList.remove('disabled');
        e.submitter.value = 'SIGN UP';
        return;
    }
    // alert("Go ahead and create admin account.");
    fd.set('email', email);
    fd.set('pword', sha256(fd.get('pword').trim()));
    fd.delete('key');

    let obj = {
        createdOn: Date.now(),
        lastModified: serverTimestamp(),
        isSubscriber: false,
        isStaffer: false,
        isSuperuser: true,
        userPath: '0baea2f0ae20150db78f58cddac442a9',
    }
    for (const [i, j] of fd.entries()) {
        obj[i] = j;
    }
    const snapshot = await addDoc(collection(db, 'users'), obj);
    const newUser = await getDoc(doc(db, "users", snapshot.id));    
    localStorage.setItem('user', JSON.stringify({id: newUser.id, profile: newUser.data()}));
    ME = JSON.parse(localStorage.getItem('user'));
    searchUser();
});

//login form event
forms[2].addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.value = '. . .';
    e.submitter.classList.add('disabled');

    const fd = new FormData(e.target);
    const uname = fd.get('username');
    const pword = sha256(fd.get('password').trim());

    const q = query(collection(db, "users"), and(where('pword', '==', pword), or(where('uname', '==', uname), where('email', '==', uname))), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) {
        alert("Sorry. The username/password is wrong.");
        e.submitter.value = 'LOGIN';
        e.submitter.classList.remove('disabled');
        return;
    }
    localStorage.setItem('user', JSON.stringify({id: snap.docs[0].id, profile: snap.docs[0].data()}));
    ME = JSON.parse(localStorage.getItem('user'));
    searchUser();
});

//btns for sign up and login
const headerMenus = document.querySelectorAll('header .menu > span');
headerMenus.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector(btn.dataset.href).showModal();
    });
});

//close btns on dialogs
const closeBtns = document.querySelectorAll('.close');
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('dialog').close();
    });
});

//svg
const svgs = document.querySelectorAll('.fm_group > svg');
svgs.forEach(svg => {
    svg.addEventListener('click', (e) => {
        const parent = svg.closest('.fm_group');
        const input = e.target.parentNode.firstElementChild;
        input.type == 'password' ? parent.firstElementChild.setAttribute('type', 'text') : parent.firstElementChild.setAttribute('type', 'password');
        e.target.parentElement.querySelectorAll('svg').forEach(s => s.classList.toggle('opq'));
    });
});

// function salt(email) {
//     //salting to avoid password collision
//     return md5(email);
// }