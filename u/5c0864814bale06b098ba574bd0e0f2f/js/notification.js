import { fbInitializer } from "../../../js/firebase_xp.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-messaging.js";
const app = fbInitializer();
const messaging = getMessaging(app);
//Add public key generated from the console
getToken(messaging, {vapidKey: "BOBajgOp6r-0H6xWPZj29zqG3QjzZ2wU2aCEACEkkb06ohUshrBp0IWR8BVZucLsJASTpe4-E9taKmNots5tYeQ"}).then((currentToken) => {
    if (currentToken) { //eYg9ZZmG0Z3QWtM7-3eWwT:APA91bEt1Nvx1sDWelfR-6HzPPvYAROcj0FR7E1GzKb9jwrr3cG_A7TXInxg5QwO9HNk6DFe5efQZdTtitEV3gzczRVs2oT6nrPljFJ3pOVraWh4VML5iEeD4kYa2WA-fXQNK6Fasn_k
        // Send the token to your server and update the UI if necessary
        // ...
    } else {
        // Show permission request UI
        console.log('No registration token available. Request permission to generate one.');
        // ...
    }
}).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
// ...
});

onMessage(messaging, (payload) => console.log("Message received: ", payload));