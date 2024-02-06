import { SYMBOL_ORIGIN_FUNCTION, SYMBOL_RELATED_CLASS } from "../const";
import { merge } from "../lib/merge";
import { StorageMap, StorageMapValue } from "../types";
import { CatchConfig } from "../types/errorCatch";
import {
    getProperty,
    hasOwnProperty,
    isFunction,
    isObject
} from "../util";
import isAsyncFunction from "../util/isAsyncFunction";


export default class DataStore {
    public storeMap: StorageMap = new Map<Function, StorageMapValue>();

    /**
     * 获取挂载的配置，不包括创建实例的配置
     * @param method
     * @param classOrInstance
     * @returns
     */
    getMountConfigs(classOrInstance: Object | Function, method: Function) {
        // 如果instanceOrClass是class, 可以任务method是静态方法
        // 反之，是实例属性
        const isClass = isFunction(classOrInstance);

        const { storeMap } = this;
        let _class_: Function = isClass
            ? (classOrInstance as Function)
            : classOrInstance.constructor;

        // SYMBOL_ORIGIN_FUNCTION
        // TODO:: 继承之后的 非静态方法，classOrInstance 为 子类，而 method 信息在父类上
        if (!isClass) {
            for (let key of Reflect.ownKeys(classOrInstance)) {
                // @ts-ignore
                const val = classOrInstance[key];
                if (isFunction(val) && val[SYMBOL_ORIGIN_FUNCTION] === method) {
                    _class_ = val[SYMBOL_RELATED_CLASS];
                    break;
                }
            }
        }

        const rootConfig: StorageMapValue = storeMap.get(_class_) || {};

        // 挂载class身上的config
        const classConfig = rootConfig.classConfig || {};

        // 方法上的config
        const methodConfig =
            ((isClass ? rootConfig.staticMethods : rootConfig.methods) ||
                new Map<Function, StorageMapValue.MethodConfigValue>()).get(method) || {};

        // 实例或者class config 属性对应着的config
        const propertyConfig = getProperty(classOrInstance, "config", {}) || {};

        // fieldConfig
        let propertyMap: StorageMapValue.FieldPropertyMapValue;
        if (isClass) {
            const commonConfig = rootConfig.staticConfig || {};
            propertyMap = commonConfig.fieldPropertyMap || {};
        } else {
            const instancesMap = rootConfig.instances || new Map<Object, StorageMapValue.CommonConfigValue>();
            // 从示例map中查找示例对应的配置
            const commonConfig: StorageMapValue.CommonConfigValue =
                instancesMap.get(classOrInstance) || {};

            // 字段属性映射, 如果木有，会从原型上找
            propertyMap = commonConfig.fieldPropertyMap || {};
        }

        const fieldConfig = Object.keys(propertyMap).reduce(
            (obj: CatchConfig, key) => {
                const value = propertyMap[key];
                // @ts-ignore
                obj[key] = getProperty(classOrInstance, value);
                return obj;
            },
            {} as CatchConfig
        );

        return {
            classConfig,
            methodConfig,
            propertyConfig,
            fieldConfig,
        };
    }

    /**
     * 获取最终的配置
     * @param method method的函数
     * @param instanceOrClass class的实例
     * @param defaultConfig 默认值
     * @param argumentsObj method实参
     * @returns
     */
    getMethodMergedConfig(
        instanceOrClass: Object,
        method: Function,
        defaultConfig: StorageMapValue.ConfigValue = {},
        argumentsObj: any
    ) {
        if (
            !isObject(method) &&
            !isFunction(method) &&
            !isAsyncFunction(method)
        ) {
            throw new Error(
                "methodFunction must be a/an Object|Function|AsyncFunction"
            );
        }
        const mountConfigs = this.getMountConfigs(instanceOrClass, method);

        let mConfig: StorageMapValue.ConfigValue = merge([
            {},
            // 自定义默认config
            defaultConfig,
            // class上的config
            mountConfigs.classConfig,
            // 实例 config 属性的值
            mountConfigs.propertyConfig,
            // class field map后组成的config
            mountConfigs.fieldConfig,
            // method 上的config
            mountConfigs.methodConfig.config || {},
        ]);


        mConfig = this.adjustConfig(
            mConfig,
            argumentsObj,
            mountConfigs.methodConfig
        );

        const errorHandlers: Function[] = [defaultConfig,
            mountConfigs.classConfig,
            mountConfigs.methodConfig.config || {}
        ].reverse().map(c => {
            if (!c) return undefined;
            if (typeof c.handler === 'function') return c.handler;
            return undefined;
        }).filter(Boolean) as Function[]

        return {
            config: mConfig,
            errorHandlers
        };
    }


