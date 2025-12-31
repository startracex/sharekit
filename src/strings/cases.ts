const splitWordsRegexp = /[A-Z][^A-Z_-\s]*|[^A-Z_-\s]+/g;

export const splitWords = (s: string): string[] => s.match(splitWordsRegexp) || [];

export const upper = <T extends string>(s: T): Uppercase<T> => s.toUpperCase() as any;

export const lower = <T extends string>(s: T): Lowercase<T> => s.toLowerCase() as any;

export const capitalize = <T extends string>(s: T): Capitalize<T> =>
  (upper(s.slice(0, 1)) + s.slice(1)) as any;

export const uncapitalize = <T extends string>(s: T): Uncapitalize<T> =>
  (lower(s.slice(0, 1)) + s.slice(1)) as any;

/**
 * converts_a_string_to_snake_case.
 */
export const snake = (s: string): string => lower(splitWords(s).join("_"));

/**
 * converts-a-string-to-kebab-case.
 */
export const kebab = (s: string): string => lower(splitWords(s).join("-"));
export const dash: (s: string) => string = kebab;

/**
 * ConvertsAStringToPascalCase.
 */
export const pascal = (s: string): string =>
  splitWords(s)
    .map((s) => upper(s.slice(0, 1)) + lower(s.slice(1)))
    .join("");

/**
 * convertsAStringToCamelCase.
 */
export const camel = (s: string): string => uncapitalize(pascal(s));

/**
 * CONVERTS_A_STRING_TO_MACRO_CASE.
 */
export const macro = (s: string): string => upper(splitWords(s).join("_"));

/**
 * Converts a string to title case.
 */
export const title = (s: string): string => capitalize(splitWords(s).join(" "));
