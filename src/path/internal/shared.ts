export function validPath(name: string): boolean {
  if (name === ".") {
    return true;
  }

  while (name.length > 0) {
    const separatorIndex = name.indexOf("/");

    const elem = separatorIndex === -1 ? name : name.substring(0, separatorIndex);

    if (elem === "" || elem === "." || elem === "..") {
      return false;
    }

    if (separatorIndex === -1) {
      return true;
    }

    name = name.substring(separatorIndex + 1);
  }

  return true;
}

export class LazyPathBuffer {
  path: string;
  buffer?: string[];
  writeIndex: number = 0;

  constructor(s: string) {
    this.path = s;
  }

  index(i: number): string {
    return this.buffer ? this.buffer[i] : this.path[i];
  }

  append(c: string): void {
    if (!this.buffer) {
      if (this.writeIndex < this.path.length && this.path[this.writeIndex] === c) {
        this.writeIndex++;
        return;
      }
      this.buffer = Array.from(this.path);
    }
    this.buffer[this.writeIndex] = c;
    this.writeIndex++;
  }

  string(): string {
    if (!this.buffer) {
      return this.path.substring(0, this.writeIndex);
    }
    return this.buffer.slice(0, this.writeIndex).join("");
  }
}

export class LazyVolPathBuffer extends LazyPathBuffer {
  originalPath: string;
  volLen: number;
  constructor(options: { path: string; originalPath: string; volLen: number }) {
    super(options.path);
    this.originalPath = options.originalPath;
    this.volLen = options.volLen;
  }

  prepend(...prefix: string[]): void {
    if (!this.buffer) {
      this.buffer = Array.from(this.path);
    }

    this.buffer = [...prefix, ...this.buffer];
    this.writeIndex += prefix.length;
  }

  string(): string {
    if (!this.buffer) {
      return this.originalPath.substring(0, this.volLen + this.writeIndex);
    }

    return (
      this.originalPath.substring(0, this.volLen) + this.buffer.slice(0, this.writeIndex).join("")
    );
  }
}
