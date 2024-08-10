import { addDoc, and, collection, deleteField, doc, fbInitializer, getCountFromServer, getDoc, getDocs, getFirestore, increment, limit, or, orderBy, query, runTransaction, serverTimestamp, setDoc, startAfter, updateDoc, where, writeBatch } from "./firebase_xp.js";
const app = fbInitializer();
const db = getFirestore(app);
const batch = writeBatch(db);

const untemplatedMain = document.querySelectorAll("main > *:not(template)");
const main = document.querySelector("main");
const cardTemplate = document.querySelector("template");

//check if user is available, then update image icon, cart. Else, display LOG IN.
const userCart = document.querySelectorAll('.top .cart, #user-pic');
let ss_user = JSON.parse(localStorage.getItem("user"));
const topNavAnchors = document.querySelectorAll('.topnav > a');
topNavAnchors.forEach((anchor, idx) => {
    anchor.addEventListener('click', e => {
        e.preventDefault();
        if (ss_user) {
            location.assign(["./u/9367a975fl9a06750b67f7l9f4f08ceb/htm/order.html", "#"][idx]);
        } else {
            notLoggedInNotice.classList.add('show');
        }
    });
});
if (ss_user) {
    const cartLen = Object.entries(ss_user.profile.cart).length;
    userPresenceIndicator(cartLen);    
}

const checkoutForm = document.querySelector('#checkout-form');
let orderDesc;
const orderDescDial = document.querySelector('dialog#order-desc-dialog');
const orderDescForm = document.querySelector('form#order-desc-form');
const orderDescInp = document.querySelector('input#orderDesc');
// orderDescForm.addEventListener('input', (e) => {
//     console.log(e.type);
//     orderDesc = e.target.value;
// });
orderDescForm.addEventListener('submit', (e) => {
    e.preventDefault();
    orderDesc = orderDescInp.value //to be sliced, if longer than 30 chars (e.g. orderDescInp.value.slice(0,30));
    orderDescDial.close();
    checkoutForm.requestSubmit(); //if this doesn't work, then globalize checkoutbtn, and call the click() method on it.
});

//close dialog with the dataset id of the Close btn
const closeDialogBtns = document.querySelectorAll('.close_dial');
closeDialogBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.getElementById(e.target.dataset.dialId).close();
    });
});

