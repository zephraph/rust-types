# @justbe/rust-types

Rust inspired types for TypeScript.

## Examples

### Result type

```ts
import { Result } from "@justbe/rust-types";

// Use `Result.ok` to construct an OK type
const ok = Result.ok("this works");

// Use `Result.err` to construct an Error type
const err = Result.err(new Error("something went wrong!"));

/// Safely coerce the results of a promise into a result type
const promiseResult = await Result.fromPromise(myPromise);

// `isErr` or `isOk` can be used to check the kind of result
if (promiseResult.isErr()) {
  // handle your error...
}

// Use `unwrap` to get the value of the result. Throws if the result is an error.
const myValue = promiseResult.unwrap();
```

### Option type

```ts
import { Option } from "@justbe/rust-types";

// Use `Option.some` to construct a `Some` type
const some = Option.some("value");

// Use `Option.none` to construct a `None` type
const none = Option.none();

// Construct an option from a type that might be `null` or `undefined`
const optionalValue = Option.from(someValue);

// `isSome` or `isNone` can be used to check the state of the value
if (optionalValue.isNone()) {
}
```
