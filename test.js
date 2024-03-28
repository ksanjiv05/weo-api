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

class Test {
  static a;
  static b = "test2";
  static c = "test3";
  constructor() {
    console.log("Test constructor");

    this.c = "test4";
  }
  testMethod() {
    console.log("Test method test");
  }
  testX = () => {};
  static testStaticMethod() {
    console.log("Test static method test2");
  }
}
// const test = new Test();

// console.log("Test.c ", test.c);
// console.log("Test.b ", Test.c);

// Test.testStaticMethod();
// test.testMethod();

class Office {
  static staffs = [];

  static getTotalStaff() {
    console.log("Total staff", Office.staffs.length);
  }
  static addStaff(staff) {
    Office.staffs.push(staff);
    console.log("staff added successfully", staff);
  }
  static removeStaff(id) {
    const isStaffAvilable = Office.checkStaff(id);
    if (!isStaffAvilable) {
      console.log("Staff not found");
      return;
    }
    Office.staffs = Office.staffs.filter((staff) => {
      return staff.staffId !== id;
    });
    console.log("staff removed successfully", id);
  }
  static checkStaff(id) {
    return Office.staffs.find((s) => {
      return s.staffId === id;
    });
  }
  static getOfficeName() {
    console.log("Office name");
  }
}

class Staff {
  constructor(staffName, staffId, staffSalary) {
    this.staffName = staffName;
    this.staffId = staffId;
    this.staffSalary = staffSalary;
  }
  getStaffName() {
    console.log("Staff name ", this.staffName);
  }
  getStaffId() {
    console.log("Staff id", this.staffId);
  }
  getStaffSalary() {
    console.log("Staff salary", this.staffSalary);
  }
}

Office.getTotalStaff();

const sanjiv = new Staff("Sanjiv", 1, 1000);
Office.addStaff(sanjiv);
Office.getTotalStaff();
const atiya = new Staff("Atiya", 2, 2000);
Office.addStaff(atiya);
Office.getTotalStaff();
const nigar = new Staff("Nigar", 3, 3000);
Office.addStaff(nigar);
Office.getTotalStaff();
console.log(Office.staffs);
Office.removeStaff(2);
console.log(Office.staffs);

Office.getTotalStaff();
const staff = Office.checkStaff(23);
console.log("staff ", staff);

///-------------Library management system ----------------
class Book {
  constructor(bookName, bookId, bookPrice, author) {
    this.bookName = bookName;
    this.bookId = bookId;
    this.author = author;
    this.bookPrice = bookPrice;
  }
  getBookName() {
    console.log("Book name ", this.bookName);
  }
  getBookId() {
    console.log("Book id ", this.bookId);
  }
  getBookPrice() {
    console.log("Book price ", this.bookPrice);
  }
  getAuthor() {
    console.log("Author ", this.author);
  }
}

const book1 = new Book("Book1", 1, 100, "Author1");
const book2 = new Book("Book2", 2, 200, "Author2");

class Library {
  static books = [];
  static addBook(book) {}
  static removeBook(id) {}
  static checkBook(id) {}
  static getBook(id) {}
  static getBooks() {
    console.log("Books ", Library.books);
  }
}
