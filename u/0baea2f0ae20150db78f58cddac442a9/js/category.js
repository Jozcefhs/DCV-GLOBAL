import { collection, doc, fbInitializer, getDoc, getDocs, getFirestore, memoryLocalCache, initializeFirestore, query, serverTimestamp, setDoc, onSnapshot, persistentLocalCache, persistentMultipleTabManager, disableNetwork, enableNetwork, runTransaction, where, updateDoc, deleteDoc, deleteApp } from "../../../js/firebase_xp.js";
let app = fbInitializer();
// const db = getFirestore(app);

let firestoreDb = initializeFirestore(app, {localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})});
//disable network in order to use cache
// await disableNetwork(firestoreDb);
const main = document.querySelector("main");
const forms = document.forms;
const asideLeft = document.querySelector("aside#left");

// const myCategories = await getDocs(collection(firestoreDb, "category")); //as the alternative to onSnapshot

const unsubscribe = onSnapshot(collection(firestoreDb, "category"), {includeMetadataChanges: true}, (snapshot) => {
    snapshot.docChanges().forEach(change => {
        //VERY IMPORTANT: Each snapshot is saved in indexedDb; so look for way to read data from indexedDb, changing versions (default 16), etc
        if (change.type == "added") { //other types (modified, removed)
            let {clone, desc} = categoryTemplate(change.doc.data().category, change.doc.data().size, change.doc.data().description, change.type);
            cloneEventListener(clone, desc);
        } else if (change.type == "modified") {
            let {clone, desc} = categoryTemplate(change.doc.data().category, change.doc.data().size, change.doc.data().description, change.type);
            cloneEventListener(clone, desc);
        } else if (change.type == "removed") {
            categoryTemplate(change.doc.data().category, change.doc.data().size, change.doc.data().description, change.type);
            // cloneEventListener(clone, desc);
        }
        const src = snapshot.metadata.fromCache ? "local cache" : "server";
        console.log(change.doc.id, "came from", src);
    });
});

let categorySelection;
function cloneEventListener(clone, desc) {
    clone.addEventListener("click", () => {
        const myform = document.querySelector('.outer_form');
        myform.querySelector("[name='category']").value = categorySelection = clone.querySelector(".name").textContent;
        myform.querySelector("[name='size']").value = clone.querySelector(".size").textContent;
        myform.querySelector("[name='description']").value = desc;
        asideLeft.classList.remove("show"); //hide side-menu
        enableDisableActionBtns(false);
    });
};
function enableDisableActionBtns(bool) {
    document.querySelectorAll("dialog > h4 > span").forEach(span => span.innerText = categorySelection);
    document.querySelectorAll(".jsbtn").forEach(item => item.classList.toggle("disabled", bool));
}
// console.log(myCategories.docs[0]._firestore._settings.cacheSizeBytes);
//get categories from cache; failing that, fetch from fb collection "category"
/*
async function getCategory() {
    const cacheName = 'cachegory';
    const url = location.pathname;
    let cacheData = await getCachedCategory(cacheName, url);
    if (cacheData) {
        return cacheData;
    }
    //get fb collection "category"---live
    console.log("fetching live collection to clone and store in cache as cacheName");
    const myCategories = await getDocs(collection(db, "category"));
    cacheData = await caches.open(cacheName).then(cache => {
        // cache.put(url, myCategories);
        console.log(myCategories.docs)
        myCategories.docs.forEach(doc => cache.add(doc.data()));
    });
    return cacheData;
}
async function getCachedCategory(cacheName, url) {
    const cacheStorage = await caches.open(cacheName);
    const cacheResponse = await cacheStorage.match(url);
    console.log("cache response:", cacheResponse)
    if (!cacheResponse || !cacheResponse.ok) return false;
    // return await cacheResponse;
}
getCategory();
*/
//get category collection
/*
const catRef = query(collection(db, "category"));
const categoryShot = await getDocs(catRef);
if (categoryShot.empty) {
    console.log("No category exists.");
} else {console.log("Category exists.")};
*/
// categoryShot.docs.forEach(doc => {
//     console.log(doc.id, doc.data().size)
//     // categoryTemplate(doc.id, doc.data().size);
//     //send to cache or session storage
// })
forms.namedItem("new-category").addEventListener("submit", async (e) => {
    e.preventDefault();
    e.submitter.closest("dialog").close();
    main.classList.add("opq");
    const fd = new FormData(e.target);
    let data = {};
    for (const [key, val] of fd.entries()) data[key] = val;
    data["dateCreated"] = Date.now();
    data["lastModified"] = serverTimestamp();
    data["size"] = 0;

    const { category, size } = data;
    await setDoc(doc(firestoreDb, "category", category), data);
    // categoryTemplate(category, size);
    main.classList.replace("opq", "tpt");
    const stId = setTimeout(() => {
        main.classList.remove("tpt");
        categorySelection = undefined;
    }, 3000);
});
const outer_form = forms.namedItem("outer_form");
forms.namedItem("rename-category").addEventListener("submit", async (e) => {
    e.preventDefault();
    e.submitter.closest("dialog").close();
    main.classList.add("opq");
    const oldCategory = categorySelection;
    const newCategory = new FormData(e.target).get("category");
    //get and rename docs from products collections
    const prodQuery = query(collection(firestoreDb, "products"), where("category", "==", oldCategory));
    const prodShot = await getDocs(prodQuery);
    // console.log(prodShot.docs.forEach(d => console.log(d.data())));
    console.log(categorySelection)
    if (prodShot.empty) {
        alert(`No product was found in the ${oldCategory} category.`);
        main.classList.remove("opq");
    } else {
        try {
            await runTransaction(firestoreDb, async (transaction) => {
                let temp = await transaction.get(doc(firestoreDb, "category", oldCategory));
                const promises = prodShot.docs.map(async snapshot => {
                    await transaction.update(doc(firestoreDb, "products", snapshot.id), {category: newCategory});
                });
                await Promise.all(promises);
                await transaction.delete(doc(firestoreDb, "category", oldCategory));
                let data = temp.data();
                data["category"] = newCategory;
                data["size"] = prodShot.size;
                await transaction.set(doc(firestoreDb, "category", newCategory), data);
            });
            document.querySelectorAll(".navlink .name").forEach(n => n.textContent == oldCategory ? n.textContent = newCategory : false)
            main.classList.replace("opq", "tpt");
            const stId = setTimeout(() => {
                categorySelection = undefined;
                enableDisableActionBtns(true);
                outer_form.reset();
                main.classList.remove("tpt");
                clearTimeout(stId);
            }, 2000);
        } catch(e) {
            console.log("Transaction failed:", e);
        }
    }
});

