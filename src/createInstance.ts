import { SYMBOL_ORIGIN_FUNCTION } from "./const";
import DataStore from "./dataStore";
import { createClassDecorator } from "./decorator/class";
import { createMethodDecorator } from "./decorator/method";
import { merge } from "./lib/merge";
import getLogger from "./logger";
import {
    CreateDecoratorOptions,
    CatchRootConfig,
} from "./types";
import { CatchConfig } from "./types/errorCatch";
import {
    getProperty,
} from "./util";


/**
 * 创建服务实例
 * @param config
 * @returns
 */
export default function createInstance(config: CatchRootConfig = {}) {
    const dataStore = new DataStore();


    let defaultsValue = config.defaults || {};

    const options: CreateDecoratorOptions = {
        dataStore,
        get defaults() {
            return defaultsValue
        },
        get logger() {
            return config.enableLog
                ? config.logger || getLogger(config.enableLog || false)
                : getLogger(false);
        },
    };

    return {
        /**
         * class装饰器
         */
        classDecorator: createClassDecorator(options),
        /**
         * method装饰器
         */
        methodDecorator: createMethodDecorator(options),
        /**
         * field字段装饰器
         */
        // fieldDecorator: createFieldDecorator(options),
        /**
         * getter函数装饰器
         */
        // getterDecorator: createGetterDecorator(options),
        /**
         * accessor装饰器
         */
        // accessorDecorator: createAccessorDecorator(options),

        /**
         * 更新配置，用户动态设置授权信息等，例如jwt
         * @param config
         * @returns
         */
        setConfig: (config: CatchConfig) => {
            defaultsValue = merge([defaultsValue, config || {}])
        },
        /**
         * 自定义装饰器
         * @param creator
         * @returns
         */
        createDecorator: (
            creator: (options: CreateDecoratorOptions) => Function
        ) => {
            return creator.call(null, options);
        },

        /**
         * 允许log
         * @param enabled
         */
        enableLog(enabled: boolean = true) {
            config.enableLog = enabled;
        },

        /**
         * 获取配置
         * @param classOrInstance
         * @param method
         * @returns
         */
        getMethodConfig(classOrInstance: Object | Function, method: Function) {
            const oriFun = getProperty(method, SYMBOL_ORIGIN_FUNCTION);
            if (!oriFun) {
                throw new Error(`方法 ${method.name} 不是通过装饰器注册的方法`);
            }
            const mountConfig = dataStore.getMountConfigs(
                classOrInstance,
                oriFun
            );
            return {
                ...mountConfig,
                defaultConfig: options.defaults,
            };
        }
    };
}
