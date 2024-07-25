import { addDoc, and, collection, doc, fbInitializer, getCountFromServer, getDoc, getDocs, getFirestore, limit, orderBy, query, serverTimestamp, setDoc, startAfter, where } from "../../../js/firebase_xp.js";
const app = fbInitializer();
const db = getFirestore(app);
//../../../img/picture-image-svgrepo-com (1).svg
//&#8358;
const untemplatedMain = document.querySelectorAll("main > *:not(template)");
const main = document.querySelector("main");
const cardTemplate = document.querySelector("template");

//check if user is available, then update image icon, cart. Else, display LOG IN.
const userPic = document.querySelector('#user-pic');
const ss_user = JSON.parse(localStorage.getItem("user"));
if (ss_user) {
    const cartLen = Object.entries(ss_user.profile.cart).length;
    userPresenceIndicator(cartLen);
}
//function to indicate user has logged in
function userPresenceIndicator(cart_len) {
    userPic.classList.add('link');
    document.querySelector('div.cart > i').textContent = cart_len;
    document.querySelector('header > .top').classList.add('usr');
}

//user pic event listener to navigate to manager if ss_userPath is 0baea2f0ae20150db78f58cddac442a9; else display window alert uname
userPic.addEventListener('click', () => {
    if (ss_user) {
        if (ss_user.profile.isSuperuser) {
            location.assign(`../${ss_user.profile.userPath}/htm/home.html`)
        } else if (ss_user.profile.isSubscriber) {
            alert(`Profile Info:\nNAME :: ${ss_user.profile.uname}\nEMAIL ::  ${ss_user.profile.email}`);
        }
    }
})

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

async function loadDocs(cat) {
    console.info("%c<webmart app>: %ccurrent category:", 'color: #1a73e8', `${cat}`);
    let first;
    if (cat == 'all') {
        // first = query(prodColl, orderBy("dateCreated", "desc"));
        first = query(prodColl, orderBy("dateCreated", "desc"), limit(2));
    } else {
        first = query(prodColl, where("category", "==", cat), orderBy("category"), orderBy("dateCreated", "desc"), limit(2));
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
        cardImage.src = doc.data()?.imgURL || "../../../img/picture-image-svgrepo-com (1).svg";
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
            document.querySelector("[alt='aside-img']").src = imgURL || '../../../img/picture-image-svgrepo-com (1).svg';
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
            cardImage.src = doc.data()?.imgURL || "../../../img/picture-image-svgrepo-com (1).svg";
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

window.addEventListener("storage", (e) => {
    // console.log(JSON.parse(e.storageArea).user)
    //console.log(e.url); console.log(e.oldValue); console.log(e.newValue); console.log(e.key); console.log(e.storageArea);
})

const progressBar = document.querySelector(".progress_bar");
const notLoggedInNotice = document.querySelector("div.nli");
let shelf = {};
sessionStorage.getItem('shelf') == null ? sessionStorage.setItem('shelf', JSON.stringify([shelf])) : console.info('%c<webmart app>: %cUser has already set up shelf.', 'color: #1a73e8');   //checks if ss.shelf exists; if not, creates it
addToCartBtn.addEventListener("click", async (e) => {
    addToCartBtn.disabled = true;
    let num = Number(qty.innerText);
    let id = addToCartBtn.dataset.prodId;
    let user = JSON.parse(localStorage.getItem('user'));
    if (user)  {
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
        if (!(Object.values(JSON.parse(sessionStorage.shelf))[0].hasOwnProperty(id))) {//checks if the user already has the product in the shelf
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
const forms = document.querySelectorAll("#sign-up-form, #login-form");
//sign up user
forms[0].addEventListener("submit", async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.value = '. . .';
    const fd = new FormData(forms[0]);
    //FIRST CHECK IF USER EMAIL EXISTS. IF TRUE, RETURN WINDOW.ALERT, getCountFromServer
    console.time('%c<webmart app>: %cEmail checked.', 'color:#1a73e8');
    const q = query(collection(db, "users"), where('email', '==', fd.get('email')));
    const snapShot = await getCountFromServer(q);
    console.timeEnd('%c<webmart app>: %cEmail checked.', 'color:#1a73e8');
    if (snapShot.data().count) return alert('A user already exists for this email.');
    
    let data = {
        userPath: '9367a975fl9a06750b67f7l9f4f08ceb',
        isSubscriber: true,
        isSuperuser: false,
        isStaffer: false,
        wishlist: [],
        cart: JSON.parse(sessionStorage.getItem('shelf'))[0],
        createdOn: Date.now(),
        lastModified: serverTimestamp(),
    };
    for (const [k,v] of fd.entries()) {
        data[k] = v;
    }
    let timer1 = console.time('%c<webmart app>: %cUser added.', 'color:#1a73e8');
    const snapshot = await addDoc(collection(db, "users"), data);
    console.timeEnd('%c<webmart app>: %cUser added.', 'color:#1a73e8');
    let timer2 = console.time('%c<webmart app>: %cUser cached.', 'color:#1a73e8');
    const newUser = await getDoc(doc(db, "users", snapshot.id));
    console.timeEnd('%c<webmart app>: %cUser cached.', 'color:#1a73e8');
    // console.log(newUser, newUser.data());
    localStorage.setItem('user', JSON.stringify({id: newUser.id, profile: newUser.data()}));
    const cartLen = Object.entries(Object.values(JSON.parse(sessionStorage.shelf))[0]).length;
    userPresenceIndicator(cartLen);
    const dElems = document.querySelectorAll('#sign-up-form, #sign-up-dialog > p, #sign-up-dialog > output');
    dElems.forEach((elem, idx) => elem.classList.toggle('opq', idx < 2));
});

//login form
forms[1].addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.textContent = '. . .';
    const fd = new FormData(forms[1]);
    const uname = fd.get('username');
    const pwd = fd.get('pwd');
    const q = query(collection(db, "users"), where(and(or('uname', '==', uname), ('uname', '==', 'email'), 'pword', '==', pwd), limit(1)));
    const snap = await getDocs(q);
    localStorage.setItem('user', JSON.stringify({id: snap.docs[0].id, profile: snap.docs[0].data()}));
    document.querySelector('header > .top').classList.add('usr');
    document.querySelector('div.cart > i').textContent = Object.entries(snap.docs[0].get('cart')).length;
    e.submitter.closest('dialog').close();
})