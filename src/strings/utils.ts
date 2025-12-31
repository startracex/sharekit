export const trimStartFunc = (s: string, fn: (s: string) => boolean): string => {
  if (!s || !fn) {
    return s;
  }
  let start = 0;
  while (start < s.length && fn(s.slice(start, start + 1))) {
    start += 1;
  }
  return s.slice(start);
};

export const trimEndFunc = (s: string, fn: (s: string) => boolean): string => {
  if (!s || !fn) {
    return s;
  }
  let end = s.length;
  while (end > 0 && fn(s.slice(end - 1, end))) {
    end -= 1;
  }
  return s.slice(0, end);
};

export const trimFunc = (s: string, fn: (s: string) => boolean): string =>
  trimStartFunc(trimEndFunc(s, fn), fn);

export const trimStart = (s: string, spec: string): string =>
  trimStartFunc(s, (str) => str === spec);

export const trimEnd = (s: string, spec: string): string => trimEndFunc(s, (str) => str === spec);

export const trim = (s: string, spec: string): string => trimFunc(s, (str) => str === spec);

export const startsWithFold = (s: string, prefix: string): boolean => {
  return s.toUpperCase().startsWith(prefix.toUpperCase());
};

export const endsWithFold = (s: string, suffix: string): boolean => {
  return s.toUpperCase().endsWith(suffix.toUpperCase());
};

export const includesFold = (s: string, ss: string): boolean => {
  return s.toUpperCase().includes(ss.toUpperCase());
};

export const equalsFold = (a: string, b: string): boolean => a.toUpperCase() === b.toUpperCase();

const slashRegExp = /\//g;
const backslashRegExp = /\\/g;
export const slash = (s: string): string => s.replace(backslashRegExp, "/");
export const backslash = (s: string): string => s.replace(slashRegExp, "\\");
