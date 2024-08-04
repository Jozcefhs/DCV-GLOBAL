import { and, collectionGroup, doc, fbInitializer, getCountFromServer, getDocs, getFirestore, limit, orderBy, query, where } from "../../../js/firebase_xp.js";
const app = fbInitializer();
const db = getFirestore(app);

const jsDateBtn = document.querySelector('.jsDateBtn');
jsDateBtn.parentElement.style.pointerEvents = 'none'; //disable jsDateBtn until orders > 0
const tmp1 = document.getElementById('invTemp'); //invoice template
const tmp1Content = tmp1.content.cloneNode(true);
tmp1.remove();
const section = tmp1Content.querySelector('section');

const main_actionBtns = document.querySelectorAll('.actionBtns, .main'); //selecting the actionBtns containing more_icon & the main containing table
// '1011'.padStart(3,0); //use to set the order's serial no. (IVN)
const ME = JSON.parse(localStorage.user);

const orderRef = query(collectionGroup(db, "Orders"), where('uid', '==', ME.id), orderBy('orderDate', 'desc')/*, limit(1)*/);
const orderSnap = await getCountFromServer(orderRef);
const orders = orderSnap.data().count;

console.log(`You have ${orders} orders.`)
const orderMenu = document.querySelector('.jsDateBtn + menu');
const ldmr_loader = document.querySelectorAll('#ldmr, #ldmr + div');
let myOrders = [], lastVisible;
if (orders) {
    jsDateBtn.parentElement.classList.remove('disabled');
    jsDateBtn.parentElement.style.pointerEvents = 'fill';
    const orderSnap = await getDocs(orderRef);
    lastVisible = orderSnap.docs[orderSnap.docs.length - 1];
    // console.log(lastVisible);
    orderSnap.docs.forEach(order => {
        myOrders.push([order.id, order.data()]);
        //populate orderMenu with <li>
        orderMenu.insertAdjacentHTML('afterbegin', `
            <li>
                <span>${order.data().uid}</span>
                <span>${new Intl.DateTimeFormat('en-GB').format(new Date(order.data().orderDate))}</span>
            </li>
        `);
    });
    if (myOrders.length == orders) ldmr_loader.forEach(ldmrLoader => ldmrLoader.remove());  //hide LOAD MORE btn
}

let activeMenu;

jsDateBtn.addEventListener('click', (e) => {
    e.target.classList.toggle('shw');
    // activeMenu = e.target;
});


// const myOrders = ''
/*
window.addEventListener('click', (e) => {
    if (activeMenu) activeMenu.classList.remove('shw');
}, true);
const moreIcon = document.querySelector('.more_icon');
moreIcon.onclick = (e) => {
    e.target.nextElementSibling.classList.toggle('shw');
    activeMenu = e.target.nextElementSibling;
}
const menuItems = document.querySelectorAll('section:nth-of-type(2) menu > li');
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        if (!(item.id === 'ldmr')) {
            jsDateBtn.innerText = item.innerText;
            jsDateBtn.classList.remove('shw');
        } else {
            item.classList.add('swap');
            for (let i = 0; i < 5; i++) { //getOrderCountFromServer to use in the cursor
                document.querySelector('.jsDateBtn + menu').insertAdjacentHTML('afterbegin', `
                    <li>
                        <span>The description of an order from customer 002</span>
                        <span>11/11/1800</span>
                    </li>
                `);
            }
            const id = setTimeout(() => {
                item.classList.remove('swap');
                clearInterval(id);
            }, 8000);
        }
        // jsDateBtn.classList.remove('shw');
    });
});
*/