import type { Constructor } from "./types.ts";

const { isFrozen, getPrototypeOf } = Object;
const { isSafeInteger } = Number;

const asyncFC = (async () => {}).constructor;
const generatorFC = function* () {}.constructor;
const asyncGeneratorFC = async function* () {}.constructor;

/**
 * Validate tha value is a nullish value,
 * a nullish value is the value which is either null or undefined.
 */
export const isNullish = (value: any): value is null | undefined =>
  value === null || value === undefined;

/**
 * @deprecated use {@link isNullish} instead.
 */
export const isNullable: typeof isNullish = isNullish;

/**
 * Validate the value is a numerical value,
 * a numerical value is the value when converted to the Number type, is not NaN.
 */
export const isNumerical = (value: any): boolean => !Number.isNaN(+value);

/**
 * Validate the value is of boolean type.
 */
export const isBoolean = (value: any): value is boolean => typeof value === "boolean";

/**
 * Validate the value is of string type.
 */
export const isString = (value: any): value is string => typeof value === "string";

/**
 * Validate the value is of symbol type.
 */
export const isSymbol = (value: any): value is symbol => typeof value === "symbol";

/**
 * Validate the value is of number type.
 */
export const isNumber = (value: any): value is number => typeof value === "number";

/**
 * Validate the value is of bigint type.
 */
export const isBigInt = (value: any): value is bigint => typeof value === "bigint";

/**
 * Validate the value is of function type.
 */
export const isFunction = (value: any): value is (...args: any[]) => any =>
  typeof value === "function";

/**
 * Validate the value is of object type and not null.
 */
export const isObject = (value: any): value is object =>
  value !== null && typeof value === "object";

/**
 * Validate the value is a plain object,
 * a plain object is the value which the prototype is Object.prototype or null.
 */
export const isPlainObject = (value: any): value is Record<PropertyKey, any> => {
  if (!isObject(value)) {
    return false;
  }
  const p = getPrototypeOf(value);
  return p === Object.prototype || p === null;
};

/**
 * Validate the value is a weak key,
 * a weak key is the value which is object, function or non-registered symbol.
 */
export const isWeakKey = (value: any): value is WeakKey =>
  (isSymbol(value) && Symbol.keyFor(value) === undefined) || isObject(value) || isFunction(value);

/**
 * Validate the value is a property key,
 * a property key is the value which is string, number or symbol.
 */
export const isPropertyKey = (value: any): value is PropertyKey =>
  isString(value) || isSymbol(value) || isNumber(value);

/**
 * Validate the value is of primitive type,
 * a primitive value is the value which is either object nor function.
 */
export const isPrimitive = (
  value: any,
): value is null | undefined | boolean | string | symbol | number | bigint =>
  !isObject(value) && !isFunction(value);

/**
 * Validate the value is an Array.
 */
export const isArray: <T = any>(value: any) => value is T[] = Array.isArray;

const isSafeUint = (value: any): value is number => isSafeInteger(value) && value >= 0;

/**
 * Validate the value is an Array or an Object with length property.
 */
export const isArrayLike = <T = any>(value: any): value is ArrayLike<T> =>
  isArray(value) || (isObject(value) && isSafeUint((value as Array<any>).length));

/**
 * Validate the value is a TemplateStringsArray.
 */
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

/**
 * Alias of {@link isTemplateStringArray}.
 */
export const isTemplateOject: typeof isTemplateStringArray = isTemplateStringArray;

/**
 * Returns true if value is a constructor.
 */
export const isConstructor = <T = any>(value: any): value is Constructor<T> =>
  isFunction(value) && value.prototype !== undefined && value.prototype.constructor === value;

/**
 * Validate the value is an async function.
 */
export const isAsyncFunction = (value: any): value is (...args: any[]) => Promise<any> =>
  isFunction(value) && value instanceof asyncFC;

/**
 * Validate the value is a generator function.
 */
export const isGeneratorFunction = (value: any): value is (...args: any[]) => Generator<any> =>
  isFunction(value) && value instanceof generatorFC;

/**
 * Validate the value is an async generator function.
 */
export const isAsyncGeneratorFunction = (
  value: any,
): value is (...args: any[]) => AsyncGenerator<any> =>
  isFunction(value) && value instanceof asyncGeneratorFC;

/**
 * Validate the value is a disposable value,
 * a disposable value is a value which has Symbol.dispose method.
 */
export const isDisposable = (value: any): value is Disposable =>
  !isNullish(value) && isFunction(value[Symbol.dispose]);

/**
 * Validate the value is an async disposable value,
 * an async disposable value is a value which has Symbol.asyncDispose method.
 */
export const isAsyncDisposable = (value: any): value is AsyncDisposable =>
  !isNullish(value) && isFunction(value[Symbol.asyncDispose]);

/**
 * Validate the value is an iterable value.
 */
export const isIterable = <T = any, TR = any, TN = any>(value: any): value is Iterable<T, TR, TN> =>
  !isNullish(value) && isFunction(value[Symbol.iterator]);

/**
 * Validate the value is an async iterable value.
 */
export const isAsyncIterable = <T = any, TR = any, TN = any>(
  value: any,
): value is AsyncIterable<T, TR, TN> =>
  !isNullish(value) && isFunction(value[Symbol.asyncIterator]);

/**
 * Validate the value is a thenable value,
 * a thenable value is the value which has then method.
 */
export const isThenable = <T = any>(value: any): value is PromiseLike<T> =>
  (isObject(value) || isFunction(value)) && isFunction((value as any).then);

/**
 * Alias of {@link isThenable}.
 */
export const isPromiseLike: typeof isThenable = isThenable;

/**
 * Validate that the value is a Promise or has then and catch methods.
 */
export const isPromise = <T = any>(value: any): value is Promise<T> =>
  value instanceof Promise || (isThenable(value) && isFunction((value as any).catch));
