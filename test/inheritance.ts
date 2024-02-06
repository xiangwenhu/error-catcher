import { classDecorator, methodDecorator, setConfig } from "../src";

setConfig({
    handler(params) {
        console.log(`error handler:: function name : ${params.func?.name}, isStatic: ${params.isStatic}`);
    }
})

@classDecorator({
    autoCatchMethods: true,
    chain: true
})
class SuperClass {

    private methodName = 'methodName';
    static staticMethodName = 'staticMethodName';

    superMethod() {
        console.log('superMethod methodName', this.methodName);
        throw new Error('superMethod');
    }

    @methodDecorator({
        // throw: false,
        handler() { console.log('methodDecorator handler'); }
    })
    static superStaticMethod() {
        console.log('superStaticMethod methodName', this.staticMethodName);
        throw new Error('superStaticMethod');
    }
}


@classDecorator({
    autoCatchMethods: true
})
class SubClass extends SuperClass {

    private subMethodName = 'methodName';
    static subStaticMethodName = 'staticMethodName';

    subMethod() {
        console.log('superMethod methodName', this.subMethodName);
        throw new Error('superMethod');
    }

    static subStaticMethod() {
        console.log('superStaticMethod methodName', this.subStaticMethodName);
        throw new Error('superStaticMethod');
    }
}

const subClass = new SubClass();
subClass.superMethod();
// subClass.subMethod();

try {
    // SubClass.superStaticMethod();
    // SubClass.subStaticMethod();

} catch (err: any) {
    console.log('SubClass.superStaticMethod: error', err && err.message);
}

