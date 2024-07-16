import { fbInitializer, collection, doc, getStorage, ref, addDoc, uploadBytes, uploadBytesResumable, getDownloadURL, getBlob, setDoc  } from "../../../js/firebase_xp.js";
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
    messageDialog.classList.add("adding");  //to be got rid of

    const fd = new FormData(forms[0]);
    const category = fd.get("category");
    fd.append("dateCreated", Date.now());
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
            //https://firebasestorage.googleapis.com/v0/b/flutterspace-d2385.appspot.com/o/accessory%2F8xIBJUGWqRqLHDM2ahBz.jpeg?alt=media&token=e4be1d94-6cbe-48cd-a0ed-42c1af26e453
            //https://firebasestorage.googleapis.com/v0/b/flutterspace-d2385.appspot.com/o/literature%2FYJ1fSLLdwhafU8rH7zW7.png?alt=media&token=b6ba5b11-f366-4855-bda0-11274ebb1fcf
            getDownloadURL(uploadTask.snapshot.ref).then(async url => {
                await setDoc(doc(db, "prodRef", docRef.id), {imgURL: url}, {merge: true});
                messageDialog.classList.replace("adding", "added");
                messageDialog.showModal();
            });
            // forms[0].reset();
        }
    );
});

const img = document.querySelector("img[alt='blobbed']");
// const imgRef = ref(storage, "accessory/8xIBJUGWqRqLHDM2ahBz.jpeg");
// const myblob = await getBlob(imgRef);
// console.log(myblob);
// img.src = myblob;
// img.src = "https://firebasestorage.googleapis.com/v0/b/flutterspace-d2385.appspot.com/o/accessory%2F8xIBJUGWqRqLHDM2ahBz.jpeg?alt=media&token=e4be1d94-6cbe-48cd-a0ed-42c1af26e453";

okayBtn.addEventListener("click", () => {
    okayBtn.closest("dialog").classList.remove("added");
    okayBtn.closest("dialog").close();
});