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


    @methodDecorator({
        handler(params) {
            console.log("staticMethod handler:", params.func?.name);
        }
    })
    static staticMethod() {
        console.log('this === TestClass:', this === TestClass);
        console.log("staticName:", this.staticName);
        throw new Error("test staticMethod error");
    }

   
    @methodDecorator({
        handler(params) {
            console.log("testMethod handler:", params.func?.name);
        }
    })
    testMethod(data: any) {
        console.log("this.name", this.name);
        throw new Error("test error");
    }
}


(new TestClass()).testMethod({ name: "test" });
console.log("----------------------------------")
TestClass.staticMethod();