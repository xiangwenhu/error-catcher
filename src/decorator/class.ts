import { DEFAULT_CONFIG, METHOD_WHITELIST, SYMBOL_CLASS_BY_PROXY_FLAG } from "../const";
import { CreateDecoratorOptions } from "../types";
import { ClassCatchConfig } from '../types/errorCatch';
import { tryProxyMethod } from "./method";
import { checkIsInWhitelist, geOriginalPrototype } from "./util";

function autoCatchMethods(
    OriClass: any,
    context: ClassDecoratorContext<any>,
    creatorOptions: CreateDecoratorOptions,
    config: ClassCatchConfig
) {
    const { dataStore, logger } = creatorOptions;

    OriClass[SYMBOL_CLASS_BY_PROXY_FLAG] = true;

    class NewClass extends OriClass {
        constructor(...args: any[]) {
            super(...args);
            // 调用的时候this为实例，方法是原型上的方法
            const instance = this;
            const proto = geOriginalPrototype(instance, OriClass);
            proxyInstanceMethods(instance, proto);
        }
    }

    // this: class
    // target: class
    // context: demo '{"kind":"class","name":"Class的Name"}'
    logger.log("classDecorator:", OriClass.name);
    const whiteList = METHOD_WHITELIST.concat(... (config.whiteList || []))

    // 静态方法 代理， 代理的是原Class的方法，传递的thisObject是NewClass
    const thisObject = NewClass;
    context.addInitializer(function () {
        dataStore.updateClassConfig(NewClass, config);
        // 静态方法
        Reflect.ownKeys(OriClass).filter(name => {
            // 白名单检查
            const isInWhitelist = checkIsInWhitelist(name, whiteList);
            return !isInWhitelist && typeof OriClass[name] === 'function'
        }).forEach(name => {
            const method = OriClass[name] as Function;
            // 监听调用和捕获异常
            tryProxyMethod(method, name, thisObject, creatorOptions, () => {
                // 存储相关信息
                dataStore.updateStaticMethodConfig(NewClass, method, { config: {
                    isStatic: true
                } });
            })
        })
    });

    // 原型（非静态）方法
    function proxyInstanceMethods(instance: any, proto: any) {
        Reflect.ownKeys(proto).filter(name => {
            // 白名单
            const isInWhitelist = checkIsInWhitelist(name, whiteList);
            return !isInWhitelist && typeof proto[name] === 'function'
        }).forEach(name => {
            const method = proto[name] as Function;
            // 监听调用和捕获异常
            tryProxyMethod(method, name, instance, creatorOptions, () => {
                //存储相关信息
                dataStore.updateMethodConfig(NewClass, method, { config: {
                    isStatic: false
                } });
            })
        })
    }
    return NewClass;
}

export function createClassDecorator(creatorOptions: CreateDecoratorOptions) {
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

            // 自动捕获 非静态（原型）方法  和 静态方法
            if (!!config.autoCatchMethods) {
                //  通过Class的继承监听构造函数，会返回新的 Class
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

