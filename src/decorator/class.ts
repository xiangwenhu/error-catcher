import { DEFAULT_CONFIG, METHOD_WHITELIST } from "../const";
import { CreateDecoratorOptions } from "../types";
import { ClassCatchConfig } from '../types/errorCatch';
import { tryProxyMethod } from "./method";

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


            
            const OriClass: any = target;
            class NewClass extends OriClass {
                constructor(...args: any) {
                    super(...args);
                    proxyInstanceMethods(this);
                }
            }


            // this: class
            // target: class
            // context: demo '{"kind":"class","name":"Class的Name"}'
            logger.log("classDecorator:", target.name);

            context.addInitializer(function () {
                const _class_ = target;
                dataStore.updateClassConfig(_class_, config);

                // 静态方法
                Reflect.ownKeys(_class_).filter(name => {
                    // @ts-ignore
                    return METHOD_WHITELIST.indexOf(name) == -1 && typeof _class_[name] === 'function'
                }).forEach(name => {
                    // @ts-ignore
                    const method = _class_[name] as Function;
                    tryProxyMethod(method, name, _class_, creatorOptions, () => {
                        dataStore.updateStaticMethodConfig(_class_, method, { config: {} });
                    })
                })
            });

            function proxyInstanceMethods(instance: any) {
                const proto = Object.getPrototypeOf(instance.__proto__)
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

        };
    };
}