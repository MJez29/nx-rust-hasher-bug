# NxRustHasherBug

I discovered an inconsistency between the rust and node hashers

The `demo` target prints out the value of `src/__private__/x.js` and is cacheable. It has the following inputs: `[{projectRoot}/**/*, !{projectRoot}/**/__test?(s)__/**/*]`

The `increment` target increments `src/__private__/x.js` to trigger a cache miss

## Node Hasher Behaviour (works correctly)

```
$ npx nx reset

$ NX_DAEMON=false NX_NATIVE_TASK_HASHER=false npx nx demo nx-rust-hasher-bug
> nx run nx-rust-hasher-bug:demo

> node src/index.js

x is 1

 NX   Successfully ran target demo for project nx-rust-hasher-bug (87ms)

$ npx nx increment nx-rust-hasher-bug

$ NX_DAEMON=false NX_NATIVE_TASK_HASHER=false npx nx demo nx-rust-hasher-bug
> nx run nx-rust-hasher-bug:demo

> node src/index.js

x is 2

 NX   Successfully ran target demo for project nx-rust-hasher-bug (106ms)
```

## Rust Hasher Behaviour (does not work as expected)

```
$ npx nx reset

$ NX_DAEMON=false NX_NATIVE_LOGGING=[hash_project_files{project_name=nx-rust-hasher-bug}] npx nx demo nx-rust-hasher-bug
TRACE nx::native::glob: hash_project_files{project_name="nx-rust-hasher-bug"}: converted globs globs=["**/*", "!**/__test?(s)__/**/*"] result=["**/*", "!**/*__/**/*", "!**/__tests__/**/*"]
...
> nx run nx-rust-hasher-bug:demo

> node src/index.js

x is 2

 NX   Successfully ran target demo for project nx-rust-hasher-bug (96ms)

$ npx nx increment nx-rust-hasher-bug

$ NX_DAEMON=false NX_NATIVE_LOGGING=[hash_project_files{project_name=nx-rust-hasher-bug}] npx nx demo nx-rust-hasher-bug
> nx run nx-rust-hasher-bug:demo  [existing outputs match the cache, left as is]

> node src/index.js

x is 2

 NX   Successfully ran target demo for project nx-rust-hasher-bug (45ms)

Nx read the output from the cache instead of running the command for 1 out of 1 tasks.
```

This shows the inconsistency in behaviour. The Node implementation has a cache miss whereas the Rust implementation has a cache hit.

My understanding of the inputs syntax is that `!**/__test?(s)__/**/*` should expand to `!**/__test__/**/*, !**/__tests__/**/*` but I am seeing it expand to `!**/*__/**/*, !**/__tests__/**/*` which is incorrectly excluding the `__private__` folder.
