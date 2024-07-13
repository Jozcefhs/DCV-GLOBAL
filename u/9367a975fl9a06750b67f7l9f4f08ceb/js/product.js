// import { initializeApp } from "../../../js//firebase_xp";

const svgWish = document.querySelector("svg#wishlist > path");
svgWish.addEventListener("click", (e) => {
    const parent = e.target.ownerSVGElement.parentElement;
    if (parent.classList.contains("wished")) {
        //update wish by removing it in fb
        parent.classList.remove("wished");
        return;
    } else {
        const bool = parent.classList.toggle("wish")
        //update wish in fb
        const id1 = setTimeout(() => {
            parent.classList.replace("wish", "wishing");
            clearTimeout(id1);
        }, 5000);
        //update wish in localStorage
        const id2 = setTimeout(() => {
            parent.classList.replace("wishing", "wished");
            clearTimeout(id2);
        }, 8000);
    }
});
const forms = document.forms;
const input = forms[0].querySelector("input");//input from cart form
const counterBtns = document.querySelectorAll("[data-counter]");
counterBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        if (btn.id == "plus") {
            input.value = Number(input.value) + 1;
        } else if (input.value == 1) {
            return;
        } else {
            input.value = Number(input.value) - 1;
        }
    });
});

input.addEventListener("change", (e) => {
    // e.preventDefault();
    // console.log(forms[0].requestSubmit(document.querySelector("#add-to-cart")));
    // if (input.value == "a") forms[0].reportValidity();
    // return;
});

forms[0].addEventListener("submit", (e) => {
    e.preventDefault();
    const bool = e.submitter.classList.replace("unload", "load");
    console.log(bool)
    const tid = setTimeout(function () {
        //async await operation of adding item to cart
        e.submitter.classList.replace("load", "unload");
        e.submitter.innerText = "Item added";
        e.submitter.style.backgroundColor = "#eee";
        e.submitter.style.color = "#555";
        e.submitter.style.cursor = "default";
        for (let i = 0; i < e.target.length; i++) {
            e.target.elements[i].disabled = true;
        }
        e.target.style.opacity = ".4";
    }, 3000);
});

const checkoutBtn = document.getElementById("checkout");
checkoutBtn.onclick = (e) => {
    //link to cart page
    location.href = "../htm/cart.html";
}