import { and, collectionGroup, doc, fbInitializer, getCountFromServer, getDocs, getFirestore, limit, orderBy, query, where } from "../../../js/firebase_xp.js";
const app = fbInitializer();
const db = getFirestore(app);

const main = document.querySelector('main');
const jsDateBtn = document.querySelector('.jsDateBtn');
jsDateBtn.parentElement.style.pointerEvents = 'none'; //disable jsDateBtn until orders > 0
const tmp1 = document.getElementById('invTemp'); //invoice template
const tmp1Content = tmp1.content.cloneNode(true);
tmp1.remove();
const section = tmp1Content.querySelector('section');

const main_actionBtns = document.querySelectorAll('.actionBtns, .main'); //selecting the actionBtns containing more_icon & the main containing table
// '1011'.padStart(3,0); //use to set the order's serial no. (IVN)
const ME = JSON.parse(localStorage.user);

const orderRef = query(collectionGroup(db, "Orders"), where('uid', '==', ME.id), orderBy('orderDate')/*, limit(1)*/);
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

let selectedOrder = 0;
const menuItems = document.querySelectorAll('section:nth-of-type(2) menu > li:not(#ldmr)');
menuItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
        selectedOrder = idx;
        jsDateBtn.innerText = item.firstElementChild.innerText;
        /*
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
        */
       jsDateBtn.classList.remove('shw');
    });
});

const viewOrderBtn = document.querySelector('#view-order-btn');
viewOrderBtn.addEventListener('click', () => {
    const orderID = myOrders[selectedOrder][0];
    const orderData = myOrders[selectedOrder][1];
    main.querySelector('.jsSection')?.remove() || false;
    switch (orderData.status) {
        case 0:
            section.firstElementChild.innerHTML = `This order (refID: <strong>${orderID}</strong>) has not yet been confirmed. Thank you for your patience.`;
            main.insertAdjacentHTML('beforeend', `
                <section class="jsSection">
                    ${section.firstElementChild.outerHTML}
                </section>
            `);
            break;
    
        default:
            break;
    }
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
*/