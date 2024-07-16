import { collection, fbInitializer, getDocs, limit, orderBy, query, where } from "../../../js/firebase_xp.js";
const db = fbInitializer();
//../../../img/picture-image-svgrepo-com (1).svg
//&#8358;
const main = document.querySelector("main");
const cardTemplate = document.querySelector("template");
var lastVisible = null;
let data = {}, users;
async function loadDocs(cat) {
    let first;
    if (cat == 'all') {
        first = query(collection(db, "clientele"), orderBy("dateCreated", "desc"), limit(25));
    } else {
        first = query(collection(db, "clientele"), where("category", "==", cat), orderBy("category"), orderBy("dateCreated", "desc"), limit(25));
    }
    const docSnapshot = await getDocs(first);
    if (docSnapshot.empty) return console.log("No product found");
    lastVisible = docSnapshot.docs[docSnapshot.docs.length - 1];
    
    users = docSnapshot.docs.map(doc => {
        const card = cardTemplate.content.cloneNode(true).children[0];
        const cardImage = card.querySelector("img");
        const cardTitle = card.querySelector(".title");
        const cardPrice = card.querySelector(".price");
        cardImage.src = doc.data()?.imageURL || "../../../img/picture-image-svgrepo-com (1).svg";
        cardTitle.textContent = doc.data()?.name || "Title";
        cardPrice.innerHTML = `&#8358; ${doc.data()?.price || 400}`;
        main.append(card);
        return { title: doc.data()?.name, element: card };
    });
}
loadDocs("all");

const form_filter = document.getElementById("form-filter");
form_filter.addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    users.forEach(user => {
        const isVisible = user.title.toLowerCase().includes(val);
        user.element.classList.toggle("hide", !isVisible);
    });
});

//get data and use map() to display the underlying

// users = data.map(user => )
// for (let d = 0; d < 30; d++) {
    
// }
// window.addEventListener("click", (e) => console.log(e.target.clientHeight))
// const asideR = document.querySelector("aside#right");
document.addEventListener("scrollend", (e) => {
    const scrollHeight = e.target.scrollingElement.scrollHeight;
    
    const combo = e.target.scrollingElement.scrollTop + e.target.scrollingElement.clientHeight;
    if (scrollHeight == combo) {
        console.log("Run function to await new products")
        // main.insertAdjacentHTML("beforeend", clone);
    }
    console.log(scrollHeight, combo)
})

const cards = document.querySelectorAll(".card");
cards.forEach(card => {
    card.addEventListener("click", (e) => {
        console.log(e.target.className)
    })
})

const navlinks = document.querySelectorAll("nav > a");
navlinks.forEach((lnk, idx) => {
    lnk.addEventListener("click", (e) => {
        for (let n = 0; n < navlinks.length; n++) navlinks[n].classList.remove("active");
        lnk.classList.add("active");
        main.classList.add("loading");
        //perform async await before quitting loading
    });
});

const closeAsideBtn = document.querySelector(".close");
closeAsideBtn.addEventListener("click", (e) => {
    document.body.classList.remove("fx");
});