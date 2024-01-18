## 问题
1. 如何判断一个函数是 async 函数，
比如函数会被转换
```js
async function asyncFun() { }
```
```js
'function asyncFun() {
    return __awaiter(this, void 0, void 0, function* () { });
}
```