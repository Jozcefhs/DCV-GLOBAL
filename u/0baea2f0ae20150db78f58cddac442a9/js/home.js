const dialog = document.querySelector("#frame-holder");
const iframe = dialog.querySelector("iframe");
const frameTitle = dialog.querySelector(".frame_title");
const cards = document.querySelectorAll(".card");
cards.forEach((card, idx) => {
    card.addEventListener("click", (e) => {
        frameTitle.innerText = card.querySelector("p").innerText;
        dialog.showModal();
        const visited = card.classList.contains("on");
        if (!visited) {
            for (let c = 0; c < cards.length; c++) cards[c].classList.toggle("on", card.dataset.cardNumber == c);
            iframe.src = card.dataset.href;
        }
    });
});

const barBtn = document.querySelector(".bar_btn");
barBtn.onclick = () => {
    barBtn.closest("dialog").close();
}