let activeMenu;
const notLoggedInNotice = document.querySelector("div.nli");
const notice = document.querySelector('div.notice');
const userProfile = document.querySelector('#user-profile');
//function to indicate user has logged in
function userPresenceIndicator(cart_len) {
    const checkoutForm = document.querySelector('#checkout-form');
    const checkoutBtn = document.querySelector('#checkout-btn > span');
    document.querySelector('div.cart > i').textContent = cart_len;
    document.querySelector('header > .top').classList.add('usr');
    
    const section = document.querySelector('section');
    //capture and clone cart-temp
    // const cartBtn = document.querySelector('.top .cart'); //for displaying <section>
    userCart[0].addEventListener('click', async (e) => {
        ss_user = JSON.parse(localStorage.getItem('user'));
        if (Object.entries(ss_user.profile.cart).length) {

            section.firstElementChild.style.display = 'none';
            const untemplatedCart = section.querySelectorAll('form > *:not(#cart-temp)');
            untemplatedCart.forEach(cart => cart.remove());//clear cart
            section.style.transform = 'translateY(0)';
            //might want to first clear main (main.innerHTML = '') in case of out-of-memory error
            //load user profile cart
            let totalPrice = 0, result = [];
            const pids = Object.keys(ss_user.profile.cart);
            const p = pids.map(async pid => {
                const snapshot = await getDoc(doc(db, "products", pid));
                result.push({id: pid, n: snapshot.data().name, p: Number(snapshot.data().price)});
            });
            await Promise.all(p);
            section.firstElementChild.style.display = 'flex';
            result.forEach(({n, p, id}, idx) => {
                totalPrice += p;
                const cartTempClone = document.querySelector('#cart-temp').content.cloneNode(true);
                const elem = cartTempClone.querySelectorAll('.serial, .fxl, .fxr');
                elem[0].textContent = idx + 1;
                elem[1].children[0].textContent = n;
                elem[1].children[1].querySelector('span').textContent = p;
                elem[1].children[2].name = id, elem[1].children[2].dataset.ppu = p;
                elem[1].children[3].name = id, elem[1].children[4].name = id;
                elem[1].children[3].value = n, elem[1].children[4].value = p;
                elem[2].children[0].querySelector('span').textContent = p;
                checkoutForm.appendChild(cartTempClone);
            });
            checkoutBtn.textContent = totalPrice;
        } else {
            alert("Your cart is empty.");
        }
        //set 'currCart' global variable to the length of the cart; 
    });
    userCart[1].addEventListener('click', () => {
        ss_user = JSON.parse(localStorage.getItem('user'));
        if (ss_user) {
            if (ss_user.profile.isSubscriber) {
                //LATER, THIS SHOULD LEAD TO FUTURE SUBSCRIBER'S PROFILE PAGE
                //set up the user profile
                userProfile.querySelector('#user-bio').firstElementChild.innerText = ss_user.profile.uname;
                userProfile.querySelector('#user-bio').lastElementChild.innerText = ss_user.profile.email;
                userProfile.classList.add('show');
                activeMenu = userProfile;
                // alert(`Profile Info:\nNAME :: ${ss_user.profile.uname}\nEMAIL ::  ${ss_user.profile.email}`);
            } else {
                location.assign(`./u/${ss_user.profile.userPath}/htm/home.html`);
            }
        } else {
            notLoggedInNotice.classList.add('show');
        }
    });
    // const closeButton = document.querySelector('section .head .close'); //close button of <section>

    const closeButtons = document.querySelectorAll('.close'); //close button of <section>
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (section.contains(btn)) return section.style.transform = 'translateY(-100%)';
            if (notLoggedInNotice.contains(btn)) return notLoggedInNotice.classList.remove('show');
            if (notice.contains(btn)) return notice.classList.remove('show');
        });
    });
    checkoutForm.addEventListener('input', (e) => {
        const q = Number(e.target.value);
        const ppu = Number(e.target.dataset.ppu);
        const subt = e.target.parentElement.nextElementSibling.querySelector('.subtotal > span');
        subt.textContent = q * ppu;
        const subtotals = [...checkoutForm.querySelectorAll('.subtotal > span')];
        const grandTotal = subtotals.map(x => Number(x.textContent)).reduce((a, c) => a + c);
        checkoutBtn.textContent = grandTotal;
    });
    checkoutForm.addEventListener('click', async (e) => {
        if (e.target.localName == 'button') {
            e.target.disabled = true;
            const parent = e.target.closest('.cart_wrap');
            const pid = e.target.parentElement.previousElementSibling.children[2].name;
            parent.style.opacity = 0.4;
            e.target.textContent = 'Removing...';
            //delete property from localStorage
            ss_user = JSON.parse(localStorage.getItem('user'));
            delete ss_user.profile.cart[pid];
            localStorage.setItem('user', JSON.stringify(ss_user));
            await updateDoc(doc(db, "users", ss_user.id), {cart: ss_user.profile.cart});
            //get its previousElementSibling and deduct it from the checkoutbtn
            const fprice = Number(e.target.previousElementSibling.children[0].textContent);
            const chkoutBtnVal = Number(checkoutBtn.textContent);
            checkoutBtn.textContent = chkoutBtnVal - fprice;
            parent.remove();
            document.querySelector('div.cart > i').textContent = Object.keys(ss_user.profile.cart).length;
            document.querySelectorAll('.cart_wrap').forEach((wrap, idx) => wrap.querySelector('.serial').textContent = idx + 1);
        }
    });
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!orderDesc) {
            orderDescDial.showModal();
            return;
        }
        //if DESC NO btn, return; else if DESC YES btn,
        const checkoutBtn = document.querySelector('#checkout-btn');
        ss_user = JSON.parse(localStorage.getItem('user'));
        checkoutBtn.disabled = true;
        checkoutBtn.style.cursor = 'not-allowed';
        const fd = new FormData(checkoutForm);
        let data = {};
        for (const [k, v] of fd.entries()) {
            data[k] = [fd.getAll([k])[1], Number(fd.getAll([k])[2]), Number(fd.getAll([k])[0])];
        }
        const newOrder = await addDoc(collection(db, 'users'), {}); //this is to get an auto-generated ID from firestore
        const orderRef = doc(db, "users", `${ss_user.id}/Orders/${newOrder.id}`);
        batch.set(orderRef, {
            uid: ss_user.id,
            uname: ss_user.profile.uname,
            alias: ss_user.profile.alias,
            desc: orderDesc,
            hex: ss_user.profile.hex,
            oid: data,
            status: 0,
            orderDate: Date.now(),  // new Intl.DateTimeFormat('en-US').format(new Date()),
            lastModified: serverTimestamp(),
        });
        const userRef = doc(db, 'users', ss_user.id);
        batch.update(userRef, {
            cart: {},
            orderCount: increment(1),
        });
        await batch.commit();
        ss_user.profile.cart = {};
        ss_user.profile.orderCount += 1;
        localStorage.setItem('user', JSON.stringify(ss_user));
        document.querySelector('div.cart > i').textContent = 0;
        
        checkoutBtn.disabled = false;
        checkoutBtn.style.cursor = 'pointer';
        notice.firstElementChild.innerHTML = "Your order has been placed.<br>Check the Orders page for when the store will confirm it.";
        notice.classList.add('show');
    });
}

