// import { addDoc, and, collection, deleteField, doc, fbInitializer, getCountFromServer, getDoc, getDocs, getFirestore, increment, limit, or, orderBy, query, runTransaction, serverTimestamp, setDoc, startAfter, updateDoc, where, writeBatch } from "./firebase_xp.js";
// const app = fbInitializer();
// const db = getFirestore(app);
// const batch = writeBatch(db);
const main = document.querySelector('main');
const downloadBtn = document.querySelector('div.download_more');
const aside = document.querySelector('aside');
aside.addEventListener('scrollend', (e) => {
    // console.log(e.target.clientHeight, e.target.scrollHeight);
    // console.log(e.target.scrollTop);
});
//prev_btn
const prevBtn = document.querySelector('div.prev_btn');
prevBtn.addEventListener('click', (e) => {
    prevBtn.classList.toggle('clk');
    main.classList.toggle('shw');
})
//nav btns
const asideTemplate = aside.querySelector('template');
const navBtns = document.querySelectorAll('nav > a');
navBtns.forEach((navBtn, index) => {
    navBtn.addEventListener('click', (e) => {
        navBtns.forEach((btn, idx) => btn.classList.toggle('active', index === idx));
        aside.classList.add('ldg');
        prevBtn.classList.remove('clk'), main.classList.remove('shw');
        document.querySelectorAll("aside > *:not(div.download_more, template)").forEach(elem => elem.remove());
        //query collectionGroup for [new orders | reviewed orders | fulfilled orders]
        for (let x = 0; x < 3; x++) {
            const clone = asideTemplate.content.cloneNode(true);
            clone.querySelector('.abbr').textContent = 'AB';
            clone.querySelector('.name').textContent = 'Kevin Lowell Hart';
            clone.querySelector('.date').textContent = '12/08/1989';
            aside.appendChild(clone);
        }
        aside.classList.remove('ldg');
    });
})
//menu btns
const menuBtns = document.querySelectorAll('.submenu menu > li');
menuBtns.forEach(menuBtn => {
    menuBtn.addEventListener('click', (e) => {
        console.log(e.target.innerText);
    });
});