    /**
     * 根据参数，最后调整参数
     * @param mergedConfig 被合并后的参数
     * @param argumentsObj 方法的实参
     * @param methodConfig 方法自身的config
     * @returns
     */
    private adjustConfig(
        mergedConfig: StorageMapValue.ConfigValue,
        argumentsObj: any,
        methodConfig: StorageMapValue.MethodConfigValue
    ): StorageMapValue.ConfigValue {

        const {
            hasBody,
            hasConfig: hasExtraConfig,
            hasParams,
            hasPath,
        } = {
            hasBody: hasOwnProperty(argumentsObj, "data"),
            hasParams: hasOwnProperty(argumentsObj, "params"),
            hasConfig: hasOwnProperty(argumentsObj, "config"),
            hasPath: hasOwnProperty(argumentsObj, "path"),
        };
        return mergedConfig;
    }

    /**
     * 更新属性映射的配置
     * @param _class_ class
     * @param instance class的实例
     * @param config 映射关系
     */
    updateFieldConfig(
        _class_: Function,
        instance: Object | null | undefined,
        config: Record<PropertyKey, PropertyKey>
    ) {
        const { storeMap } = this;

        const rootConfig: StorageMapValue | undefined = storeMap.get(_class_) || {};
        let instances: StorageMapValue.InstancesMap | undefined = rootConfig.instances;
        if (!instances) {
            instances = new Map<Object, StorageMapValue.CommonConfigValue>();
            rootConfig.instances = instances;
        }
        let commonConfig: StorageMapValue.CommonConfigValue =
            instances.get(instance!) || {};

        commonConfig.fieldPropertyMap = merge([
            commonConfig.fieldPropertyMap || {},
            config,
        ]);
        instances.set(instance!, commonConfig);
        storeMap.set(_class_, rootConfig);
    }

    /**
     * 更新属性映射的配置
     * @param _class_ class
     * @param _instance class的实例，此处值为 undefined
     * @param config 映射关系
     */
    updateStaticFieldConfig(
        _class_: Function,
        _instance: Object | null | undefined,
        mapConfig: Record<PropertyKey, PropertyKey>
    ) {
        const { storeMap } = this;

        const rootConfig: StorageMapValue = storeMap.get(_class_) || {};
        let commonConfig: StorageMapValue.CommonConfigValue = rootConfig.staticConfig ||
            {};

        commonConfig.fieldPropertyMap = merge([
            commonConfig.fieldPropertyMap || {},
            mapConfig,
        ]);
        rootConfig.staticConfig = commonConfig;
        storeMap.set(_class_, rootConfig);
    }

    /**
     * 更新方法的请求配置
     * @param _class_ class
     * @param method 方法
     * @param config 配置
     */
    updateMethodConfig(
        _class_: Function,
        method: Function,
        config: StorageMapValue.MethodConfigValue
    ) {
        this.innerUpdateMethodConfig(_class_, method, config, "methods");
    }

    /**
     * 更新方法的请求配置
     * @param _class_ class
     * @param method 方法
     * @param config 配置
     */
    updateStaticMethodConfig(
        _class_: Function,
        method: Function,
        config: StorageMapValue.MethodConfigValue
    ) {
        this.innerUpdateMethodConfig(
            _class_,
            method,
            config,
            "staticMethods"
        );
    }

    private innerUpdateMethodConfig(
        _class_: Function,
        method: Function,
        config: StorageMapValue.MethodConfigValue,
        key: "methods" | "staticMethods"
    ) {
        const { storeMap } = this;
        const val: StorageMapValue = storeMap.get(_class_) || {};
        let methodsMapValue: StorageMapValue.MethodsMap | undefined = val[key];
        if (!methodsMapValue) {
            methodsMapValue = new Map();
            val[key] = methodsMapValue;
        }
        let oldConfig: StorageMapValue.MethodConfigValue = methodsMapValue.get(method) || {};
        oldConfig = merge([oldConfig, config]);
        methodsMapValue.set(method, oldConfig);
        storeMap.set(_class_, val);
    }

    /**
     * 更新class的请求配置
     * @param _class_
     * @param config
     */
    updateClassConfig(_class_: Function, config: StorageMapValue.ConfigValue) {
        const { storeMap } = this;
        const val: StorageMapValue = storeMap.get(_class_) || {};
        val.classConfig = config;
        storeMap.set(_class_, val);
    }
}