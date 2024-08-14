import { fbInitializer, getFirestore, collectionGroup, getDocs, orderBy, query, startAfter, where, getCountFromServer } from "../../../js/firebase_xp.js";
const app = fbInitializer();
const db = getFirestore(app);

let ME = JSON.parse(localStorage.getItem('user'));
//count New orders
window.addEventListener('load', async () => {
    const orderNoticeElem = document.querySelector('.order .number');
    orderNoticeElem.classList.add('searching');
    const orderRef = query(collectionGroup(db, "Orders"), where('status', '==', 0));
    const orders = await getCountFromServer(orderRef);
    orderNoticeElem.classList.replace('searching', 'searched');
    document.querySelector('.number > i').innerText = orders.data().count;
});

let activeMenu;
//toggle context menus off
window.addEventListener('click', (e) => {
    if (activeMenu) activeMenu.classList.remove('show');
}, true);

//setting up user profile
const userProfile = document.querySelector('#user-profile');

userProfile.querySelector('#user-bio').firstElementChild.innerText = ME.profile.uname;
userProfile.querySelector('#user-bio').lastElementChild.innerText = ME.profile.email;
const userPhoto = document.querySelector('#user-photo');
userPhoto.addEventListener('click', (e) => {
    userProfile.classList.toggle('show');
    activeMenu = userProfile;
}, true);

//logout function
const logoutBtn = document.querySelector('div#logout');
logoutBtn.addEventListener('click', (e) => {
    //remove ls
    localStorage.removeItem('user');
    //reload index.html
    document.location.replace('../../../main.html');
});

const dialog = document.querySelector("#frame-holder");
const iframe = dialog.querySelector("iframe");
const frameTitle = dialog.querySelector(".frame_title");
const cards = document.querySelectorAll(".card");
cards.forEach((card, idx) => {
    card.addEventListener("click", (e) => {
        frameTitle.innerText = card.querySelector("p").innerText;
        dialog.showModal();
        const visited = card.classList.contains("on");
        if (!visited) {
            for (let c = 0; c < cards.length; c++) cards[c].classList.toggle("on", card.dataset.cardNumber == c);
            iframe.src = card.dataset.href;
        }
    });
});

const barBtn = document.querySelector(".bar_btn");
barBtn.onclick = () => {
    barBtn.closest("dialog").close();
}