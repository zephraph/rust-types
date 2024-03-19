const Never = undefined as never;

export class Result<T extends "ok" | "error", D, E extends Error> {
  private constructor(
    public readonly type: T,
    public readonly data: T extends "ok" ? D : never = Never,
    public readonly error: T extends "error" ? E : never = Never
  ) {}

  static ok<T>(value: T): Result<"ok", T, never> {
    return new Result("ok", value);
  }

  static err<E extends Error>(error: E): Result<"error", never, E> {
    return new Result("error", Never, error);
  }

  static fromPromise<T, E extends Error = Error>(
    promise: Promise<T>
  ): Promise<Result<"error", never, E> | Result<"ok", T, never>> {
    return promise.then(Result.ok).catch(Result.err);
  }

  isOk(): this is { type: "ok"; data: T } {
    return this.type === "ok";
  }

  isErr(): this is { type: "error"; error: E } {
    return this.type === "error";
  }

  unwrap(): (T extends "ok" ? D : never) & T {
    if (this.isOk()) {
      return this.data;
    } else {
      throw this.error;
    }
  }

  unwrapErr(): (T extends "error" ? E : never) & E {
    if (this.isErr()) {
      return this.error;
    } else {
      throw new Error("Cannot unwrapErr an Ok result");
    }
  }

  map<U>(
    fn: (value: T) => U
  ):
    | Result<"ok", U, never>
    | Result<"error", never, T extends "error" ? E : never> {
    if (this.isOk()) {
      return Result.ok(fn(this.data));
    } else {
      return Result.err(this.error);
    }
  }

  mapErr<F extends Error>(
    fn: (error: E) => F
  ):
    | Result<"error", never, F>
    | Result<"ok", T extends "ok" ? D : never, never> {
    if (this.isErr()) {
      return Result.err(fn(this.error));
    } else {
      return Result.ok(this.data);
    }
  }
}

export class Option<T extends "some" | "none", V> {
  private constructor(
    public readonly type: T,
    public readonly value: T extends "some" ? V : never = Never
  ) {}

  static some<T>(value: T): Option<"some", T> {
    return new Option("some", value);
  }

  static none(): Option<"none", never> {
    return new Option("none");
  }

  isSome(): this is { type: "some"; value: V } {
    return this.type === "some";
  }

  isNone(): this is { type: "none" } {
    return this.type === "none";
  }

  unwrap(): V {
    if (this.isSome()) {
      return this.value;
    } else {
      throw new Error("Cannot unwrap a None option");
    }
  }

  map<U>(fn: (value: V) => U): Option<"some", U> | Option<"none", never> {
    if (this.isSome()) {
      return Option.some(fn(this.value as V));
    } else {
      return Option.none();
    }
  }
}
