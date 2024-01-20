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
}

export interface CatchConfig {
    filter?:  PropertyKey | PropertyKey[] | ((params: Pick<ErrorHandlerParams, "ctx" | "params" | "func">) => boolean);
    message?: string | ((params: ErrorHandlerParams) => string);
    throw?: boolean;
    handler?: (params: ErrorHandlerParams) => void;
    businessType?: string;
    extra?: any;
    ctx?: any;
}


export interface ClassCatchConfig extends CatchConfig {
    whiteList?: PropertyKey[];
    /**
     * 自动catch静态方法和实例方法
     */
    auto?: boolean
}
