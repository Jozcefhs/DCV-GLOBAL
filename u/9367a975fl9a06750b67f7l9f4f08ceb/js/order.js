import { and, collectionGroup, doc, fbInitializer, getCountFromServer, getDocs, getFirestore, limit, orderBy, query, startAfter, where } from "../../../js/firebase_xp.js";
const app = fbInitializer();
const db = getFirestore(app);

let activeMenu;

const main = document.querySelector('main');
const jsDateBtn = document.querySelector('.jsDateBtn');
const ldmr = document.querySelector('#ldmr');
jsDateBtn.parentElement.style.pointerEvents = 'none'; //disable jsDateBtn until orders > 0
const tmp1 = document.getElementById('invTemp'); //invoice template
const tmp1Content = tmp1.content.cloneNode(true);
tmp1.remove();
const section = tmp1Content.querySelector('section');

window.addEventListener('click', (e) => {
    if (e.target.id == 'ldmr') return;
    if (activeMenu) activeMenu.classList.remove('shw');
}, true);

const moreIcon = section.querySelector('div .more_icon');
moreIcon.addEventListener('click', (e) => {
    e.target.nextElementSibling.classList.toggle('shw');
    activeMenu = e.target.nextElementSibling;
});

const invoiceMenu = moreIcon.nextElementSibling.querySelectorAll('li');
invoiceMenu.forEach((btn, idx) => {
    btn.addEventListener('click', e => {
        if (idx == 0) {
            window.print();
        } else if (idx == 1) {
            downloadPDF();
        }
    });
});

function downloadPDF() {
        const mycanvas = document.querySelector('canvas#mycanvas');
        const main = document.querySelector('main');
        const dh = main.clientHeight;
        const dw = main.clientWidth;
        console.log(dh, dw);
        var opt = {
            margin: 20,
            filename: 'mypdf.pdf',
            html2canvas: { scale: 1, canvas: mycanvas },
            jsPDF: { unit: 'px', format: [dw, dh], orientation: 'portrait', hotfixes: ['px_scaling'] }
        }

        html2pdf().set(opt).from(main).save();
}

const ME = JSON.parse(localStorage.user);
const phone = ME.profile.phone;

const orderRef = query(collectionGroup(db, "Orders"), where('uid', '==', ME.id), orderBy('orderDate'));
const orderSnap = await getCountFromServer(orderRef);
const orders = orderSnap.data().count;

console.log(`You have ${orders} orders.`)
const orderMenu = document.querySelector('.jsDateBtn + menu');
const ldmr_loader = document.querySelectorAll('#ldmr, #ldmr + div');
let myOrders = [], lastVisible;

if (orders) {
    findOrders();
}

async function findOrders () {
    let orderRefLmt;
    if (!lastVisible) {
        orderRefLmt = query(collectionGroup(db, "Orders"), where('uid', '==', ME.id), orderBy('orderDate'), limit(1));
    } else {
        orderRefLmt = query(collectionGroup(db, "Orders"), where('uid', '==', ME.id), orderBy('orderDate'), startAfter(lastVisible), limit(1));
    }
    jsDateBtn.parentElement.classList.remove('disabled');
    jsDateBtn.parentElement.style.pointerEvents = 'fill';
    const orderSnap = await getDocs(orderRefLmt);
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
    if (myOrders.length == orders) ldmr_loader.forEach(ldmrLoader => ldmrLoader.remove());  //remove LOAD MORE btn
}

//load more items
ldmr.addEventListener('click', async (e) => {
    ldmr.classList.add('swap');
    await findOrders();
    ldmr.classList.remove('swap');
});

jsDateBtn.addEventListener('click', (e) => {
    e.target.classList.toggle('shw');
    activeMenu = e.target;
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
    const sn = String(selectedOrder + 1).padStart(3,0);
    const orderID = `IVN: ${myOrders[selectedOrder][0]}-${sn}`;
    const orderData = myOrders[selectedOrder][1];
    const uname = orderData.uname;
    const udate = 'ISSD: ' + new Intl.DateTimeFormat('en-GB').format(new Date(orderData.orderDate));

    main.querySelector('section:nth-of-type(3)')?.remove() || false;
    switch (orderData.status) {
        case 0: //unconfirmed
            section.querySelector('.stat_btn').classList.remove('ptl');
            section.querySelector('.stat_btn + span').innerHTML = `This order (<b>${orderID}</b>) has not yet been confirmed. Thank you for your patience.`;
            main.insertAdjacentHTML('beforeend', `
                <section>
                    ${section.firstElementChild.outerHTML}
                </section>
            `);
            break;
        case 1: //confirmed
            section.querySelector('.tfoot .stamp').style.visibility = 'hidden';
            confirmed(section, orderID, orderData, uname, phone, udate);
            break;
        case 2: //deposit
            section.querySelector('.tfoot .stamp').style.visibility = 'visible';
            section.querySelector('.tfoot .stamp').classList.add('is_deposit'), section.querySelector('.tfoot .stamp').innerText = 'DEPOSIT';
            section.querySelector('.stat_btn').classList.add('ptl');
            confirmed(section, orderID, orderData, uname, phone, udate);
            break;
        case 3: //paid
            section.querySelector('.tfoot .stamp').style.visibility = 'visible';
            section.querySelector('.tfoot .stamp').classList.add('is_paid'), section.querySelector('.tfoot .stamp').innerText = 'PAID';
            section.querySelector('.stat_btn').classList.add('fll');
            confirmed(section, orderID, orderData, uname, phone, udate);
            break;
        default:
            break;
    }
});

function confirmed (section, orderID, orderData, uname, phone, udate) {
    const disc = orderData?.discount || 0;
    section.querySelector('.stat_btn + span').innerHTML = `This order (<b>${orderID}</b>) has been confirmed and reviewed. See details in the table below.`;
    section.querySelectorAll('.details div > *').forEach((chdrn, ix) => chdrn.innerText = [uname, phone, orderID, udate][ix]);
    const tds = Object.values(orderData.oid);
    const tbody = section.querySelector('tbody');
    tbody.innerHTML = '';
    let subt = 0;
    tds.forEach((td, ix) => {
        const p = Number(td[1]);
        const q = Number(td[2]);
        const t = p * q;
        tbody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${ix + 1}</td>
                <td>${td[0]}</td>
                <td>${p}</td>
                <td>${q}</td>
                <td>${t}</td>
            </tr>
        `);
        subt += t;
    });
    let depo = 0;
    if (orderData.status == 2) { //deposit
        depo = orderData?.deposit;
    } else if (orderData.status == 3) { //paid
        depo = subt - disc;
    }
    section.querySelectorAll("#stDiv, #disc, #gtDiv, #pdDiv, #balDiv").forEach((chdrn, ix) => chdrn.lastElementChild.innerText = [subt,disc,(subt - disc), depo, (subt - disc - depo)][ix]);
    main.appendChild(section);
}
