const splitWordsRegexp = /[A-Z][^A-Z_-\s]*|[^A-Z_-\s]+/g;

export const splitWords = (s: string): string[] => s.match(splitWordsRegexp) || [];

export const capitalize = <T extends string>(s: T): Capitalize<T> =>
  (s.slice(0, 1).toUpperCase() + s.slice(1)) as Capitalize<T>;

export const uncapitalize = <T extends string>(s: T): Uncapitalize<T> =>
  (s.slice(0, 1).toLowerCase() + s.slice(1)) as Uncapitalize<T>;

const toCamel = (s: string, u?: boolean): string => {
  if (!s) {
    return "";
  }
  const tokens = splitWords(s).map((s) => s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase());
  if (!tokens.length) {
    return "";
  }
  if (u) {
    const first = tokens.shift()!;
    return capitalize(first) + tokens.join("");
  }
  return tokens.join("");
};

const toTitle = (s: string): string => {
  if (!s) {
    return "";
  }
  const tokens = splitWords(s);
  if (!tokens.length) {
    return "";
  }
  const first = capitalize(tokens.shift());
  if (!tokens.length) {
    return first;
  }
  return first + " " + tokens.join(" ");
};

export const dash = (s: string): string => splitWords(s).join("-").toLowerCase();

/**
 * converts_a_string_to_snake_case.
 */
export const snake = (s: string): string => splitWords(s).join("_").toLowerCase();

/**
 * converts-a-string-to-kebab-case.
 */
export const kebab: typeof dash = dash;

/**
 * ConvertsAStringToPascalCase
 */
export const pascal = (s: string): string => toCamel(s, true);

/**
 * convertsAStringToCamelCase.
 */
export const camel = (s: string): string => toCamel(s);

/**
 * CONVERTS_A_STRING_TO_MACRO_CASE.
 */
export const macro = (s: string): string => splitWords(s).join("_").toUpperCase();

/**
 * Converts a string to title case.
 */
export const title = (s: string): string => toTitle(s);
