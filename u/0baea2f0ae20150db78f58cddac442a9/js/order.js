import { fbInitializer, getFirestore, collectionGroup, getDocs, orderBy, query, startAfter, where, doc, updateDoc, increment, writeBatch } from "../../../js/firebase_xp.js";
const app = fbInitializer();
const db = getFirestore(app);
const batch = writeBatch(db);

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
const asideTemplate = aside.querySelector('template');
const navBtns = document.querySelectorAll('nav > a');
let docArray, docIds, lastVisible, reviewData;
navBtns.forEach((navBtn, index) => {
    navBtn.addEventListener('click', async (e) => {
        navBtns.forEach((btn, idx) => btn.classList.toggle('active', index === idx));
        aside.classList.add('ldg');
        // prevBtn.classList.remove('clk'), main.classList.remove('shw');
        docArray = [], docIds = [];  //empty docArray
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
                prevBtn.click();
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
                const grandtotal = [...tbody.querySelectorAll('tr td:last-child')].map(x => Number(x.innerText)).reduce((a, c) => a + c);
                const tfoot = table.querySelector('tfoot tr td:last-child');
                tfoot.innerHTML = `&#8358 ${grandtotal}`;

                //td input change event
                const QtyInputs = document.querySelectorAll('td > input');
                QtyInputs.forEach(input => {
                    input.addEventListener('change', (e) => {
                        const id = e.target.id;
                        const i = e.target.name;
                        const q = e.target.value;
                        const p = e.target.dataset.price;
                        reviewData[id] = [i, p, q];
                        e.target.parentElement.nextElementSibling.innerText = q * p;
                        const grandtotal = [...tbody.querySelectorAll('tr td:last-child')].map(x => Number(x.innerText)).reduce((a, c) => a + c);
                        const tfoot = table.querySelector('tfoot tr td:last-child');
                        tfoot.innerHTML = `&#8358 ${grandtotal}`;
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
        clone.querySelector('.date').textContent = new Intl.DateTimeFormat('en-US').format(new Date(doc.data().orderDate));

        clone.addEventListener('click', (e) => {
            console.log('my clone');
        });
        aside.appendChild(clone);
    });
    aside.classList.remove('ldg');
    //hide downloadBtn at the end
});

//order-form
const orderForm = document.querySelector('#order-form');
orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(orderForm);
    for (const [k, v] of fd.entries()) {
        console.log(k, v, 'end');
    }
});

//menu btns
const messengerDialog = document.querySelector('dialog#messenger');
const menuBtns = document.querySelectorAll('.submenu menu > li');
menuBtns.forEach((menuBtn, ix) => {
    menuBtn.addEventListener('click', async (e) => {
        // messengerDialog.showModal();
        //messengerDialog takes the following:
        const uid = e.target.parentElement.dataset.uid;
        const oid = e.target.parentElement.id;

        const orderRef = doc(db, "users", uid, "Orders", oid);
        batch.update(orderRef, {'oid': reviewData, 'status': 1});
    
        const entr = Object.entries(reviewData);
        const prom = entr.map(async (el, ix) => {
            const pid = el[0];
            const qty = Number(el[1][2]);
            batch.update(doc(db, "products", pid), {'qty': increment(-qty)});
        });
        await batch.commit();
        window.alert("Document has been updated.");
    });
});