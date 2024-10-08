import { fbInitializer, collection, doc, getDocs, getStorage, ref, addDoc, uploadBytes, uploadBytesResumable, getDownloadURL, getBlob, setDoc, getFirestore, increment  } from "../../../js/firebase_xp.js";
//create new docRef (addDoc) with fb uniquely generated ID
const app = fbInitializer();
const db = getFirestore(app);
const prodRef = collection(db, "products");
const catRef = collection(db, "category");

//get list of categories and put them as <option> into select#category
const catColl = await getDocs(catRef);
const selectElem = document.querySelector("select#category");
catColl.docs.forEach(c => {
    selectElem.insertAdjacentHTML("beforeend", `<option value='${c.id}'>${c.id}</option>`);
})

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
const img = document.querySelector("div#thumbnails");
file.addEventListener("change", (e) => {
    const [file] = e.target.files;
    if (file.size > "77000") { // 77kb should be the upper limit
        console.log("File larger than 77kb.");
        // e.target.files[0].length = 0;
    } else {
        img.style.backgroundImage = `url('${URL.createObjectURL(file)}')`;
        img.onload = () => URL.revokeObjectURL(img.style.backgroundImage);
    }
    console.log(file.name);
});
//function to remove thumbnail
const removeThumbnailBtn = document.querySelector("#remove-thumbnail");
removeThumbnailBtn.onclick = () => img.style.backgroundImage = `url('${img.dataset.src}')`;

const progressBar = document.getElementById("progress-bar");
//product form
forms[0].addEventListener("submit", async (e) => {
    e.preventDefault();
    messageDialog.classList.add("adding");  //to be got rid of

    const fd = new FormData(forms[0]);
    const category = fd.get("category");
    const price = Number(fd.get("price"));
    const qty = Number(fd.get("qty"));

    let blob, ext;
    for (let [k, v] of fd.entries()) {
        if (k == 'thumbnail') {
            blob = v;
            ext = v.type.replace("image/","."); //getting the image file extension
        } else if (v) {
            fbdata[k] = v;
        }
    }
    fbdata["dateCreated"] = Date.now();
    fbdata.price = price;
    fbdata.qty = qty;
    console.log(fbdata);
    //set fbdata to a new firebase doc; thereafter, retrieve fbId and send blob to storage
    const docRef = await addDoc(prodRef, fbdata);
    progressBar.style.width = "27%";
    let storageRef = ref(storage, `${category}/${docRef.id}${ext}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);
    uploadTask.on('state-changed',
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (progress > 27) progressBar.style.width = `${progress}%`;
        },
        (error) => console.log(error),
        () => {
            getDownloadURL(uploadTask.snapshot.ref).then(async url => {
                await setDoc(doc(db, "products", docRef.id), {imgURL: url}, {merge: true}).then(async () => {
                    await setDoc(doc(db, "category", category), {size: increment(1)}, {merge: true}).then(() => {
                        messageDialog.classList.replace("adding", "added");
                        messageDialog.showModal();
                        forms[0].reset();
                        progressBar.style.width = "0%";
                    });
                });
            });
        }
    );
});

// const img = document.querySelector("img[alt='blobbed']");
// const imgRef = ref(storage, "accessory/8xIBJUGWqRqLHDM2ahBz.jpeg");
// const myblob = await getBlob(imgRef);
// console.log(myblob);
// img.src = myblob;
// img.src = "https://firebasestorage.googleapis.com/v0/b/flutterspace-d2385.appspot.com/o/accessory%2F8xIBJUGWqRqLHDM2ahBz.jpeg?alt=media&token=e4be1d94-6cbe-48cd-a0ed-42c1af26e453";

okayBtn.addEventListener("click", () => {
    okayBtn.closest("dialog").classList.remove("added");
    okayBtn.closest("dialog").close();
});