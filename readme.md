
## 错误捕获
基于最新的装饰器，捕获class的方法的异常。






## 示例

### 普通class
```typescript
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
        console.log("this.name", this.name, data);
        throw new Error("test error");
    }
}


(new TestClass()).testMethod({ name: "test" });
console.log("----------------------------------")
TestClass.staticMethod();
```

### 带继承的class
```typescript
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


```




### vite + react
vite 配置, 注意 version
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
    babel: {
      plugins: [
        ['@babel/plugin-proposal-decorators', { version: "2022-03" }],
        ['@babel/plugin-proposal-class-properties', { version: "2022-03" }],
        ["@babel/plugin-transform-class-static-block"]
      ],
    }
  })],
})
```

组件代码
```typescript
import React from "react";
import { methodDecorator } from "./error-catch";

export default class ClassComponent extends React.Component {

    @methodDecorator({
        handler(params) {
            console.log("error hander:", params.func?.name, params.error)
        }
    })
    OnButtonClick() {
        console.log("OnButtonClick")
        throw new Error("OnButtonClick")
    }

    render() {
        return <div>
            <button onClick={this.OnButtonClick}>我是按钮</button>
        </div>
    }
}
```