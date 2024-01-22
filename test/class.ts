import { createInstance } from "../src/index"

const { classDecorator, methodDecorator } = createInstance({
    defaults: {
        handler(params) {
            console.log("error handler:", params.func?.name);
        },
    }
});

@classDecorator({
    autoCatchMethods: true,
    whiteList: ['staticMethod']
})
class TestClass {

    private name: string = 'name';

    public static staticName: string = 'staticName';

    static staticMethod() {
        console.log('this === TestClass:', this === TestClass);
        console.log("staticName:", this.staticName);
        throw new Error("test staticMethod error");
    }

   testMethod(data: any) {
        console.log("this.name", this.name);
        throw new Error("test error");
    }
}


(new TestClass()).testMethod({ name: "test" });
console.log("----------------------------------")
TestClass.staticMethod();