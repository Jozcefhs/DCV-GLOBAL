import { fbInitializer, collection, getStorage, ref, addDoc, uploadBytes, uploadBytesResumable  } from "../../../js/firebase_xp.js";
//create new docRef (addDoc) with fb uniquely generated ID
const db = fbInitializer();
const prodRef = collection(db, "clientele");

//get root storage
const storage = getStorage();

const forms = document.forms;
const schoolSelectElem = document.querySelector("select#school");
const classSelectElem = document.querySelector("select#class");
// const thumbnailBtn = document.querySelectorAll(".photo_file");
const file = document.querySelector("#thumbnail");
const messageDialog = document.querySelector("dialog.message");
const okayBtn = document.querySelector("button#okay");
// let data = {};

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

let fbdata = {};
//selecting photo
file.addEventListener("change", (e) => {
    const [file] = e.target.files;
    if (file.size > "200500") { // 27kb should be the upper limit
        console.log("File too large");
        // e.target.files[0].length = 0;
    } else {
        // fbdata.imgBlob = file;
    }
    console.log(file.name);
});

const progressBar = document.getElementById("progress-bar");
//product form
forms[0].addEventListener("submit", async (e) => {
    e.preventDefault();
    messageDialog.classList.add("adding");
    messageDialog.showModal();

    const fd = new FormData(forms[0]);
    const category = fd.get("category");
    let blob, ext;
    for (let [k, v] of fd.entries()) {
        if (k == 'thumbnail') {
            blob = v;
            ext = v.type.replace("image/","."); //getting the image file extension
        } else if (v) {
            fbdata[k] = v;
        }
    }
    console.log(fbdata);
    //send fbdata to a new firebase doc; thereafter, retrieve fbId and send blob to storage
    const docRef = await addDoc(prodRef, fbdata);
    let storageRef = ref(storage, `${category}/${docRef.id}${ext}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);
    uploadTask.on('state-changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressBar.style.width = `${progress}%`;
    })
    messageDialog.classList.replace("adding", "added");
    // forms[0].reset();
});

okayBtn.addEventListener("click", () => {
    okayBtn.closest("dialog").classList.remove("added");
    okayBtn.closest("dialog").close();
});