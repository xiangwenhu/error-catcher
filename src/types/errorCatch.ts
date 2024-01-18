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
    params?: P,
    /**
     * 处理后，是否继续抛出异常
     */
    throw?: boolean,

    func?: Function;

    businessType?: string

}


export interface CatchConfig {
    filter?: string | ((params: Pick<ErrorHandlerParams, "ctx" | "params" | "func">) => boolean);
    message?: string | ((params: ErrorHandlerParams) => string);
    throw?: boolean;
    handler?: (params: ErrorHandlerParams) => void
}


export interface ClassCatchConfig extends CatchConfig {
    whiteList?: PropertyKey[]
}
