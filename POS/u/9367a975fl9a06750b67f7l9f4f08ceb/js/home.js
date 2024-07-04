import { firebaseConfig, initializeApp, getFirestore, and, collection, doc, getDoc, query, where } from "../../../js/firebase_xp.js";

const userSchema = {
    deliveryAddress: "",
    email: "",
    isUser: "subscriber",
    isUserId: "9367a975fl9a06750b67f7l9f4f08ceb",
    phone: "",
    secret: "",
    username: "",
    userImageURL: "",
}

const userSchema1 = {
    deliveryAddress: "",
    email: "",
    isUser: "staffer",
    isUserId: "5c0864814bale06b098ba574bd0e0f2f",
    phone: "",
    secret: "",
    username: "",
    userImageURL: "",
}

export {userSchema as subscriber, userSchema1 as staffer}