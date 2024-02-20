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

    private superMethodName = 'superMethodName';
    static superStaticMethodName = 'staticMethodName';

    superMethod() {
        console.log('superMethod superMethodName', this.superMethodName);
        throw new Error('superMethod');
    }

    static superStaticMethod() {
        console.log('superStaticMethod superStaticMethodName', this.superStaticMethodName);
        throw new Error('superStaticMethod');
    }
}


@classDecorator({
    autoCatchMethods: true
})
class SubClass extends SuperClass {

    private subMethodName = 'subMethodName';
    static subStaticMethodName = 'subStaticMethodName';

    subMethod() {
        console.log('subMethod subMethodName', this.subMethodName);
        throw new Error('superMethod');
    }

    static subStaticMethod() {
        console.log('subStaticMethod methodName', this.subStaticMethodName);
        throw new Error('superStaticMethod');
    }
}

const subClass = new SubClass();
subClass.superMethod();
subClass.subMethod();

try {
    SubClass.superStaticMethod();
    SubClass.subStaticMethod();

} catch (err: any) {
    console.log('SubClass.superStaticMethod: error', err && err.message);
}

