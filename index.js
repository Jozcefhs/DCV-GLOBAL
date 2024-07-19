//store cache data with name: "/udesc"
// import { subscriber, staffer } from "./u/9367a975fl9a06750b67f7l9f4f08ceb/js/home.js";

// console.log(window.localStorage.setItem("/udesc", JSON.stringify(subscriber)));
const udesc = window.localStorage.getItem("/udesc");
if (udesc == null) {
    document.location.href = "/home.html";
} else {
    const userPath = JSON.parse(udesc).isUserId;
    document.location.href = `/u/${userPath}/htm/home.html`
}
// localStorage.setItem("user", "logged in")