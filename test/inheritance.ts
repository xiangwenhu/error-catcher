import { classDecorator } from "../src";

@classDecorator({
    autoCatchMethods: true
})
class SuperClass {

    private methodName =  'methodName';
    static staticMethodName = 'staticMethodName';

    superMethod() {
        console.log('superMethod methodName', this.methodName);
        throw new Error('superMethod');
    }


    static superStaticMethod() {
        console.log('superStaticMethod methodName', this.staticMethodName);
        throw new Error('superStaticMethod');
    }

}


@classDecorator({
    autoCatchMethods: true
})
class SubClass extends SuperClass {

    private subMethodName =  'methodName';
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


// new SubClass().superMethod();


SubClass.superStaticMethod();
SubClass.subStaticMethod();

