import { createInstance } from "../src/index"

const { classDecorator, methodDecorator } = createInstance({
    defaults: {
        handler(params) {
            console.log("error handler:", params);
        },
    }
});

@classDecorator()
class TestClass {

    private name: string = 'name';

    static staticName: string = 'staticName';


    // @methodDecorator()
    static staticMethod() {
        console.log("staticName:", this.staticName);
        throw new Error("test staticMethod error");
    }

    // @methodDecorator()
    testMethod(data: any) {
        console.log("this.name", this.name);
        throw new Error("test error");
    }
}


// (new TestClass()).testMethod({ name: "test" });

TestClass.staticMethod();