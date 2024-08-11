import { fbInitializer, getFirestore, collectionGroup, getDocs, orderBy, query, startAfter, where, doc, updateDoc, increment, writeBatch } from "../../../js/firebase_xp.js";
const app = fbInitializer();
const db = getFirestore(app);

const main = document.querySelector('main');
const aside = document.querySelector('aside');
const section = document.querySelector('section');
const table = section.querySelector('table');
const tbody = table.querySelector('tbody');
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
const subMenu = document.querySelector('.submenu');
const asideTemplate = aside.querySelector('template');
const navBtns = document.querySelectorAll('nav > a');
let docArray, docIds, lastVisible, reviewData, username, prevDiscount = 0;
navBtns.forEach((navBtn, index) => {
    navBtn.addEventListener('click', async (e) => {
        navBtns.forEach((btn, idx) => btn.classList.toggle('active', index === idx));
        aside.classList.add('ldg');
        tbody.innerHTML = '', table.querySelector('tfoot tr:last-child td:last-child').innerHTML = '&#8358; 0';   //clear tbody and tfoot
        subMenu.style.visibility = 'hidden';
        docArray = [], docIds = [];  //empty docArray
        const discVal = document.getElementById('discount');
        discVal.value = '', prevDiscount = 0;  //reset discounts
        //query collectionGroup for [new orders | reviewed orders | fulfilled orders]
        
        const newOrders = query(collectionGroup(db, 'Orders'), where('status', '==', Number(navBtn.dataset.status)), orderBy('orderDate', 'desc')); //limit(20)
        const querySnapshot = await getDocs(newOrders);
        // console.log(querySnapshot.size)
        document.querySelectorAll("aside > *:not(div.download_more, template)").forEach(elem => elem.remove());
        if (querySnapshot.empty) return alert("No order exists for this context.");
        lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        querySnapshot.forEach(doc => {
            docIds.push(doc.id);
            docArray.push(doc.data());
            const clone = asideTemplate.content.cloneNode(true);
            clone.querySelector('.usr').style.backgroundColor = doc.data().hex;
            clone.querySelector('.usr').id = doc.data().uid;
            clone.querySelector('.abbr').textContent = doc.data().alias;
            clone.querySelector('.name').textContent = doc.data().uname;
            clone.querySelector('.date').textContent = new Intl.DateTimeFormat('en-US').format(new Date(doc.data().orderDate));
            aside.appendChild(clone);
        });
        for (let s = 0; s < querySnapshot.size; s++) {
            document.querySelectorAll('.card')[s].addEventListener('click', (e) => {
                document.querySelectorAll('.card').forEach(card => card.classList.toggle('active', card == e.target));
                username = e.target.lastElementChild.firstElementChild.textContent;
                prevBtn.click();    //for mobile responsive design
                subMenu.style.visibility = 'visible';
                tbody.innerHTML = '', reviewData = docArray[s].oid;
                document.querySelector('.submenu > menu').id = docIds[s];
                document.querySelector('.submenu > menu').setAttribute('data-uid', e.target.firstElementChild.id);
                let items = Object.entries(docArray[s].oid);
                let c = 1;
                for (let [k, v] of items) {
                    const i = v[0];
                    const p = v[1];
                    const q = v[2];
                    tbody.insertAdjacentHTML('beforeend', `
                        <tr>
                            <td>${c++}</td>
                            <td>${i}</td>
                            <td>${p}</td>
                            <td><input type='number' id='${k}' name='${i}' placeholder='Qty' value='${q}' data-price='${p}' min='0'/></td>
                            <td>${p * q}</td>
                        </tr>
                    `);
                }
                const discVal = document.getElementById('discount');
                discVal.value = docArray[s]?.discount || '', prevDiscount = 0;  //reset discounts
                const grandtotal = [...tbody.querySelectorAll('tr td:last-child')].map(x => Number(x.innerText)).reduce((a, c) => a + c);
                const tfootGT = table.querySelector('tfoot tr:last-child td:last-child');
                tfootGT.innerHTML = `&#8358; ${grandtotal - Number(discVal.value)}`;

                //td input change event
                const QtyInputs = document.querySelectorAll('td > input');
                QtyInputs.forEach(input => {
                    input.addEventListener('change', (e) => {
                        const id = e.target.id;
                        const i = e.target.name;
                        const q = e.target.value;
                        const p = e.target.dataset.price;
                        if (id == 'discount') {
                            const tfootGT = table.querySelector('tfoot tr:last-child td:last-child');
                            const grandVal = Number((table.querySelector('tfoot tr:last-child td:last-child').textContent).slice(2));
                            tfootGT.innerHTML = `&#8358; ${grandVal + prevDiscount - Number(discVal.value)}`;
                            prevDiscount = Number(discVal.value);
                            return;
                        }
                        reviewData[id] = [i, p, q];
                        const td = e.target.parentElement.nextElementSibling;
                        td.innerText = q * p;
                        const grandtotal = [...tbody.querySelectorAll('tr td:last-child')].map(x => Number(x.innerText)).reduce((a, c) => a + c);
                        const tfootGT = table.querySelector('tfoot tr:last-child td:last-child');
                        tfootGT.innerHTML = `&#8358; ${grandtotal - Number(discVal.value)}`;
                    });
                });
            });
        }
        aside.classList.remove('ldg');
    });
});

