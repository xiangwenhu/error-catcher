import { DEFAULT_CONFIG } from "../const";
import { CreateDecoratorOptions } from "../types";
import { ClassCatchConfig } from '../types/errorCatch';

export function createClassDecorator({ dataStore, logger }: CreateDecoratorOptions) {
    /**
     * 示例
     */
    return function classDecorator(config: ClassCatchConfig = DEFAULT_CONFIG) {
        return function (
            target: Function,
            context: ClassDecoratorContext<any>
        ) {
            if (context.kind !== "class") {
                throw new Error("classDecorator 只能用于装饰class");
            }

            // this: class
            // target: class
            // context: demo '{"kind":"class","name":"Class的Name"}'
            logger.log("classDecorator:", target.name);
            context.addInitializer(function () {
                const _class_ = target;
                dataStore.updateClassConfig(_class_, config);
            });
        };
    };
}