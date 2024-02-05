## 问题
1. 如何判断一个函数是 async 函数，
比如函数会被转换。 
```js
async function asyncFun() { }
```
```js
'function asyncFun() {
    return __awaiter(this, void 0, void 0, function* () { });
}
```
一种是直接通过函数本身来判断，
二是通过 函数执行后的返回结果来判断，如果返回的是结果是Promise实例，则说明是async函数。