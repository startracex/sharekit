/**
 * Port from go std:
 * - internal/filepathlite/path_plan9.go
 * - path/filepath/path_plan9.go
 */
import { PathUnix } from "./unix.ts";

const isAbs = (path: string): boolean => path.startsWith("/") || path.startsWith("#");

const localize = (path: string): string | undefined =>
  path.startsWith("#") || path.includes("\x00") ? undefined : path;

export class PathPlan9 extends PathUnix {
  static isAbs: (path: string) => boolean = isAbs;
  static localize: (path: string) => string | undefined = localize;
}

const separator: typeof PathPlan9.separator = PathPlan9.separator;
const ext: typeof PathPlan9.ext = PathPlan9.ext.bind(PathPlan9);
const base: typeof PathPlan9.base = PathPlan9.base.bind(PathPlan9);
const dir: typeof PathPlan9.dir = PathPlan9.dir.bind(PathPlan9);
const clean: typeof PathPlan9.clean = PathPlan9.clean.bind(PathPlan9);
const join: typeof PathPlan9.join = PathPlan9.join.bind(PathPlan9);
const rel: typeof PathPlan9.rel = PathPlan9.rel.bind(PathPlan9);
const pretty: typeof PathPlan9.pretty = PathPlan9.pretty.bind(PathPlan9);

export {
  pretty,
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
