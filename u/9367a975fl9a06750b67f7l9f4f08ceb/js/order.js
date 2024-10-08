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

//count number of orders
//re-structure this code to get the number of orders from ME.profile.orderCount, without having to make a call to the server
const orderRef = query(collectionGroup(db, "Orders"), where('uid', '==', ME.id), orderBy('orderDate'));
const orderSnap = await getCountFromServer(orderRef);
const orders = orderSnap.data().count;

console.log(`You have ${orders} orders.`);
let selectedOrder = 0;
const orderMenu = document.querySelector('.jsDateBtn + menu');
const ldmr_loader = document.querySelectorAll('#ldmr, #ldmr + div');
let myOrders = [], lastVisible;

if (orders) {
    findOrders();
}

async function findOrders () {
    let orderRefLmt;
    if (!lastVisible) {
        orderRefLmt = query(collectionGroup(db, "Orders"), where('uid', '==', ME.id), orderBy('orderDate', 'desc'), limit(10));
    } else {
        orderRefLmt = query(collectionGroup(db, "Orders"), where('uid', '==', ME.id), orderBy('orderDate', 'desc'), startAfter(lastVisible), limit(10));
    }
    
    const orderSnap = await getDocs(orderRefLmt);
    lastVisible = orderSnap.docs[orderSnap.docs.length - 1];
    // console.log(lastVisible);
    orderSnap.docs.forEach(order => {
        myOrders.push([order.id, order.data()]);
        //populate orderMenu with <li>
        const desc = order.data().desc.length > 50 ? order.data().desc.slice(0,50) + '...' : order.data().desc;
        ldmr.insertAdjacentHTML('beforebegin', `
            <li>
                <span>${desc}</span>
                <span>${new Intl.DateTimeFormat('en-GB').format(new Date(order.data().orderDate))}</span>
            </li>
        `);
    });
    jsDateBtn.parentElement.classList.remove('disabled');
    jsDateBtn.parentElement.style.pointerEvents = 'fill';
    const menuItems = document.querySelectorAll('section:nth-of-type(2) menu > li');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const lists = [...document.querySelectorAll('section:nth-of-type(2) menu > li')];
            const idx = lists.indexOf(item);
    
            if (item.id != 'ldmr') {
                selectedOrder = idx;
                jsDateBtn.innerText = e.target.firstElementChild.innerText;
                jsDateBtn.classList.remove('shw');
            }
        });
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

const viewOrderBtn = document.querySelector('#view-order-btn');
viewOrderBtn.addEventListener('click', () => {
    console.log(selectedOrder);
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
            section.querySelector('.table .stamp').style.visibility = 'hidden';
            confirmed(section, orderID, orderData, uname, phone, udate);
            break;
        case 2: //deposit
            section.querySelector('.table .stamp').style.visibility = 'visible';
            section.querySelector('.table .stamp').classList.add('is_deposit'), section.querySelector('.table .stamp').innerText = 'DEPOSIT';
            section.querySelector('.stat_btn').classList.add('ptl');
            confirmed(section, orderID, orderData, uname, phone, udate);
            break;
        case 3: //paid
            section.querySelector('.table .stamp').style.visibility = 'visible';
            section.querySelector('.table .stamp').classList.add('is_paid'), section.querySelector('.table .stamp').innerText = 'PAID';
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