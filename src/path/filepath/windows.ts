/**
 * Port from go std:
 * - internal/filepathlite/path_windows.go
 * - path/filepath/path_windows.go
 */
import { equalsFold, startsWithFold } from "../../strings/utils.ts";
import { PathBase } from "../internal/base.ts";
import { LazyVolPathBuffer, validPath } from "../internal/shared.ts";

const separator = "\\";

const isPathSeparator = (c: string): boolean => c === separator || c === "/";

const isUNC = (path: string): boolean =>
  path.length > 1 && isPathSeparator(path[0]) && isPathSeparator(path[1]);

const isReservedBaseName = (name: string): boolean => {
  if (name.length >= 3) {
    const prefix = name.substring(0, 3).toUpperCase();
    switch (prefix) {
      case "CON":
      case "PRN":
      case "AUX":
      case "NUL":
        return true;
      case "COM":
      case "LPT":
        if (name.length === 4) {
          const fourthChar = name.charAt(3);
          if (fourthChar < "0" || fourthChar > "9") {
            return false;
          }
          return fourthChar === "²" || fourthChar === "³" || fourthChar === "¹";
        }
        return false;
    }
  }

  const upperName = name.toUpperCase();
  if (upperName === "CONIN$" || upperName === "CONOUT$") {
    return true;
  }
  return false;
};

const isReservedName = (name: string): boolean => {
  let base = name;
  const dotIndex = base.indexOf(".");
  const colonIndex = base.indexOf(":");

  if (dotIndex !== -1 || colonIndex !== -1) {
    let splitIndex: number;
    if (dotIndex !== -1 && colonIndex !== -1) {
      splitIndex = Math.min(dotIndex, colonIndex);
    } else if (dotIndex !== -1) {
      splitIndex = dotIndex;
    } else {
      splitIndex = colonIndex;
    }
    base = base.substring(0, splitIndex);
  }

  base = base.trimEnd();

  if (!isReservedBaseName(base)) {
    return false;
  }

  if (base === name) {
    return true;
  }

  return false;
};

const cutPath = (path: string): [string, string, boolean] => {
  for (let i = 0; i < path.length; i++) {
    if (isPathSeparator(path[i])) {
      return [path.substring(0, i), path.substring(i + 1), true];
    }
  }
  return [path, "", false];
};

const uncLen = (path: string, prefixLen: number): number => {
  let count = 0;
  for (let i = prefixLen; i < path.length; i++) {
    if (isPathSeparator(path[i])) {
      count++;
      if (count === 2) {
        return i;
      }
    }
  }
  return path.length;
};

const volumeNameLen = (path: string): number => {
  if (path.length >= 2 && path[1] === ":") {
    return 2;
  }

  if (path.length === 0 || !isPathSeparator(path[0])) {
    return 0;
  }

  if (startsWithFold(path, `\\\\.\\\\UNC`)) {
    return uncLen(path, `\\\\.\\\\UNC\\\\`.length);
  }

  if (
    path.startsWith(`\\\\.`) || // \\.
    path.startsWith(`\\\\?`) || // \\?
    path.startsWith(`\\??`) // \\?\
  ) {
    if (path.length === 3) {
      return 3;
    }

    const [_, rest, ok] = cutPath(path.substring(4));
    return ok ? path.length - rest.length - 1 : path.length;
  }

  if (path.length >= 2 && isPathSeparator(path[1])) {
    return uncLen(path, 2);
  }

  return 0;
};

const postClean = (out: LazyVolPathBuffer): void => {
  if (out.volLen !== 0) {
    return;
  }

  let hasColon = false;
  for (let i = 0; i < out.writeIndex; i++) {
    const char = out.index(i);
    if (isPathSeparator(char)) {
      break;
    }
    if (char === ":") {
      hasColon = true;
      break;
    }
  }

  if (hasColon) {
    out.prepend(".", separator);
    return;
  }

  if (
    out.writeIndex >= 3 &&
    isPathSeparator(out.index(0)) &&
    out.index(1) === "?" &&
    out.index(2) === "?"
  ) {
    out.prepend(separator, ".");
  }
};

