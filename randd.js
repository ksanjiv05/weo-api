// Accessories: [Accessories, Bag, belts, gloves, sunglasses, wallets, watches];
// Clothing: [
//   Clothing,
//   Coats,
//   Dresses,
//   Hoodies & Sweatshirts,
//   jackets,
//   jeans,
//   pants,
// ];
// Shoes: [Shoes, Boots, Loafers, Sandals, Slippers];

let str = "w3resource";
let st2 = [];
let temp = "";
for (let i = 0; i < str.length; i++) {
  if ((i + 1) % 2 == 0) {
    //1%2
    temp = temp + str[i];
    st2.push(temp);
    temp = "";
  } else {
    temp = temp + str[i]; //w
  }
}
st2.push(temp);
//console.log(st2);

function chop_str(str, inc = 0) {
  if (inc == 0) return [str];
  let str2 = [];
  for (let i = 0; i < str.length / inc; i++) {
    str2.push(str.slice(i * inc, i * inc + inc)); //inc=2,2,4
  }
  return str2;
}

console.log(chop_str("w3resource", 2));

function str_chop(text, number = undefined) {
  const choppedString = [];

  const length = String(text).length;

  let sliceLength = 1;
  if (number) {
    sliceLength = length / number;
  }

  for (let i = 0; i < sliceLength; i++) {
    const string = text.slice(i * number, i * number + number);
    choppedString.push(string);
  }

  return choppedString;
}

// console.log("String has been chopped:\n" + str_chop("W3resource", 3));

let str3 = "w3resource sps 45 ddshh sushd";
let stArr = str3.split(" ");

let st = "";
// for (let i = 0; i < stArr.length; i++) {
//   for (let j = 0; j < stArr[i].length; j++) {
//     if (stArr[i][0] == "s" || stArr[i][stArr[i].length - 1] == "s") {
//       st = st + stArr[i][j];
//     } else if (stArr[i][j] == "s") {
//       st = st + stArr[i][j].toUpperCase();
//     } else st = st + stArr[i][j];
//   }
//   st = st + " ";
// }

for (let i = 0; i < stArr.length; i++) {
  for (let j = 0; j < stArr[i].length; j++) {
    if (j == 0 || j == stArr[i].length - 1) {
      st = st + stArr[i][j];
    } else if (stArr[i][j] == "s") {
      st = st + stArr[i][j].toUpperCase();
    } else st = st + stArr[i][j];
  }
  st = st + " ";
}

// console.log(st);
for (let i = 0; i < stArr.length; i++) {
  // console.log(parseInt(stArr[i]), parseInt(stArr[i]) == "NaN");
  if (isNaN(parseInt(stArr[i]))) {
    console.log(stArr[i]);
  }
}

console.log(" ", new Date("2024-02-29T06:30:00.000+00:00").toTimeString());

// anagrame string test exmaple
str = "this is string test for  palindrome level ana  ";
