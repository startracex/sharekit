import { PathUnix } from "./filepath/unix.ts";
import { PathWindows } from "./filepath/windows.ts";

const Factory: typeof PathUnix | typeof PathWindows =
  globalThis.process?.platform === "win32" ? PathWindows : PathUnix;

const separator: (typeof Factory)["separator"] = Factory.separator;
const ext: (typeof Factory)["ext"] = Factory.ext.bind(Factory);
const base: (typeof Factory)["base"] = Factory.base.bind(Factory);
const dir: (typeof Factory)["dir"] = Factory.dir.bind(Factory);
const clean: (typeof Factory)["clean"] = Factory.clean.bind(Factory);
const join: (typeof Factory)["join"] = Factory.join.bind(Factory);
const rel: (typeof Factory)["rel"] = Factory.rel.bind(Factory);
const isAbs: (typeof Factory)["isAbs"] = Factory.isAbs.bind(Factory);

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
