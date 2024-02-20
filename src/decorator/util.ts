import { StorageMapValue } from "../types";
import { CatchConfig, ClassCatchConfig, ErrorHandlerParams } from "../types/errorCatch";
import Logger from "../types/logger";
import { isThenable } from "../util";
import isAsyncFunction from "../util/isAsyncFunction";

export function executeCall({
    method,
    config,
    logger,
    args,
    thisObject,
    errorHandlers
}: {
    method: Function;
    config: StorageMapValue.ConfigValue;
    logger: Logger;
    args: IArguments | any[];
    thisObject: any;
    errorHandlers: ((params: ErrorHandlerParams) => any)[];
}) {

    const errorHandler = (error: any) => {
        const params = {
            error,
            func: method,
            params: args,
            businessType: config.businessType,
            extra: config.extra,
            ctx: config.ctx,
            throw: config.throw,
            whiteList: (config as ClassCatchConfig).whiteList,
            isStatic: config.isStatic
        }

        for (let i = 0; i < errorHandlers.length; i++) {
            try {
                const handler = errorHandlers[i];
                const isContinue = handler.call(thisObject, params);
                if (!config.chain || isContinue === false) {
                    break;
                }
            } catch (err) {
                logger.error("errorHandler error", err);
            }
        }

        // 捕获之后，还继续外抛
        if (config.throw) {
            throw error
        }
    }

    if (isAsyncFunction(method)) {
        return method.apply(thisObject, args).catch(errorHandler)
    } else {
        try {
            // 先调用函数， 如果直接被后面的catch了，是普通函数
            const result = method.apply(thisObject, args);
            // 返回的结果如果是 isThenable ，就是异步函数
            const isThenableResult = isThenable(result)
            if (isThenableResult) {
                return result.catch(errorHandler)
            }
            return result;
        } catch (err) {
            errorHandler(err)
        }
    }
}


export function checkIsInWhitelist(propertyKey: PropertyKey, whitelist: (PropertyKey | RegExp)[]) {
    return whitelist.some(item => {
        if (typeof item === "symbol") {
            return propertyKey === item
        }
        if (item instanceof RegExp) {
            return item.test(String(propertyKey))
        }
        return propertyKey === item
    })
}

export function geOriginalPrototype(instance: Object, targetClass: Function) {
    return targetClass.prototype;
    // let proto: Function | null = instance.constructor;
    // while ((proto = Object.getPrototypeOf(proto)) != null) {
    //     if (proto === targetClass) return proto.prototype;
    // }
}
