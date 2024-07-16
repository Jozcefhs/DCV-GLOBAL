// import { getFirestore, getStorage, initializeApp, ref } from "../../../js/firebase_xp.js";

// const storage = getStorage();

const fileElem = document.querySelector("input[type='file']");
fileElem.addEventListener("change", async () => {
    const [file] = fileElem.files;
    if (file) {
        console.log("file name:", file.name);
        console.log("file size:", file.size);
        //store image as data_url string;
        //in the PRODUCT database, store fbtoken_url and imgRef.fullpath;
        //If in the future fbtoken_url is disabled due to CORS policy, then we can rely on imgRef.fullpath to get the data_url of the img
        // const imgRef = ref(storage, `stationery/${file.name}`);
        /*
        const fr = new FileReader();
        fr.onload = () => {
            console.log(fr.result.length);
            document.querySelector("textarea").value = fr.result;
        }
        fr.readAsDataURL(file);
        */
    }
});
/*
let myblob = new Blob(["An image data array buffer."]);
const promise = await myblob.text().then(res => {
    console.log(res);
});
*/
