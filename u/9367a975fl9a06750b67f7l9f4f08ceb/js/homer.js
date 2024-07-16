// import { fbInitializer } from "../../../js/firebase_xp.js";
//../../../img/picture-image-svgrepo-com (1).svg
//&#8358;
const main = document.querySelector("main");
const cardTemplate = document.querySelector("template");

//get data and use map() to display the underlying
let data = {}, users;
// users = data.map(user => )
for (let d = 0; d < 30; d++) {
    const card = cardTemplate.content.cloneNode(true).children[0];
    const cardImage = card.querySelector("img");
    const cardTitle = card.querySelector(".title");
    const cardPrice = card.querySelector(".price");
    cardImage.src = data?.img || "../../../img/picture-image-svgrepo-com (1).svg";
    cardTitle.textContent = data?.title || "Title";
    cardPrice.innerHTML = `&#8358; ${data?.price || 400}`;
    main.append(card);
    // return { title: data?.title, element: card };
}
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
const form_filter = document.getElementById("form-filter");
form_filter.addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    users.forEach(user => {
        const isVisible = user.title.toLowerCase().includes(val);
        user.element.classList.toggle("hide", !isVisible);
    });
});

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