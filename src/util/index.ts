import { InferType } from "../types";

const toString = Object.prototype.toString;
const hasOwnProp = Object.prototype.hasOwnProperty;

export function isObjectType(obj: any, type: string) {
    return toString.call(obj) === `[object ${type}]`;
}

export function isFunction(obj: any) {
    return typeof obj === "function";
}

export function isAsyncFunction(obj: any) {
    return isObjectType(obj, "AsyncFunction");
}

export function isObject(obj: any) {
    return typeof obj === 'object' && obj !== null;
}

export function getOwnProperty(
    obj: any,
    propertyName: PropertyKey,
    defaultValue?: any
) {
    //  Cannot convert undefined or null to object
    if (obj != null && hasOwnProp.call(obj, propertyName)) {
        return obj[propertyName];
    }
    return defaultValue || undefined;
}

export function getProperty(
    obj: any,
    propertyName: PropertyKey,
    defaultValue?: any
) {
    //  Cannot convert undefined or null to object
    if (obj != null) {
        return obj[propertyName];
    }
    return defaultValue || undefined;
}

export function hasOwnProperty(obj: any, propertyName: PropertyKey) {
    if (obj === null || obj === undefined) {
        return false;
    }
    return hasOwnProp.call(obj, propertyName);
}


export function cloneJSON<T>(obj: T, defaultValue = {} as any as InferType<T>): InferType<T> {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (err) {
        return defaultValue
    }
}



export const isThenable = (thing: any) =>
    thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);