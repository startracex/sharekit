/**
 * Port from go std:
 * - internal/filepathlite/path.go
 * - path/filepath/path.go
 */
import { slash, backslash } from "../../strings.ts";
import { LazyVolPathBuffer } from "./shared.ts";

export class PathBase {
  static separator: "/" | "\\" = "/";

  static isPathSeparator(c: string): boolean {
    return c === "/";
  }

  static fromSlash(path: string): string {
    if (this.separator === "/") return path;
    return backslash(path);
  }

  static toSlash(path: string): string {
    if (this.separator === "/") return path;
    return slash(path);
  }

  static split(path: string): [string, string] {
    const volLen = this.volumeNameLen(path);
    let i = path.length - 1;

    while (i >= volLen && !this.isPathSeparator(path[i])) {
      i--;
    }

    return [path.substring(0, i + 1), path.substring(i + 1)];
  }

  static ext(path: string): string {
    for (let i = path.length - 1; i >= 0; i--) {
      if (this.isPathSeparator(path[i])) {
        return "";
      }

      if (path[i] === ".") {
        return path.substring(i);
      }
    }

    return "";
  }

  static base(path: string): string {
    if (path === "") {
      return ".";
    }

    while (path.length > 0 && this.isPathSeparator(path[path.length - 1])) {
      path = path.substring(0, path.length - 1);
    }

    const volLen = this.volumeNameLen(path);
    path = path.substring(volLen);

    let i = path.length - 1;
    while (i >= 0 && !this.isPathSeparator(path[i])) {
      i--;
    }

    if (i >= 0) {
      path = path.substring(i + 1);
    }

    if (path === "") {
      return this.separator;
    }

    return path;
  }

  static dir(path: string): string {
    const vol = path.substring(0, this.volumeNameLen(path));

    let i = path.length - 1;
    while (i >= vol.length && !this.isPathSeparator(path[i])) {
      i--;
    }

    const dirPart = path.substring(vol.length, i + 1);
    let dir = this.clean(dirPart);

    if (dir === "." && vol.length > 2) {
      return vol;
    }

    return vol + dir;
  }

  static clean(path: string): string {
    const originalPath = path;
    const volLen = this.volumeNameLen(path);
    path = path.substring(volLen);

    if (path === "") {
      if (
        volLen > 1 &&
        this.isPathSeparator(originalPath[0]) &&
        this.isPathSeparator(originalPath[1])
      ) {
        return this.fromSlash(originalPath);
      }
      return originalPath + ".";
    }

    const rooted = this.isPathSeparator(path[0]);
    const out = new LazyVolPathBuffer({ path, originalPath, volLen });
    let readIndex = 0;
    let dotdotIndex = 0;

    if (rooted) {
      out.append(this.separator);
      readIndex = 1;
      dotdotIndex = 1;
    }

    while (readIndex < path.length) {
      const currentChar = path[readIndex];

      if (this.isPathSeparator(currentChar)) {
        readIndex++;
        continue;
      }

      if (
        currentChar === "." &&
        (readIndex + 1 === path.length || this.isPathSeparator(path[readIndex + 1]))
      ) {
        readIndex++;
        continue;
      }

      if (
        currentChar === "." &&
        readIndex + 1 < path.length &&
        path[readIndex + 1] === "." &&
        (readIndex + 2 === path.length || this.isPathSeparator(path[readIndex + 2]))
      ) {
        readIndex += 2;

        if (out.writeIndex > dotdotIndex) {
          out.writeIndex--;
          while (out.writeIndex > dotdotIndex && !this.isPathSeparator(out.index(out.writeIndex))) {
            out.writeIndex--;
          }
        } else if (!rooted) {
          if (out.writeIndex > 0) {
            out.append(this.separator);
          }
          out.append(".");
          out.append(".");
          dotdotIndex = out.writeIndex;
        }
        continue;
      }

      if ((rooted && out.writeIndex !== 1) || (!rooted && out.writeIndex !== 0)) {
        out.append(this.separator);
      }

      while (readIndex < path.length && !this.isPathSeparator(path[readIndex])) {
        out.append(path[readIndex]);
        readIndex++;
      }
    }

    if (out.writeIndex === 0) {
      out.append(".");
    }

    this.postClean?.(out);
    return this.fromSlash(out.string());
  }

  static postClean?: (out: LazyVolPathBuffer) => void;

  static volumeName(path: string): string {
    return this.fromSlash(path.slice(0, this.volumeNameLen(path)));
  }

  static volumeNameLen(path: string): number {
    return 0;
  }

  static rel(basepath: string, targpath: string): string | undefined {
    const baseVol = this.volumeName(basepath);
    const targVol = this.volumeName(targpath);
    const base = this.clean(basepath);
    const targ = this.clean(targpath);

    if (this.stringEqual(targ, base)) {
      return ".";
    }

    const baseWithoutVol = base.substring(baseVol.length);
    const targWithoutVol = targ.substring(targVol.length);

    let processedBase = baseWithoutVol;
    if (processedBase === ".") {
      processedBase = "";
    } else if (processedBase === "" && this.volumeNameLen(baseVol) > 2) {
      processedBase = this.separator;
    }

    const baseSlashed = processedBase.length > 0 && processedBase[0] === this.separator;
    const targSlashed = targWithoutVol.length > 0 && targWithoutVol[0] === this.separator;

    if (baseSlashed !== targSlashed || !this.stringEqual(baseVol, targVol)) {
      return undefined;
    }

    const bl = processedBase.length;
    const tl = targWithoutVol.length;
    let b0 = 0,
      bi = 0,
      t0 = 0,
      ti = 0;

    while (true) {
      while (bi < bl && processedBase[bi] !== this.separator) {
        bi++;
      }
      while (ti < tl && targWithoutVol[ti] !== this.separator) {
        ti++;
      }
      if (!this.stringEqual(targWithoutVol.substring(t0, ti), processedBase.substring(b0, bi))) {
        break;
      }
      if (bi < bl) bi++;
      if (ti < tl) ti++;
      b0 = bi;
      t0 = ti;
    }

    if (processedBase.substring(b0, bi) === "..") {
      return undefined;
    }

    if (b0 !== bl) {
      const seps = processedBase.substring(b0, bl).split(this.separator).length - 1;
      let size = 2 + seps * 3;
      if (tl !== t0) {
        size += 1 + (tl - t0);
      }

      let result = "..";
      for (let i = 0; i < seps; i++) {
        result += this.separator + "..";
      }

      if (t0 !== tl) {
        result += this.separator + targWithoutVol.substring(t0);
      }

      return result;
    }

    return targWithoutVol.substring(t0);
  }

  static stringEqual: (a: string, b: string) => boolean;

  static isLocal: (path: string) => boolean;

  static localize: (path: string) => string | undefined;

  static join: (...paths: string[]) => string;

  static isAbs: (path: string) => boolean;

  static pretty(s: string): string {
    s = this.clean(s);
    if (s == "." || s == ".." || this.isAbs(s)) {
      return s;
    }
    return `.${this.separator}${s}`;
  }
}
