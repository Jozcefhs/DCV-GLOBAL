import { fbInitializer } from "../../../js/firebase_xp.js";
const db = fbInitializer();

// const firebaseConfig = firebaseConfig;
const browse = document.querySelector("[data-link]");
browse.onclick = function () {
    document.location.href = `../u/${browse.dataset.link}/htm/home.html`;
}

const actionBoxButtons = [...document.querySelectorAll(".action_box_button")];
actionBoxButtons.forEach(actionBtn => {
    actionBtn.addEventListener("click", (e) => {
        e.target.offsetParent.classList.remove("show");
        const dialog = e.target.form.offsetParent;  //targeting the dialog parent
        dialog.close();
    });
});
const userforms = [...document.forms];
userforms.forEach((form, idx) => {
    form.addEventListener("reset", (e) => {
        form.parentElement.close();   
    });
    
    if (idx == 0) { //sign up form
        form.addEventListener("change", (e) => {
            if (e.target.type == "password") {
                const fd = new FormData(form);
                let secrets = fd.getAll("secret");
                if (secrets[0] == secrets[1]) {
                    console.log(`Yes, the secrets ${secrets[1]} are the same.`);
                } else {
                    console.log(form.reportValidity());
                }
            };
        });
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            // form.requestSubmit(e.target.submitter);
            const fd = new FormData(form);
            fd.append("isUser", "subscriber");
            fd.append("isUserId", "9367a975fl9a06750b67f7l9f4f08ceb");
            fd.append("userImageURL", "/img/favicon2_.png");
            const email = fd.get("email");
            //check if email exists; if no, register user
            await getDoc()
            if ("") { //if email does not exist
                console.log("Register new user and display Success Message.")
                actionBoxButtons[0].parentElement.classList.add("show");
            } else {
                console.log("Display Failed Message.")
                actionBoxButtons[1].parentElement.classList.add("show");
            }

            // for (const [k, v] of fd.entries()) console.log(k, v)
        });
    } else if (idx == 1) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const email = fd.get("email");
            const secret = fd.get("secret");

            //await doc from backend, the cache it as /udesc
        })
    }
    
});