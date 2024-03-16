class TestCalss {
  constructor(name) {
    console.log("TestCalss constructor");
    this.myname = name;
  }
  test() {
    console.log("TestCalss method test ", this.myname);
  }
}

const test = new TestCalss("sanjiv k");

const test2 = new TestCalss("Atiya N");
test2.test();

test.test();

const objTest = {
  name: "sanjiv",
  test: function () {
    console.log("objTest method test", this.name);
  },
};
objTest.name = "Atiya";
// objTest.test();