//user pic event listener to navigate to manager if ss_userPath is 0baea2f0ae20150db78f58cddac442a9;
userCart.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
        let ss_user = JSON.parse(localStorage.getItem('user'));
        if (!ss_user) {
            notLoggedInNotice.classList.add("show");
        }
    });
});

//logout function
const logoutBtn = document.querySelector('div#logout');
logoutBtn.addEventListener('click', (e) => {
    //remove ss and ls
    sessionStorage.removeItem('shelf'), localStorage.removeItem('user');
    //reload index.html
    document.location.reload();
});

//add links to nav menu
const categoryCollection = await getDocs(collection(db, "category"));   //_searchIndex_ and all
if (categoryCollection.empty) {
    alert("You do not have any categories.");
} else {
    categoryCollection.docs.forEach(c => {
        if (!(['_searchIndex_'].includes(!c.id)))
            document.querySelector("nav").insertAdjacentHTML("beforeend", `<a href="#" id="${c.id}">${c.id}</a>`)
    });
}
let lastVisible, cat = "all";
let data = {}, products = [];
const prodColl = collection(db, "products");
let wishes = [], carts = [];    //populate these arrays from the user's snapshot Local Storage
const qty = document.querySelector("span#qty");
const addToCartBtn = document.querySelector("aside button#add-to-cart");
let addToCartVal;

//randomly select field to orderBy
let fields = ['name','dateCreated','category'];
let rdx = Math.floor(Math.random() * fields.length); //RanDom indeX
let rdv = fields[rdx]; //RanDom Value
console.info(`%c<webmart app>: %cOrdering: ${rdv}`, 'color: #1a73e8', 'color: #555');
const defImg = "./img/picture-image-svgrepo-com (1).svg";
async function loadDocs(cat) {
    console.info(`%c<webmart app>: %ccurrent category: ${cat}`, 'color: #1a73e8', 'color: #555');
    let first;
    if (cat == 'all') {
        // first = query(prodColl, orderBy("dateCreated", "desc"));
        first = query(prodColl, orderBy(rdv)); //limit(25)
    } else {
        first = query(prodColl, where("category", "==", cat), orderBy(rdv));    //later, insert limit(25)
    }
    const docSnapshot = await getDocs(first);
    if (docSnapshot.empty) return alert("No product found.");
    lastVisible = docSnapshot.docs[docSnapshot.docs.length - 1];
    untemplatedMain.forEach(card => card.remove()); //remove previously loaded docs
    products = docSnapshot.docs.map(doc => {
        const card = cardTemplate.content.cloneNode(true).children[0];
        card.setAttribute("id", doc.id);
        const cardImage = card.querySelector("img");
        const cardTitle = card.querySelector(".title");
        const cardPrice = card.querySelector(".price");
        // const cardWish = card.querySelector("[alt='wish']");
        // const cardCart = card.querySelector("[alt='cart']");
        cardImage.src = doc.data()?.imgURL || defImg;
        cardTitle.textContent = doc.data()?.name || "Untitled";
        if (doc.data()?.qty) {
            cardPrice.innerHTML = `&#8358; ${doc.data()?.price || 0}`
        } else {
            cardPrice.innerHTML = "Out of stock";
            card.classList.add("out_of_stock");
        }
        // if (wishes.includes(doc.id)) cardWish.classList.add("wished");
        // if (carts.includes(doc.id)) cardCart.classList.add("carted");

        card.addEventListener("click", (e) => {
            const pid = e.target.id;
            const c = products.filter(({id}) => id == pid);
            const { brand, color, desc, id, imgURL, litAuthor, litTitle, price, school, size, subjName, title } = c[0];
            // console.log(imgURL)
            document.querySelector("[alt='aside-img']").src = imgURL || defImg;
            const obj = {title, price, desc, size, brand, color, school, subjName, litAuthor, litTitle};
            const asideBody = document.querySelector("aside .body");
            asideBody.innerHTML = '';
            for (const i in obj) {
                if (!obj[i]) continue;
                asideBody.insertAdjacentHTML('beforeend', `
                    <div>
                        <span class="topic">${i}</span>
                        <span class="content">${i == 'price' ? '&#8358; ' + (obj[i] || 0) : obj[i] }</span>
                    </div>
                `)
            }
            addToCartBtn.setAttribute("data-prod-id", id);
            qty.innerText = 1;  //reset qty
            addToCartBtn.querySelector("span").setAttribute("data-unit-price", obj.price || 0);
            addToCartBtn.querySelector("span").innerHTML = "&#8358; " + (obj.price || 0);
            document.body.classList.add("fx");
        });

        main.append(card);
        return {
            id: doc.id,
            title: doc.data()?.name,
            price: doc.data()?.price,
            qty: doc.data()?.qty,
            desc: doc.data()?.description,
            imgURL: doc.data()?.imgURL,
            size: doc.data()?.size,
            brand: doc.data()?.brand,
            color: doc.data()?.color,
            school: doc.data()?.school,
            class: doc.data()?.class,
            subjName: doc.data()?.subjName,
            litTitle: doc.data()?.litTitle,
            litAuthor: doc.data()?.litAuthor,
            element: card
        };
    });
}
loadDocs(cat);