//more downloads
const downloadBtn = document.querySelector('div.download_more');
downloadBtn.addEventListener('click', async (e) => {
    const status = document.querySelector('nav > a.active').dataset.status;
    const newOrders = query(collectionGroup(db, 'Orders'), where('status', '==', status), startAfter(lastVisible), orderBy('orderDate', 'desc')); //limit(20)
    const querySnapshot = await getDocs(newOrders);
    lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    querySnapshot.forEach(doc => {
        docArray.push(doc.data());
        const clone = asideTemplate.content.cloneNode(true);
        clone.querySelector('.usr').style.backgroundColor = doc.data().hex;
        clone.querySelector('.abbr').textContent = doc.data().alias;
        clone.querySelector('.name').textContent = doc.data().uname;
        clone.querySelector('.date').textContent = new Intl.DateTimeFormat('en-GB').format(new Date(doc.data().orderDate));

        clone.addEventListener('click', (e) => {
            console.log('my clone');
        });
        aside.appendChild(clone);
    });
    aside.classList.remove('ldg');
    //hide downloadBtn at the end
});

//order-form
// const orderForm = document.querySelector('#order-form');
// orderForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const fd = new FormData(orderForm);
//     for (const [k, v] of fd.entries()) {
//         console.log(k, v, 'end');
//     }
// });

//menu btns
let orderParams;
const menuBtns = document.querySelectorAll('.submenu menu > li');
menuBtns.forEach((menuBtn, ix) => {
    menuBtn.addEventListener('click', async (e) => {
        const uid = e.target.parentElement.dataset.uid;
        const oid = e.target.parentElement.id;
        const customers = document.getElementsByClassName('customer');
        for (let c = 0; c < customers.length; c++) customers.item(c).textContent = username;
        if (ix == 0) {
            orderParams = [uid, oid, 1];    //1 reps reviewed order
            document.querySelector("#reviewed-dialog").showModal();
        } else if (ix == 1) {
            orderParams = [uid, oid, 2];    //2 reps partly-paid invoice
            document.querySelector("#part-invoice-dialog").showModal();
        } else if (ix == 2) {
            orderParams = [uid, oid, 3];    //3 reps fully-paid invoice
            document.querySelector("#full-invoice-dialog").showModal();
        }
    });
});

document.addEventListener('timeout', () => {
    alert("The timer has timed out.");
})
const fidYesBtn = document.querySelectorAll('dialog .jsYesBtn');
fidYesBtn.forEach(btn => {
    btn.addEventListener('click', (e) => {
        confirmOrder(...orderParams, e.target.closest('div.wrapper'));
    });
});

async function confirmOrder(uid, oid, stat, loadingElem) {
    const deposit = Number(document.querySelector('input#bal').value) || 0;
    console.log('deposit', deposit);
    
    loadingElem.classList.replace('stg01', 'stg02');
    const batch = writeBatch(db);
    const orderRef = doc(db, "users", uid, "Orders", oid);
    batch.update(orderRef, {'oid': reviewData, 'status': stat, 'discount': prevDiscount, 'deposit': deposit}); // use batch.set.merge:true if update doesn't work for discount

    const entr = Object.entries(reviewData);
    const prom = entr.map(async (el, ix) => {
        const pid = el[0];
        const qty = Number(el[1][2]);
        batch.update(doc(db, "products", pid), {'qty': increment(-qty)});
    });
    await batch.commit();
    loadingElem.classList.replace('stg02', 'stg03');
}