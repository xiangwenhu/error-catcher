import { DEFAULT_CONFIG, SYMBOL_ORIGIN_FUNCTION, SYMBOL_RELATED_CLASS } from "../const";
import { CreateDecoratorOptions } from "../types";
import { CatchConfig } from "../types/errorCatch";
import { executeCall } from "./util";

export function createMethodDecorator(
    createDecoratorOptions: CreateDecoratorOptions
) {
    return function methodDecorator(config: CatchConfig = DEFAULT_CONFIG) {
        return function (
            target: Function,
            context: ClassMethodDecoratorContext<any>
        ) {
            if (context.kind !== "method") {
                throw new Error("methodDecorator 只能用于装饰class的method");
            }
            if (context.private) {
                throw new Error(`methodDecorator 不能用于装饰class的private method: ${String(context.name)}`);
            }
            const method = context.static
                ? innerStaticMethodDecorator
                : innerMethodDecorator;

            method(target, context, config, createDecoratorOptions);
        };
    };
}

export function tryProxyMethod(
    method: Function,
    propertyName: PropertyKey,
    propertyOwner: Function | Object,
    oriClass: Function,
    /**
     * 函数调用的上下文， class 或者 实例，也作为获取 getMethodMergedConfig 的 key
     */
    thisObject: Function | Object,
    creatorOptions: CreateDecoratorOptions,
    callback?: (proxiedFunction: Function) => void
) {
    function proxyMethod() {
        const { defaults, dataStore, logger } = creatorOptions;

        // 读取最终合并后的配置
        const { config, errorHandlers } = dataStore.getMethodMergedConfig(
            thisObject,
            oriClass,
            method,
            defaults,
        );
        logger.log(
            `${thisObject.constructor.name} ${method.name} final config:`,
            config
        );

        return executeCall({
            args: arguments,
            thisObject,
            method,
            config,
            logger,
            errorHandlers: errorHandlers as any[]
        });
    }

    Object.defineProperty(proxyMethod, SYMBOL_ORIGIN_FUNCTION, {
        configurable: false,
        get() {
            return method
        }
    })

    const { logger } = creatorOptions;
    try {
        // 防止被串改
        Object.defineProperty(propertyOwner, propertyName, {
            configurable: false,
            writable: false,
            value: proxyMethod,
        });
    } catch (err) {
        return logger.error("innerMethodDecorator defineProperty error:", err);
    }
    callback && callback(proxyMethod);
}

function innerMethodDecorator(
    method: Function,
    context: ClassMethodDecoratorContext<any>,
    config: CatchConfig,
    creatorOptions: CreateDecoratorOptions
) {
    let classInstance: Function;
    context.addInitializer(function () {

        const { dataStore, logger } = creatorOptions;
        // this: class instance
        // target: method
        // context: demo {"kind":"method","name":"eat","static":false,"private":false,"access":{}}
        classInstance = this;
        const _class_ = classInstance.constructor;

        tryProxyMethod(method, context.name, classInstance, _class_, classInstance, creatorOptions, () => {
            logger.log(
                `innerMethodDecorator class:${_class_.name}, method:${String(
                    context.name
                )}`
            );

            dataStore.updateMethodConfig(_class_, method, {
                config: {
                    ...config,
                    isStatic: false,
                }
            });
        })

    });
}

function innerStaticMethodDecorator(
    method: Function,
    context: ClassMethodDecoratorContext<Function>,
    config: CatchConfig,
    creatorOptions: CreateDecoratorOptions
) {

    let _class_: Function;
    context.addInitializer(function () {
        const { logger, dataStore } = creatorOptions;
        // this: class
        // target: 静态method
        // context: demo: {"kind":"method","name":"run","static":true,"private":false,"access":{}}
        _class_ = this;
        logger.log(
            `innerStaticMethodDecorator class:${_class_.name}, method:${String(
                context.name
            )}`
        );

        tryProxyMethod(method, context.name, _class_, _class_, _class_, creatorOptions, () => {
            dataStore.updateStaticMethodConfig(_class_, method, {
                config: {
                    ...config,
                    isStatic: true,
                }
            });
        })

    });

}