const form_filter = document.getElementById("form-filter");
form_filter.addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    products.forEach(user => {
        const isVisible = user.title.toLowerCase().includes(val);
        user.element.classList.toggle("hide", !isVisible);
    });
});

const form_search = document.getElementById("form-search");
form_search.addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    //create searchIndex collection by storing product's ID and name on creation
})
let reached_end = false;

async function loadMoreDocs (cat) {
    let next;
    console.log(cat)
    console.log(lastVisible)
    if (!lastVisible) {
        next = query(prodColl, orderBy("dateCreated", "desc"), limit(2));
    } else {
        next = query(prodColl, where("category", "==", cat), orderBy("category"), orderBy("dateCreated", "desc"), startAfter(lastVisible), limit(25));
    }
    if (!reached_end) {
        const docSnapshot = await getDocs(next);
        if (docSnapshot.empty) return console.log("Reached the end.");
        lastVisible = docSnapshot.docs[docSnapshot.docs.length - 1];
    
        products = docSnapshot.docs.map(doc => {
            const card = cardTemplate.content.cloneNode(true).children[0];
            const cardImage = card.querySelector("img");
            const cardTitle = card.querySelector(".title");
            const cardPrice = card.querySelector(".price");
            cardImage.src = doc.data()?.imgURL || defImg;
            cardTitle.textContent = doc.data()?.name || "Untitled";
            cardPrice.innerHTML = `&#8358; ${doc.data()?.price || 0}`;
            main.append(card);
            return { title: doc.data()?.name, element: card };
        });
    } else {
        reached_end = true;
    }
}

main.addEventListener("scrollend", (e) => {
    const scrollHeight = e.target.scrollHeight;
    
    const combo = e.target.scrollTop + e.target.clientHeight;
    if (scrollHeight == combo) {
        loadMoreDocs(cat);
        // main.insertAdjacentHTML("beforeend", clone);
    }
    console.log(scrollHeight, combo)
})
// document.addEventListener("scrollend", (e) => {
//     const scrollHeight = e.target.scrollingElement.scrollHeight;
    
//     const combo = e.target.scrollingElement.scrollTop + e.target.scrollingElement.clientHeight;
//     if (scrollHeight == combo) {
//         console.log("Run function to await new products")
//         // main.insertAdjacentHTML("beforeend", clone);
//     }
//     console.log(scrollHeight, combo)
// })

// const cards = document.querySelectorAll(".card");
// cards.forEach(card => {
//     card.addEventListener("click", (e) => {
//         console.log(e.target.id);
//         const pid = e.target.id;
//         const c = products.filter(({id}) => id == pid);
//         console.log(c)
//         // const asideBody = document.querySelector("aside .body");
//         // for (const i of c) {
//         //     console.log(i)
//         // }
//         // const addToCartBtn = document.querySelector("aside button#add-to-cart");
//         // addToCartBtn.querySelector("span").innerText = "The price from 'c'";
//     });
//     console.log(products);
// });

