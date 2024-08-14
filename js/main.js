import { and, collection, doc, fbInitializer, getDocs, getFirestore, limit, or, query, where } from "./firebase_xp.js";
const app = fbInitializer();
const db = getFirestore(app);

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

//login form event
forms[2].addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.value = '. . .';
    e.submitter.classList.add('disabled');

    const fd = new FormData(e.target);
    const uname = fd.get('username');
    const pword = fd.get('password');

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
//sign up and login btns
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