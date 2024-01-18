import createInstance from "./createInstance";

export {
    createInstance,
}
export * from "./types";

// 默认实例导出
const instance = createInstance();
export const classDecorator = instance.classDecorator;
export const createDecorator = instance.createDecorator;
// export const fieldDecorator = instance.fieldDecorator;
export const methodDecorator = instance.methodDecorator;
// export const getterDecorator = instance.getterDecorator;
export const enableLog = instance.enableLog;
// export const accessorDecorator = instance.accessorDecorator;
export const getMethodConfig = instance.getMethodConfig;
// export const getStatistics = instance.getStatistics;

// 全局属性申明
declare global {
    namespace globalThis {
        const catchClassDecorator: typeof instance.classDecorator;
        const catchCreateDecorator: typeof instance.createDecorator;
        // const petalFieldDecorator: typeof instance.fieldDecorator;
        // const petalMethodDecorator: typeof instance.methodDecorator;
        // const petalAccessorDecorator: typeof instance.accessorDecorator;
        // const petalGetterDecorator: typeof instance.getterDecorator;

        const catchEnableLog: typeof instance.enableLog;
        const catchGetMethodConfig: typeof instance.getMethodConfig;
        // const petalGetStatistics: typeof instance.getStatistics;
    }

}
// 全局属性设置
var g = globalThis as any;
g.catchClassDecorator = instance.classDecorator;
g.catchCreateDecorator = instance.createDecorator;
// g.petalFieldDecorator = instance.fieldDecorator;
// g.petalMethodDecorator = instance.methodDecorator;
// g.petalAccessorDecorator = instance.accessorDecorator;
// g.petalGetterDecorator = instance.getterDecorator;

// g.petalSetRequestInstance = instance.setRequestInstance;
g.catchEnableLog = instance.enableLog;
g.catchGetMethodConfig = instance.getMethodConfig;
// g.petalGetStatistics = instance.getStatistics;

g.catchCreateInstance = createInstance;