const chevrons = document.querySelectorAll(".chevron.jsChevron");   //add more or less items to cart
chevrons.forEach(chv => {
    chv.addEventListener("click", (e) => {
        const val = Number(qty.innerText);
        const up = Number(addToCartBtn.querySelector("span").dataset.unitPrice);
        if (val > 1 && chv.classList.contains("left")) {
            qty.innerText = val - 1;
        } else if (chv.classList.contains("right")) {
            qty.innerText = val + 1;
        }
        addToCartBtn.querySelector("span").innerHTML = "&#8358; " + (Number(qty.innerText) * up);
    });
});

//toggle context menus off
window.addEventListener('click', (e) => {
    if (activeMenu) activeMenu.classList.remove('show');
}, true);

window.addEventListener("storage", (e) => {
    // console.log(JSON.parse(e.storageArea).user)
    //console.log(e.url); console.log(e.oldValue); console.log(e.newValue); console.log(e.key); console.log(e.storageArea);
})

const progressBar = document.querySelector(".progress_bar");
let shelf = {};
sessionStorage.getItem('shelf') == null ? sessionStorage.setItem('shelf', JSON.stringify([shelf])) : console.info('%c<webmart app>: %cUser has already set up shelf.', 'color: #1a73e8', 'color: #555');   //checks if ss.shelf exists; if not, creates it
addToCartBtn.addEventListener("click", async (e) => {
    let user = JSON.parse(localStorage.getItem('user'));
    addToCartBtn.disabled = true;
    let num = Number(qty.innerText);
    let id = addToCartBtn.dataset.prodId;
    //check if item in cart is up to ten
    if (user)  {
        if (Object.keys(user?.profile.cart).length > 9) return alert("Your cart is full. Please, checkout items before continuing shopping.");
        //check if item already in the cart
        if (user.profile.cart.hasOwnProperty(id)) {
            alert('This item is already in the cart.');
        } else {
            progressBar.classList.add("checking");
            const snapshot = await setDoc(doc(db, "users", user.id), {cart: {[id]: num}}, {merge: true});
            user.profile.cart[id] = num;
            const cart_len = Object.entries(user.profile.cart).length;
            localStorage.setItem('user', JSON.stringify(user));
            document.querySelector('div.cart > i').textContent = cart_len;
            progressBar.classList.replace("checking","checked");
        }
    } else {
        if (!(Object.values(JSON.parse(sessionStorage.shelf))[0].hasOwnProperty(id)) && Object.keys(shelf).length > 1) {//checks if the user already has the product in the shelf
            shelf[id] = num;
            sessionStorage.setItem('shelf', JSON.stringify([shelf]));
        }
        notLoggedInNotice.classList.add("show");
        closeAsideBtn.click();
    }
    addToCartBtn.disabled = false;
});
const check = document.querySelector(".check");
check.onclick = function () {
    progressBar.classList.remove("checked");
    closeAsideBtn.click();
}

const navlinks = document.querySelectorAll("nav > a");
navlinks.forEach((lnk, idx) => {
    lnk.addEventListener("click", async (e) => {
        for (let n = 0; n < navlinks.length; n++) navlinks[n].classList.remove("active");
        lnk.classList.add("active");
        main.classList.add("loading")
        products = [];  //reset products;
        lastVisible = undefined;
        main.innerHTML = '';
        await loadDocs(e.target.id);
        main.classList.remove("loading");
    });
});

const closeAsideBtn = document.querySelector(".close");
closeAsideBtn.addEventListener("click", (e) => {
    document.body.classList.remove("fx");
    progressBar.classList.remove("checked");
});

const nliLinks = document.querySelectorAll(".nli .link");
const signUpDialog = document.getElementById("sign-up-dialog");
const loginDialog = document.getElementById("login-dialog");
nliLinks.forEach((lnk, idx) => {
    lnk.addEventListener("click", (e) => {
        if (idx === 0) {
           signUpDialog.showModal();
        } else if (idx === 1) {
            loginDialog.showModal();
        }
        e.target.closest(".dialog").classList.remove("show");
    });
});

