// 基于 https://github.com/inspect-js/is-async-function/blob/main/index.js
const toStr = Object.prototype.toString;
const fnToStr = Function.prototype.toString;
const isFnRegex = /^\s*async(?:\s+function(?:\s+|\()|\s*\()/;
const hasToStringTag = 'Symbol' in globalThis && typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
const getProto = Object.getPrototypeOf;
const getAsyncFunc = function () {
    if (!hasToStringTag) {
        return false;
    }
    try {
        return Function('return async function () {}')();
    } catch (e) {
    }
};

// @ts-ignore
let AsyncFunction = globalThis.AsyncFunction;

export default function isAsyncFunction(fn: unknown) {
    if (typeof fn !== 'function') {
        return false;
    }
    if (isFnRegex.test(fnToStr.call(fn))) {
        return true;
    }
    if (!hasToStringTag) {
        var str = toStr.call(fn);
        return str === '[object AsyncFunction]';
    }
    if (!getProto) {
        return false;
    }
    if (typeof AsyncFunction === 'undefined') {
        var asyncFunc = getAsyncFunc();
        AsyncFunction = asyncFunc ? getProto(asyncFunc) : false;
    }
    return getProto(fn) === AsyncFunction;
};