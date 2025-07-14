import { trimStart } from "../strings/utils.js";

const MatchStrict = 0;
const MatchDynamic = 1;
const MatchRestDynamic = 2;

const nextPart = (path: string): [string, string] => {
  path = trimStart(path, "/");

  if (path === "") {
    return ["", ""];
  }

  const idx = path.indexOf("/");
  if (idx === -1) {
    return [path, ""];
  }
  return [path.slice(0, idx), path.slice(idx + 1)];
};

const parseDynamic = (key: string): { type: 0 | 1 | 2; key: string } => {
  if (key.length > 1) {
    const first = key[0];
    const last = key[key.length - 1];

    if ((first === "{" && last === "}") || (first === "[" && last === "]")) {
      key = key.slice(1, key.length - 1);
      const result = parseDynamic(key);
      if (result.type === MatchStrict) {
        result.type = MatchDynamic;
      }
      return result;
    }

    if (first === ":") {
      return { key: key.slice(1), type: MatchDynamic };
    }

    if (first === "*") {
      return { key: key.slice(1), type: MatchRestDynamic };
    }

    if (key.startsWith("...")) {
      return { key: key.slice(3), type: MatchRestDynamic };
    }

    if (key.endsWith("...")) {
      return { key: key.slice(-3), type: MatchRestDynamic };
    }
  }

  return {
    key,
    type: MatchStrict,
  };
};

const parseParams = (path: string, pattern: string): Record<string, string> => {
  const params = {};
  let pathPart: string, patternPart: string;

  while (true) {
    [pathPart, path] = nextPart(path);
    [patternPart, pattern] = nextPart(pattern);

    if (patternPart === "" || pathPart === "") {
      break;
    }

    const info = parseDynamic(patternPart);
    switch (info.type) {
      case MatchDynamic:
        params[info.key] = pathPart;
        break;
      case MatchRestDynamic:
        params[info.key] = pathPart;
        if (path !== "") {
          params[info.key] += "/" + path;
        }
        return params;
    }
  }
  return params;
};

export class Router {
  pattern: string = "";
  part: string = "";
  match: 0 | 1 | 2 = MatchStrict;
  protected children: Router[] = [];

  insert(pattern: string): void {
    this._insert(pattern, pattern);
    this.sort();
  }

  protected _insert(path: string, pattern: string): void {
    if (path === "") {
      this.pattern = pattern;
      return;
    }

    const [part, remaining] = nextPart(path);
    let child = this.children.find((child) => child.part === part);

    if (!child) {
      child = new Router();
      child.part = part;
      child.match = parseDynamic(part).type;
      this.children.push(child);
    }
    child._insert(remaining, pattern);
  }

  params(path: string): Record<string, string> {
    return parseParams(path, this.pattern);
  }

  search(path: string): Router | null {
    if (path === "") {
      if (this.pattern !== "") {
        return this;
      }
      return null;
    }

    const [part, remaining] = nextPart(path);

    for (const child of this.children) {
      switch (child.match) {
        case MatchStrict: {
          if (child.part === part) {
            const result = child.search(remaining);
            if (result) {
              return result;
            }
          }
          break;
        }
        case MatchDynamic: {
          const result = child.search(remaining);
          if (result) {
            return result;
          }
          break;
        }
        case MatchRestDynamic:
          return child;
      }
    }
    return null;
  }

  protected sort(): void {
    this.children.sort((a, b) => a.match - b.match);
    for (const child of this.children) {
      child.sort();
    }
  }
}
