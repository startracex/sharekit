export const trimStartFunc = (s: string, func: (s: string) => boolean): string => {
  if (!s || !func) {
    return s;
  }
  let start = 0;
  while (start < s.length && func(s.slice(start, start + 1))) {
    start += 1;
  }
  return s.slice(start);
};

export const trimEndFunc = (s: string, func: (s: string) => boolean): string => {
  if (!s || !func) {
    return s;
  }
  let end = s.length;
  while (end > 0 && func(s.slice(end - 1, end))) {
    end -= 1;
  }
  return s.slice(0, end);
};

export const trimFunc = (s: string, func: (_: string) => boolean): string =>
  trimStartFunc(trimEndFunc(s, func), func);

export const trimStart = (s: string, spec: string): string =>
  trimStartFunc(s, (str) => str === spec);

export const trimEnd = (s: string, spec: string): string => trimEndFunc(s, (str) => str === spec);

export const trim = (s: string, spec: string): string => trimFunc(s, (str) => str === spec);

export const startsWithFold = (path: string, prefix: string): boolean => {
  return path.toUpperCase().startsWith(prefix.toUpperCase());
};

export const endsWithFold = (path: string, suffix: string): boolean => {
  return path.toUpperCase().endsWith(suffix.toUpperCase());
};

export const equalsFold = (a: string, b: string): boolean => a.toUpperCase() === b.toUpperCase();

const slashRegExp = /\//g;
const backslashRegExp = /\\/g;
export const slash = (s: string): string => s.replace(slashRegExp, "/");
export const backslash = (s: string): string => s.replace(backslashRegExp, "\\");
