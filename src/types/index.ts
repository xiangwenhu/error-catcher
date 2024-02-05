
import { IDataStore } from "./dataStore.js";
import { CatchConfig, ClassCatchConfig, ErrorHandlerParams } from "./errorCatch.js";
import Logger from "./logger";

export interface StorageMapValue {
    classConfig?: Partial<StorageMapValue.ConfigValue>;
    methods?: Map<Function, StorageMapValue.MethodConfigValue>;
    instances?: Map<Object, StorageMapValue.CommonConfigValue>;
    staticConfig?: StorageMapValue.CommonConfigValue;
    staticMethods?: Map<Function, StorageMapValue.MethodConfigValue>;
}

export namespace StorageMapValue {
    export type ConfigValue = Partial< (CatchConfig | ClassCatchConfig) & {
        isStatic: boolean
    }>;
    export type MethodsMap = Map<Function, MethodConfigValue>;
    export type MethodConfigValue = {
        config?: ConfigValue;
    };
    export type InstancesMap = Map<Object, CommonConfigValue>;
    export type CommonConfigValue = {
        config?: ConfigValue; // 暂时无用
        fieldPropertyMap?: FieldPropertyMapValue;
    };
    export type FieldPropertyMapValue = Record<PropertyKey, PropertyKey>;

    export type ProxiesValue = Map<Object | Function, Object | Function>;
}

export type StorageMap = Map<Function, StorageMapValue>;

export interface CatchRootConfig {
    /**
     * 默认配置
     */
    defaults?: CatchConfig;
    /**
     * 请求方法
     * @param config RequestConfig
     * @returns

    /**
     * 启用日志
     */
    enableLog?: boolean;
    /**
     * 日志对象
     */
    logger?: Logger;
}

export interface CreateDecoratorOptions {
    /**
     * 存储
     */
    dataStore: IDataStore;
    /**
     * 默认配置
     */
    defaults: CatchConfig;
    /**
     * 请求方法
     * @param config RequestConfig
     * @returns
     */
    /**
     * 日志对象
     */
    get logger(): Logger;

}

export type InnerCreateDecoratorOptions = CreateDecoratorOptions &
    CatchRootConfig;


export type InferType<T> = T extends Record<string, unknown> ? { [P in keyof T]: T[P] } : never;
