const formInventory = document.forms.inventory;
let clr;
const options = document.querySelectorAll(".opt");
const screens = document.querySelectorAll(".screen");
const category = document.querySelector("select#category");
category.addEventListener("change", (e) => {
    const idx = e.target.selectedIndex;
    screens.forEach(scr => {
        let bool = idx == scr.dataset.screen;
        //reset previous form inputs
        if (!bool) {
            scr.querySelectorAll(".screen > *").forEach(field => field.value = '');
            options[0].value = clr;
        }
        scr.classList.toggle("on", bool);
    });
});

const item = document.querySelector("select#item");
item.addEventListener("change", (e) => {
    const idx = e.target.selectedIndex;
    let bool = e.target[idx].dataset.opt;
    options.forEach((opt, ind) => opt.classList.toggle("on", ind == bool));
});
//options[0] stands for the "Color" select element
options[0].addEventListener("change", (e) => {
    const idx = e.target.selectedIndex;
    const opts = [...e.target];
    opts.forEach((opt, ind) => {
        if (!ind) return;
        const color = opt.dataset.hex;
        if (idx == ind) clr = color;
        options[0].classList.toggle(color, idx == ind);
    });
});