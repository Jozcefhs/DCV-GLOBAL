//VERY IMPORTANT: Store items in cart with their IDs
//On cart page, fetch the current state of each document, including price and quantity available

//the Blob API
// let myblob = new Blob(["An image data array buffer."]);
// const promise = await myblob.arrayBuffer().then(res => {
//     console.log(res.byteLength, res.slice(0,7))
// });
// console.log(promise.Int8Array);
//
const blob = Object.values({
    "0": 65,
    "1": 110,
    "2": 32,
    "3": 105,
    "4": 109,
    "5": 97,
    "6": 103,
    "7": 101,
    "8": 32,
    "9": 100,
    "10": 97,
    "11": 116,
    "12": 97,
    "13": 32,
    "14": 117,
    "15": 114,
    "16": 108
});

const fr = new FileReader();
fr.onload = () => {
    console.log(fr.result)
}
fr.readAsArrayBuffer([...blob]);
// console.log(blob)