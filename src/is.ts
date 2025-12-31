import type { Constructor } from "./types.ts";

export const isNullable = (value: any): value is null | undefined =>
  value === null || value === undefined;

export const isNumerical = (value: any): boolean => !Number.isNaN(+value);

export const isBoolean = (value: any): value is boolean => typeof value === "boolean";

export const isString = (value: any): value is string => typeof value === "string";

export const isSymbol = (value: any): value is symbol => typeof value === "symbol";

export const isNumber = (value: any): value is number => typeof value === "number";

export const isBigInt = (value: any): value is bigint => typeof value === "bigint";

export const isFunction = (value: any): value is (...args: any[]) => any =>
  typeof value === "function";

export const isObject = (value: any): value is object =>
  value !== null && typeof value === "object";

export const isPlainObject = (value: any): value is Record<PropertyKey, any> => {
  if (!isObject(value)) {
    return false;
  }
  const p = Object.getPrototypeOf(value);
  return p === Object.prototype || p === null;
};

export const isWeakKey = (value: any): value is WeakKey =>
  isSymbol(value) || isObject(value) || isFunction(value);

export const isPropertyKey = (value: any): value is PropertyKey =>
  isString(value) || isSymbol(value) || isNumber(value);

export const isPrimitive = (
  value: any,
): value is null | undefined | boolean | string | symbol | number | bigint =>
  !isObject(value) && !isFunction(value);

export const isArray: <T = any>(value: any) => value is T[] = Array.isArray;

export const isArrayLike = <T = any>(value: any): value is ArrayLike<T> =>
  isArray(value) || (isObject(value) && isNumber((value as any).length));

export const isTemplateStringArray = (value: any): value is TemplateStringsArray =>
  isArray(value) && isArray((value as any).raw);

export const isConstructor = <T = any>(value: any): value is Constructor<T> =>
  isFunction(value) && value.prototype.constructor === value;

const asyncFnCons = (async () => {}).constructor;

export const isAsyncFunction = (value: any): value is (...args: any[]) => Promise<any> =>
  isFunction(value) && value.constructor === asyncFnCons;

const generatorFnCons = function* () {}.constructor;

export const isGeneratorFunction = (value: any): value is (...args: any[]) => Generator<any> =>
  isFunction(value) && value.constructor === generatorFnCons;

const asyncGeneratorFnCons = async function* () {}.constructor;

export const isAsyncGeneratorFunction = (
  value: any,
): value is (...args: any[]) => AsyncGenerator<any> =>
  isFunction(value) && value.constructor === asyncGeneratorFnCons;

export const isIterable = <T = any, TR = any, TN = any>(value: any): value is Iterable<T, TR, TN> =>
  !isNullable(value) && isFunction(value[Symbol.iterator]);

export const isAsyncIterable = <T = any, TR = any, TN = any>(
  value: any,
): value is AsyncIterable<T, TR, TN> => !isNullable(value) && isFunction(value[Symbol.asyncIterator]);

export const isThenable = <T = any>(value: any): value is PromiseLike<T> =>
  (isObject(value) || isFunction(value)) && isFunction((value as any).then);

export const isPromise = <T = any>(value: any): value is Promise<T> =>
  value instanceof Promise || (isThenable(value) && isFunction((value as any).catch));