forms.namedItem("delete-category").addEventListener("submit", async (e) => {
    e.preventDefault();
    e.submitter.closest("dialog").close();
    main.classList.add("opq");
    await deleteDoc(doc(firestoreDb, "category", categorySelection));
    ///in the end...
    document.querySelectorAll(".navlink .name").forEach(n => n.textContent == categorySelection ? n.closest("li").remove() : false)
    main.classList.replace("opq", "tpt");
    const stId = setTimeout(() => {
        categorySelection = undefined;
        enableDisableActionBtns(true);
        outer_form.reset();
        main.classList.remove("tpt");
        clearTimeout(stId);
    }, 2000);
    outer_form.reset();
})
forms.namedItem("field-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    e.submitter.closest("dialog").close();
    main.classList.add("opq");
    const description = new FormData(e.target).get("description");
    await updateDoc(doc(firestoreDb, "category", categorySelection), { description });
    // document.querySelectorAll(".navlink .name").forEach(n => n.textContent == oldCategory ? n.closest("li").remove() : false)
    main.classList.replace("opq", "tpt");
    const stId = setTimeout(() => {
        categorySelection = undefined;
        enableDisableActionBtns(true);
        outer_form.reset();
        main.classList.remove("tpt");
        clearTimeout(stId);
    }, 2000);
})
function categoryTemplate(category, size, desc=null, state) {
    const clone = document.querySelector("[data-category-template]").content.cloneNode(true).children[0];
    clone.querySelector(".name").textContent = category;
    clone.querySelector(".size").textContent = `${size} products`;
    switch (state) {
        case "added":
            asideLeft.querySelector("ul").append(clone);
            break;
        case "modified":
            console.log("Modified");
            break;
        default:
            break;
    }
    // return {clone, desc};
    return {clone, desc};
}
const dialogs = document.querySelectorAll("dialog");
const actionBtns = document.querySelectorAll("button.actionBtn");
actionBtns.forEach((btn, idx) => {
    btn.addEventListener("click", (e) => {
        if (btn.classList.contains("add")) {
            asideLeft.classList.remove("show");
            dialogs[idx].showModal(); //show new-category dialog box
            return;
        } else if (btn.classList.contains("rename")) {
            dialogs[idx].showModal(); //show delete-category dialog box
        } else if (btn.classList.contains("delete")) {
            dialogs[idx].showModal(); //show delete-category dialog box
        }
        dialogs[idx].querySelector("output").innerHTML = btn.dataset.output;
    });
});

const resetBtns = document.querySelectorAll("input[type='reset']");
resetBtns.forEach(reset => {
    reset.addEventListener("click", () => {
        reset.closest("dialog").close();
    })
})
const fieldBtns = document.querySelectorAll(".field_btn");
fieldBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        const dialog = dialogs[4];
        const xCoord = btn.getBoundingClientRect().right - 350 + "px";   //300 being the set width of the dialog box
        const yCoord = btn.getBoundingClientRect().bottom + "px";
        dialog.style.top = yCoord;
        dialog.style.left = xCoord;
        const outerInput = dialog.querySelector("label input");
        const label = e.target.parentElement;
        dialog.querySelector("form label").htmlFor = outerInput.name = label.htmlFor;
        dialog.querySelector(".legend").textContent = label.querySelector(".legend").textContent;
        outerInput.value = label.children[2].value;
        outerInput.placeholder = label.children[2].placeholder;
        dialog.showModal();
    });
});
const barBtns = document.querySelectorAll(".bar_btn");
barBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        asideLeft.classList.toggle("show", Boolean(Number(btn.dataset.menuClass)));
    });
});