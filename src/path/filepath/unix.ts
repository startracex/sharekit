/**
 * Port from go std:
 * - internal/filepathlite/path_unix.go
 * - path/filepath/path_unix.go
 */
import { PathBase } from "../internal/base.js";

export class PathUnix extends PathBase {
  static separator: "/" = "/";
  static isPathSeparator(c: string): boolean {
    return c === "/";
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

  static localize(path: string): string | undefined {
    if (path.includes("\x00")) {
      return undefined;
    }
    return path;
  }

  static isAbs(path: string): boolean {
    return path.startsWith("/");
  }

  static join(...paths: string[]): string {
    const firstNonEmptyIndex = paths.findIndex((e) => e !== "");

    if (firstNonEmptyIndex === -1) {
      return "";
    }

    return this.clean(paths.slice(firstNonEmptyIndex).join("/"));
  }

  static stringEqual(a: string, b: string): boolean {
    return a === b;
  }
}

const separator: (typeof PathUnix)["separator"] = PathUnix.separator;
const ext: (typeof PathUnix)["ext"] = PathUnix.ext.bind(PathUnix);
const base: (typeof PathUnix)["base"] = PathUnix.base.bind(PathUnix);
const dir: (typeof PathUnix)["dir"] = PathUnix.dir.bind(PathUnix);
const clean: (typeof PathUnix)["clean"] = PathUnix.clean.bind(PathUnix);
const join: (typeof PathUnix)["join"] = PathUnix.join.bind(PathUnix);
const rel: (typeof PathUnix)["rel"] = PathUnix.rel.bind(PathUnix);
const isAbs: (typeof PathUnix)["isAbs"] = PathUnix.isAbs.bind(PathUnix);

export { separator, ext, base, dir, clean, join, rel, isAbs };
