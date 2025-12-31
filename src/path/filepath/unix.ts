/**
 * Port from go std:
 * - internal/filepathlite/path_unix.go
 * - path/filepath/path_unix.go
 */
import { PathBase } from "../internal/base.ts";

const separator = "/";

const isAbs = (path: string): boolean => path.startsWith(separator);

const localize = (path: string): string | undefined => (path.includes("\x00") ? undefined : path);

const isPathSeparator = (c: string): boolean => c === separator;

const stringEqual = (a: string, b: string): boolean => a === b;

export class PathUnix extends PathBase {
  static separator: "/" = separator;
  static isPathSeparator: (c: string) => boolean = isPathSeparator;
  static stringEqual: (a: string, b: string) => boolean = stringEqual;
  static localize: (path: string) => string | undefined = localize;
  static isAbs: (path: string) => boolean = isAbs;

  static fromSlash(path: string): string {
    return path;
  }

  static toSlash(path: string): string {
    return path;
  }

  static isLocal(path: string): boolean {
    if (path === "" || this.isAbs(path)) {
      return false;
    }

    let hasDots = false;
    const parts = path.split("/");
    for (const part of parts) {
      if (part === "." || part === "..") {
        hasDots = true;
        break;
      }
    }

    if (hasDots) {
      path = this.clean(path);
    }

    return path !== ".." && !path.startsWith("../");
  }

  static join(...paths: string[]): string {
    const firstNonEmptyIndex = paths.findIndex((e) => e !== "");

    if (firstNonEmptyIndex === -1) {
      return "";
    }

    return this.clean(paths.slice(firstNonEmptyIndex).join("/"));
  }

  static volumeNameLen(): number {
    return 0;
  }
}

const ext: typeof PathUnix.ext = PathUnix.ext.bind(PathUnix);
const base: typeof PathUnix.base = PathUnix.base.bind(PathUnix);
const dir: typeof PathUnix.dir = PathUnix.dir.bind(PathUnix);
const clean: typeof PathUnix.clean = PathUnix.clean.bind(PathUnix);
const join: typeof PathUnix.join = PathUnix.join.bind(PathUnix);
const rel: typeof PathUnix.rel = PathUnix.rel.bind(PathUnix);
const isLocal: typeof PathUnix.isLocal = PathUnix.isLocal.bind(PathUnix);
const fromSlash: typeof PathUnix.fromSlash = PathUnix.fromSlash.bind(PathUnix);
const toSlash: typeof PathUnix.toSlash = PathUnix.toSlash.bind(PathUnix);
const pretty: typeof PathUnix.pretty = PathUnix.pretty.bind(PathUnix);
const upDir: typeof PathUnix.upDir = PathUnix.upDir.bind(PathUnix);

export {
  pretty,
  upDir,
  separator,
  ext,
  base,
  dir,
  clean,
  join,
  rel,
  isAbs,
  isLocal,
  localize,
  fromSlash,
  toSlash,

  // node:path named exports
  separator as sep,
  base as basename,
  dir as dirname,
  ext as extname,
  clean as normalize,
  rel as relative,
  isAbs as isAbsolute,
};
