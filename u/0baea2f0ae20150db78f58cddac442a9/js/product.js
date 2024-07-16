const forms = document.forms;
const schoolSelectElem = document.querySelector("select#school");
const classSelectElem = document.querySelector("select#class");
// const thumbnailBtn = document.querySelectorAll(".photo_file");
const file = document.querySelector("#thumbnail");
const messageDialog = document.querySelector("dialog.message");
const okayBtn = document.querySelector("button#okay");
let data = {};

schoolSelectElem.addEventListener("change", (e) => {
    const optIdx = e.target.selectedIndex;
    if (!optIdx) return;
    //empty former opts, if any
    const classOpts = [...classSelectElem.options];
    for (let o = 1; o < classOpts.length; o++) classOpts[o].remove();
    const datalOpts = [...document.querySelector("datalist#" + e.target[optIdx].value).options];
    datalOpts.forEach(datalOpt => {
        classSelectElem.insertAdjacentHTML("beforeend", datalOpt.outerHTML);
    });
});

//selecting photo
file.addEventListener("change", (e) => {
    const [file] = e.target.files;
    console.log(file.name);
    if (file.size > "200500") {
        console.log("File too large");
        console.log(e.target.files);
        e.target.files[0].length = 0;
        console.log(e.target.files);
    } else {
        // const imageURL = URL.createObjectURL(file);
        // console.log("image url: ", imageURL);
    }
});

//product form
forms[0].addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(forms[0]);
    const subjName = fd.get("subjName");
    const subjNames = subjName.split(", ",subjName.length).filter(s => Boolean(s));
    console.log(subjNames);
    // for (let [k, v] of fd.entries()) {
    //     //
    // }
    messageDialog.classList.add("adding");
    messageDialog.showModal();
    const id1 = setTimeout(() => messageDialog.classList.replace("adding", "added"), 5000);
    // forms[0].reset();
});

okayBtn.addEventListener("click", () => {
    okayBtn.closest("dialog").classList.remove("added");
    okayBtn.closest("dialog").close();
});