// view/hide password btns
const eyeBtns = document.querySelectorAll(".open, .shut");
eyeBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        btn.classList.add('opq');
        if (btn.classList.contains('open')) {
            btn.previousElementSibling.classList.remove('opq');
            btn.parentElement.firstElementChild.type = 'text';
        } else {
            btn.nextElementSibling.classList.remove('opq');
            btn.parentElement.firstElementChild.type = 'password';
        }
    })
});
const hexes = ['#fab500','#1a73e8','#009578','#f36944','#663399','#0ca678','#1c7ed6','#9c36b5','#183153'];
const hx = Math.floor(Math.random() * hexes.length);
const forms = document.querySelectorAll("#sign-up-form, #login-form");
//sign up user
forms[0].addEventListener("submit", async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.value = '. . .';
    const fd = new FormData(forms[0]);
    //FIRST CHECK IF USER EMAIL EXISTS. IF TRUE, RETURN WINDOW.ALERT, getCountFromServer
    console.time('%c<webmart app>: %cEmail checked.', 'color:#1a73e8', 'color: #555');
    const q = query(collection(db, "users"), where('email', '==', fd.get('email')));
    const snapShot = await getCountFromServer(q);
    console.timeEnd('%c<webmart app>: %cEmail checked.', 'color:#1a73e8', 'color: #555');
    if (snapShot.data().count) return alert('A user already exists with this email.');
    
    let data = {
        userPath: '9367a975fl9a06750b67f7l9f4f08ceb',
        isSubscriber: true,
        isSuperuser: false,
        isStaffer: false,
        orderCount: 0,
        wishlist: [],
        cart: JSON.parse(sessionStorage.getItem('shelf'))[0],
        hex: hexes[hx],
        alias: fd.get('uname').slice(0,2).toUpperCase(),
        createdOn: Date.now(),
        lastModified: serverTimestamp(),
    };
    for (const [k,v] of fd.entries()) {
        data[k] = v;
    }
    let timer1 = console.time('%c<webmart app>: %cUser added.', 'color:#1a73e8');
    const snapshot = await addDoc(collection(db, "users"), data);
    console.timeEnd('%c<webmart app>: %cUser added.', 'color:#1a73e8', 'color: #555');
    let timer2 = console.time('%c<webmart app>: %cUser cached.', 'color:#1a73e8');
    const newUser = await getDoc(doc(db, "users", snapshot.id));
    console.timeEnd('%c<webmart app>: %cUser cached.', 'color:#1a73e8', 'color: #555');
    // console.log(newUser, newUser.data());
    localStorage.setItem('user', JSON.stringify({id: newUser.id, profile: newUser.data()}));
    ss_user = JSON.parse(localStorage.getItem('user'));
    const cartLen = Object.entries(Object.values(JSON.parse(sessionStorage.shelf))[0]).length;
    userPresenceIndicator(cartLen);
    const dElems = document.querySelectorAll('#sign-up-form, #sign-up-dialog > p, #sign-up-dialog > output');
    dElems.forEach((elem, idx) => elem.classList.toggle('opq', idx < 2));
    //set up the user profile
    userProfile.querySelector('#user-bio').firstElementChild.innerText = newUser.data().uname, userProfile.querySelector('#user-bio').lastElementChild.innerText = newUser.data().email;
});

//login form
forms[1].addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.textContent = '. . .';
    const fd = new FormData(forms[1]);
    const uname = fd.get('username');
    const pwd = fd.get('pwd');

    const q = query(collection(db, "users"), and(where('pword', '==', pwd), or(where('uname', '==', uname), where('email', '==', uname))), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) {
        alert("Sorry. The username/password is wrong.");
        e.submitter.disabled = false;
        return;
    }
    localStorage.setItem('user', JSON.stringify({id: snap.docs[0].id, profile: snap.docs[0].data()}));
    ss_user = JSON.parse(localStorage.getItem('user'));
    userPresenceIndicator(Object.entries(snap.docs[0].get('cart')).length);
    e.submitter.closest('dialog').close();
    //set up the user profile
    userProfile.querySelector('#user-bio').firstElementChild.innerText = snap.docs[0].data().uname, userProfile.querySelector('#user-bio').lastElementChild.innerText = snap.docs[0].data().email;
    notice.firstElementChild.innerHTML = "Welcome to <b>Chris' Store</b>!";
    notice.classList.add('show');
    setTimeout(() => {
        notice.classList.remove('show');
    }, 3000);
});