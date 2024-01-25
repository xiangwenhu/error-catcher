import { CatchConfig, ClassCatchConfig } from "../types/errorCatch";
import Logger from "../types/logger";
import isAsyncFunction from "../util/isAsyncFunction";

export function executeCall({
    method,
    config,
    logger,
    args,
    thisObject,
}: {
    method: Function;
    config: CatchConfig | ClassCatchConfig;
    logger: Logger;
    args: IArguments | any[];
    thisObject: any;
}) {

    const errorHandler = (error: any) => {
        config.handler && config.handler({
            error,
            func: method,
            params: args,
            businessType: config.businessType,
            extra: config.extra,
            ctx: config.ctx,
            throw: config.throw,
            whiteList: (config as ClassCatchConfig).whiteList
        });
        if (!!config.throw) {
            throw error
        }
    }

    if (isAsyncFunction(method)) {
        return method.apply(thisObject, args).catch(errorHandler)
    } else {
        try {
            return method.apply(thisObject, args)
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
