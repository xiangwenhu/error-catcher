import isAsyncFunction from "../src/util/isAsyncFunction";

console.log(isAsyncFunction(async function asyncFun() { }));

console.log(isAsyncFunction(function* () { yield 42; return Infinity; }))