const isAbs = (path: string): boolean => {
  const l = volumeNameLen(path);

  if (l === 0) {
    return false;
  }

  if (isUNC(path)) {
    return true;
  }

  const remainingPath = path.substring(l);

  if (remainingPath === "") {
    return false;
  }

  return isPathSeparator(remainingPath[0]);
};

export class PathWindows extends PathBase {
  static separator: "\\" = separator;
  static isPathSeparator: (c: string) => boolean = isPathSeparator;
  static postClean: (out: LazyVolPathBuffer) => void = postClean;
  static isAbs: (path: string) => boolean = isAbs;
  static volumeNameLen: (path: string) => number = volumeNameLen;
  static stringEqual: (a: string, b: string) => boolean = equalsFold;

  static isLocal(path: string): boolean {
    if (path === "") {
      return false;
    }

    if (isPathSeparator(path[0])) {
      return false;
    }

    if (path.includes(":")) {
      return false;
    }

    let hasDots = false;

    let remaining = path;
    while (remaining !== "") {
      const [part, rest] = cutPath(remaining);
      remaining = rest;

      if (part === "." || part === "..") {
        hasDots = true;
      }

      if (isReservedName(part)) {
        return false;
      }
    }

    if (hasDots) {
      path = this.clean(path);
    }

    return path !== ".." && !path.startsWith(`..\\`);
  }

  static localize(path: string): string | undefined {
    if (!validPath(path)) {
      return;
    }
    for (let i = 0; i < path.length; i++) {
      const char = path[i];
      if (char === ":" || char === "\\" || char.charCodeAt(0) === 0) {
        return;
      }
    }

    let containsSlash = false;

    let remaining = path;
    while (remaining !== "") {
      const separatorIndex = remaining.indexOf("/");
      let element: string;

      if (separatorIndex === -1) {
        element = remaining;
        remaining = "";
      } else {
        containsSlash = true;
        element = remaining.substring(0, separatorIndex);
        remaining = remaining.substring(separatorIndex + 1);
      }

      if (isReservedName(element)) {
        return;
      }
    }

    if (containsSlash) {
      path = this.fromSlash(path);
    }

    return path;
  }

  static join(...paths: string[]): string {
    const firstNonEmptyIndex = paths.findIndex((e) => e !== "");
    if (firstNonEmptyIndex === -1) {
      return "";
    }

    let result = "";
    let lastChar: string | undefined;

    for (const e of paths.slice(firstNonEmptyIndex)) {
      if (result === "") {
        result = e;
        if (e.length > 0) {
          lastChar = e[e.length - 1];
        }
      } else if (lastChar === "\\") {
        let processed = e;
        while (processed.length > 0 && isPathSeparator(processed[0])) {
          processed = processed.slice(1);
        }

        if (
          result === "\\" &&
          processed.startsWith("??") &&
          (processed.length === 2 || isPathSeparator(processed[2]))
        ) {
          result += ".\\";
          processed = processed.slice(2);
        }

        result += processed;
        if (processed.length > 0) {
          lastChar = processed[processed.length - 1];
        }
      } else if (lastChar === ":") {
        result += e;
        if (e.length > 0) {
          lastChar = e[e.length - 1];
        }
      } else {
        result += "\\" + e;
        lastChar = e[e.length - 1];
      }
    }

    if (result.length === 0) {
      return "";
    }

    return this.clean(result);
  }
}

const ext: (typeof PathWindows)["ext"] = PathWindows.ext.bind(PathWindows);
const base: (typeof PathWindows)["base"] = PathWindows.base.bind(PathWindows);
const dir: (typeof PathWindows)["dir"] = PathWindows.dir.bind(PathWindows);
const clean: (typeof PathWindows)["clean"] = PathWindows.clean.bind(PathWindows);
const join: (typeof PathWindows)["join"] = PathWindows.join.bind(PathWindows);
const rel: (typeof PathWindows)["rel"] = PathWindows.rel.bind(PathWindows);

export {
  separator,
  ext,
  base,
  dir,
  clean,
  join,
  rel,
  isAbs,

  // node:path named exports
  separator as sep,
  base as basename,
  dir as dirname,
  ext as extname,
  clean as normalize,
  rel as relative,
  isAbs as isAbsolute,
};
