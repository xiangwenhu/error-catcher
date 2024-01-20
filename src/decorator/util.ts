import { CatchConfig } from "../types/errorCatch";
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
    config: CatchConfig;
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

