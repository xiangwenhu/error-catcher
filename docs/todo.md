
## TODO 

- [x] handler的链式执行， `method => class => createInstance`
- [x] 可中断的链式执行 
handler返回false, 表示停止冒泡处理错误
```typescript
@classDecorator({
    autoCatchMethods: true,
    // whiteList: ['staticMethod'],
    throw: true,
    chain: true,
    handler(params) {
        console.log(`classDecorator error handler:: function name : ${params.func?.name}, isStatic: ${params.isStatic}`);
        // 返回 false ，表示停止冒泡
        return false;
    }
})

```
- [ ] class定义handler和其他选项
- [ ] 全局暴露实例和types申请