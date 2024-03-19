const Never = undefined as never;

/**
 * A Result type that can be either Ok or Error
 * Used to represent the result of an operation that can fail
 */
export class Result<Type extends "ok" | "error", Value, Err extends Error> {
  private constructor(
    public readonly type: Type,
    public readonly value: Type extends "ok" ? Value : never = Never,
    public readonly error: Type extends "error" ? Err : never = Never
  ) {}

  /** Construct a new Ok result type */
  static ok<T>(value: T): Result<"ok", T, never> {
    return new Result("ok", value);
  }

  /** Construct a new Error result type */
  static err<E extends Error>(error: E): Result<"error", never, E> {
    return new Result("error", Never, error);
  }

  /** Convert a `Promise` into a `Result` */
  static fromPromise<Type, Err extends Error = Error>(
    promise: Promise<Type>
  ): Promise<Result<"error", never, Err> | Result<"ok", Type, never>> {
    return promise.then(Result.ok).catch(Result.err);
  }

  /** Check if a result is ok */
  isOk(): this is { type: "ok"; data: Type } {
    return this.type === "ok";
  }

  /** Check if a result is an error */
  isErr(): this is { type: "error"; error: Err } {
    return this.type === "error";
  }

  /** Return the value of the result if ok, throw otherwise */
  unwrap(): Type extends "ok" ? Value : never {
    if (this.isOk()) {
      return this.value;
    }
    throw this.error;
  }

  /** Return the value of the result if ok, used the fallback value otherwise */
  unwrapOr<U extends Value>(fallbackValue: U): Type extends "ok" ? Value : U {
    return this.isOk() ? this.value : fallbackValue;
  }

  /** Return the error if the result is an error, throw otherwise */
  unwrapErr(): Type extends "error" ? Err : never {
    if (this.isErr()) {
      return this.error;
    }
    throw new Error("Cannot unwrapErr an Ok result");
  }

  /** Deeply unwrap and `Result` or `Option` types, throwing when unwrap failes */
  unwrapDeep(): Type extends "ok" ? Value : never {
    const value = this.unwrap();
    if (value instanceof Result) {
      return value.unwrapDeep();
    }
    if (value instanceof Option) {
      return value.unwrapDeep();
    }
    return value;
  }

  /** Transform the value of the result if it's Ok while keeping it a result type */
  map<U>(
    fn: (value: Value) => U
  ):
    | Result<"ok", U, never>
    | Result<"error", never, Type extends "error" ? Err : never> {
    return this.isOk() ? Result.ok(fn(this.value)) : Result.err(this.error);
  }

  /** Transform the error of the result if it's an error while keeping it as a result type */
  mapErr<F extends Error>(
    fn: (error: Err) => F
  ):
    | Result<"error", never, F>
    | Result<"ok", Type extends "ok" ? Value : never, never> {
    return this.isErr() ? Result.err(fn(this.error)) : Result.ok(this.value);
  }
}

/**
 * An Option type that can be either Some or None
 * Used to represent a value that may or may not be present
 */
export class Option<Type extends "some" | "none", Value> {
  private constructor(
    public readonly type: Type,
    public readonly value: Type extends "some" ? Value : never = Never
  ) {}

  /** Construct a new Some option type */
  static some<T>(value: T): Option<"some", T> {
    return new Option("some", value);
  }

  /** Construct a new None option type */
  static none(): Option<"none", never> {
    return new Option("none");
  }

  /** Return an option that's None if the given value is `null` or `undefined` */
  static from<Type>(
    maybe: Type
  ): Option<"none", never> | Option<"some", NonNullable<Type>> {
    return maybe === undefined || maybe === null
      ? Option.none()
      : Option.some(maybe);
  }

  /** `true` if the option is `some` */
  isSome(): this is { type: "some"; value: Value } {
    return this.type === "some";
  }

  /** `true` if the option is `none` */
  isNone(): this is { type: "none" } {
    return this.type === "none";
  }

  /** If the option is some, return the value. Otherwise throw */
  unwrap(): Type extends "some" ? Value : never {
    if (this.isSome()) {
      return this.value;
    }
    throw new Error("Cannot unwrap a None option");
  }

  /** If the option is some, return the value. Otherwise use the fallback value */
  unwrapOr<U extends Value>(fallbackValue: U): Type extends "some" ? Value : U {
    return this.isSome() ? this.value : fallbackValue;
  }

  /** Deeply unwrap and `Result` or `Option` types, throwing when unwrap failes */
  unwrapDeep(): Type extends "some" ? Value : never {
    const value = this.unwrap();
    if (value instanceof Result) {
      return value.unwrapDeep();
    }
    if (value instanceof Option) {
      return value.unwrapDeep();
    }
    return value;
  }

  /** Transform the value of the option if it's Some while keeping it an option type */
  map<U>(fn: (value: Value) => U): Option<"some", U> | Option<"none", never> {
    return this.isSome() ? Option.some(fn(this.value as Value)) : Option.none();
  }
}
