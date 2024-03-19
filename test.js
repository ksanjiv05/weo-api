// class TestCalss {
//   constructor(name) {
//     console.log("TestCalss constructor");
//     this.myname = name;
//   }
//   test() {
//     console.log("TestCalss method test ", this.myname);
//   }
// }

// const test = new TestCalss("sanjiv k");

// const test2 = new TestCalss("Atiya N");
// test2.test();
// test.test();

// const objTest = {
//   name: "sanjiv",
//   test: function () {
//     console.log("objTest method test", this.name);
//   },
// };
// objTest.name = "Atiya";
// objTest.test();

//class

class Person {
  constructor(firstName, lastName) {
    console.log("Person constructor");
    this.firstN = firstName;
    this.lastName = lastName;
  }
  getFirstName() {
    console.log("first name ", this.firstN);
  }
  getLastName() {
    console.log("last name ", this.lastName);
  }

  getFullName() {
    console.log("full name ", this.firstN + " " + this.lastName);
  }
}

// const person = new Person("Atiya", "Nigar");

// person.getFullName();
// person.getFirstName();
// person.getLastName();

class CustomStringMethod {
  constructor(str) {
    this.str = str;
  }
  getLength() {
    return this.str.length;
  }
  getUpperCase() {
    return this.str.toUpperCase();
  }
  getLowerCase() {
    return this.str.toLowerCase();
  }
  // getLowerCase(str) {
  //   console.log("str ", str);
  //   return str.toLowerCase();
  // }
  // getReverse() {
  //   return this.str.split("").reverse().join("");
  // }
}

// const customStringMethod = new CustomStringMethod("sanjiv".length);
// const rev = customStringMethod.getReverse();
// // console.log("rev ", rev);

// const customStringMethod2 = new CustomStringMethod("Atiya Nigar");
// const rev2 = customStringMethod2.getReverse();
// console.log("lower case  ", customStringMethod.getLowerCase());
// console.log("lower case 2 ", customStringMethod.getLowerCase("testIIIIIII"));

function findPlainDrom(str) {
  let str3 = "";
  for (i = str.length - 1; i >= 0; i--) {
    str3 = str3 + str[i];
  }
  return str3;
}

function findPlainDrom2(str2) {
  let str4 = str2.split(" ");
  let plainDromWords = "";
  for (let i = 0; i < str4.length; i++) {
    let pld = findPlainDrom(str4[i]);
    if (pld == str4[i]) {
      plainDromWords = plainDromWords + str4[i] + " ";
    }
  }
  return plainDromWords;
}

console.log(findPlainDrom2("a rececar radar madam"));
