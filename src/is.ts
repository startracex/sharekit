import type { Constructor } from "./types.ts";

const { isFrozen, getPrototypeOf } = Object;
const { isSafeInteger } = Number;

const asyncFC = (async () => {}).constructor;
const generatorFC = function* () {}.constructor;
const asyncGeneratorFC = async function* () {}.constructor;

export const isNullish = (value: any): value is null | undefined =>
  value === null || value === undefined;

/**
 * @deprecated use {@link isNullish} instead.
 */
export const isNullable: typeof isNullish = isNullish;

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
  const p = getPrototypeOf(value);
  return p === Object.prototype || p === null;
};

export const isWeakKey = (value: any): value is WeakKey =>
  (isSymbol(value) && Symbol.keyFor(value) === undefined) || isObject(value) || isFunction(value);

export const isPropertyKey = (value: any): value is PropertyKey =>
  isString(value) || isSymbol(value) || isNumber(value);

export const isPrimitive = (
  value: any,
): value is null | undefined | boolean | string | symbol | number | bigint =>
  !isObject(value) && !isFunction(value);

export const isArray: <T = any>(value: any) => value is T[] = Array.isArray;

const isSafeUint = (value: any): value is number => isSafeInteger(value) && value >= 0;

export const isArrayLike = <T = any>(value: any): value is ArrayLike<T> =>
  isArray(value) || (isObject(value) && isSafeUint((value as Array<any>).length));

export const isTemplateStringArray = (value: any): value is TemplateStringsArray => {
  if (isArray(value) && isFrozen(value)) {
    const { raw } = value as Array<any> & { raw: Array<any> };
    if (isArray(raw) && isFrozen(raw)) {
      const { length } = value;
      if (length < 1 || length !== raw.length) {
        return false;
      }
      for (let i = 0; i < length; ++i) {
        const rawString = raw[i];
        const cookedStringOrUndefined = value[i];
        if (
          !(isString(cookedStringOrUndefined) || cookedStringOrUndefined === undefined) ||
          !isString(rawString)
        ) {
          return false;
        }
      }
      return true
    }
  }
  return false;
};

export const isConstructor = <T = any>(value: any): value is Constructor<T> =>
  isFunction(value) && value.prototype !== undefined && value.prototype.constructor === value;

export const isAsyncFunction = (value: any): value is (...args: any[]) => Promise<any> =>
  isFunction(value) && value instanceof asyncFC;

export const isGeneratorFunction = (value: any): value is (...args: any[]) => Generator<any> =>
  isFunction(value) && value instanceof generatorFC;

export const isAsyncGeneratorFunction = (
  value: any,
): value is (...args: any[]) => AsyncGenerator<any> =>
  isFunction(value) && value instanceof asyncGeneratorFC;

export const isDisposable = (value: any): value is Disposable =>
  !isNullish(value) && isFunction(value[Symbol.dispose]);

export const isAsyncDisposable = (value: any): value is AsyncDisposable =>
  !isNullish(value) && isFunction(value[Symbol.asyncDispose]);

export const isIterable = <T = any, TR = any, TN = any>(value: any): value is Iterable<T, TR, TN> =>
  !isNullish(value) && isFunction(value[Symbol.iterator]);

export const isAsyncIterable = <T = any, TR = any, TN = any>(
  value: any,
): value is AsyncIterable<T, TR, TN> =>
  !isNullish(value) && isFunction(value[Symbol.asyncIterator]);

export const isThenable = <T = any>(value: any): value is PromiseLike<T> =>
  (isObject(value) || isFunction(value)) && isFunction((value as any).then);

export const isPromise = <T = any>(value: any): value is Promise<T> =>
  value instanceof Promise || (isThenable(value) && isFunction((value as any).catch));
