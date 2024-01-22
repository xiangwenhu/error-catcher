import { DEFAULT_CONFIG, METHOD_WHITELIST } from "../const";
import { CreateDecoratorOptions } from "../types";
import { ClassCatchConfig } from '../types/errorCatch';
import { tryProxyMethod } from "./method";
import { checkIsInWhitelist } from "./util";

function autoCatchMethods(
    OriClass: any,
    context: ClassDecoratorContext<any>,
    creatorOptions: CreateDecoratorOptions,
    config: ClassCatchConfig
) {
    const { dataStore, logger } = creatorOptions;

    class NewClass extends OriClass {
        constructor(...args: any) {
            super(...args);
            proxyInstanceMethods(this);
        }
    }

    // this: class
    // target: class
    // context: demo '{"kind":"class","name":"Class的Name"}'
    logger.log("classDecorator:", OriClass.name);


    // 静态方法 代理， 代理的是原Class的方法，传递的thisObject是NewClass
    const thisObject = NewClass;
    context.addInitializer(function () {
        dataStore.updateClassConfig(NewClass, config);
        // 静态方法
        Reflect.ownKeys(OriClass).filter(name => {
            const isInWhitelist = Array.isArray(config.whiteList) ? checkIsInWhitelist(name, config.whiteList) : true;
            return !isInWhitelist && typeof OriClass[name] === 'function'
        }).forEach(name => {
            const method = OriClass[name] as Function;
            tryProxyMethod(method, name, thisObject, creatorOptions, () => {
                dataStore.updateStaticMethodConfig(NewClass, method, { config: {} });
            })
        })
    });

    // 实例方法
    function proxyInstanceMethods(instance: any) {
        const proto = Object.getPrototypeOf(instance.constructor.prototype)
        Reflect.ownKeys(proto).filter(name => {
            return METHOD_WHITELIST.indexOf(name) == -1 && typeof proto[name] === 'function'
        }).forEach(name => {
            const method = proto[name] as Function;
            tryProxyMethod(method, name, instance, creatorOptions, () => {
                dataStore.updateStaticMethodConfig(instance, method, { config: {} });
            })
        })
    }

    return NewClass;
}

export function createClassDecorator(creatorOptions: CreateDecoratorOptions) {
    /**
     * 示例
     */
    return function classDecorator(config: ClassCatchConfig = DEFAULT_CONFIG): any {
        return function (
            target: Function,
            context: ClassDecoratorContext<any>
        ) {
            const { dataStore, logger } = creatorOptions;

            if (context.kind !== "class") {
                throw new Error("classDecorator 只能用于装饰class");
            }

            // this: class
            // target: class
            // context: demo '{"kind":"class","name":"Class的Name"}'

            // 自动捕获 实例方法  和 静态方法
            if (!!config.autoCatchMethods) {
                const NewClass = autoCatchMethods(target, context, creatorOptions, config)
                return NewClass;
            } else {
                logger.log("classDecorator:", target.name);
                context.addInitializer(function () {
                    const _class_ = target;
                    dataStore.updateClassConfig(_class_, config);
                });
            }
        };
    };
}

