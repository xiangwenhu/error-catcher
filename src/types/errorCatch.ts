export interface ErrorHandlerParams<E = any, C = any, P = any[]> {
    /**
     * 捕获的异常信息
     */
    error: E,
    /**
     * 上下文
     */
    ctx?: C,
    /**
     * 函数调用时的参数
     */
    params?: P | IArguments | undefined,
    /**
     * 处理后，是否继续抛出异常
     */
    throw?: boolean,
    /**
     * 触发报错的函数
     */
    func?: Function;

    /**
     * 业务类型
     */
    businessType?: string;
    /**
     * 额外的信息
     */
    extra?: any;
    /**
     * 白名单，装饰class的时候可配置
     */
    whiteList?: (PropertyKey | RegExp)[];
    /**
     * 是不是静态方法
     */
    isStatic?: boolean;

    chain?: boolean;
}

export interface CatchConfig {
    // filter?: (params: Pick<ErrorHandlerParams, "ctx" | "params" | "func" | 'whiteList'>) => boolean;
    message?: string | ((params: ErrorHandlerParams) => string);
    throw?: boolean;
    handler?: (params: ErrorHandlerParams) => unknown
    businessType?: string;
    extra?: any;
    ctx?: any;
    /**
     * 链式调用
     */
    chain?: boolean;
}



export interface ClassCatchConfig extends CatchConfig {
    whiteList?: (PropertyKey | RegExp)[];
    /**
     * 自动catch静态方法和实例方法
     */
    autoCatchMethods?: boolean
}
