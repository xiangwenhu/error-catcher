import { createInstance } from "../src/index"

const { classDecorator, methodDecorator } = createInstance({
    defaults: {
        handler(params) {
            console.log(`default error handler:: function name : ${params.func?.name}, isStatic: ${params.isStatic}`);

        },
    }
});

@classDecorator({
    autoCatchMethods: true,
    handler(params) {
        console.log(`classDecorator error handler:: function name : ${params.func?.name}, isStatic: ${params.isStatic}`);
        // 返回 false ，表示停止冒泡
        return false;
    }
})
class TestClass {

    private name: string = 'name';

    public static staticName: string = 'staticName';

    static staticMethod() {
        console.log('this === TestClass:', this === TestClass);
        console.log("staticName:", this.staticName);
        throw new Error("test staticMethod error");
    }

    async testMethod(data: any) {
        console.log("this.name", this.name);
        throw new Error("test error");
    }
}


(new TestClass()).testMethod({ name: "test" });
console.log("----------------------------------")
TestClass.staticMethod();