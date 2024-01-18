import { createInstance } from "../src/index"

const { classDecorator, methodDecorator } = createInstance({
    defaults: {
        handler(params) {
            console.log("params:", params);
        },
    }
});

@classDecorator()
class TestClass {

    @methodDecorator({
        // handler(params) {
        //     console.log("methodDecorator:", params);
        // },
    })
    testMethod() {
        console.log("Hello World");
        throw new Error("test error");
    }
}


(new TestClass).testMethod(); // 输出 "Hello World"