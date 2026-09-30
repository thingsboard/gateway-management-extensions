# Contributing

## Branches

There are two active branches:

| Branch | Angular | ThingsBoard types pin | What it is for |
|---|---|---|---|
| `master` | 18 | `release/4.2.0` | The maintained line for the currently supported platform releases — 4.2.x and 4.3.x. |
| `release/4.4` | 20 | `release/4.3.1` | The upcoming 4.4 release, built on Angular 20. Pin moves to the 4.4 types branch once it is published. |

Do not create `release/4.2` or `release/4.3` branches. `master` covers both, and
every extra branch adds another merge to keep in sync.

`release/3.9` and `release/4.0` are an archive of shipped releases and are not
maintained. This repository has no tags, so those branches are the only markers
of those release points.

### Which types version to pin

The two branches follow different rules, because they cover different spans.

**`master` pins the lowest supported release** — currently `release/4.2.0`.
Building against the lowest supported version guarantees the code uses no API
that is missing from the oldest platform we still support, so the same build
also runs on every newer one. Pinning higher would silently let newer APIs in
and break the older platforms.

**`release/4.4` pins the release it targets.** It is not a range, so it tracks
the types of its own release.

Beware that the Angular generation of the types does **not** follow the
ThingsBoard release number — the platform moved to Angular 20 inside patch
releases:

| Types branch | `@angular/core` |
|---|---|
| `release/4.0`, `release/4.1.0`, `release/4.2.0`, `release/4.3.0` | 18.2.13 |
| `release/4.2.2`, `release/4.3.1` | 20.3.18 |

So `release/4.3.0` is an Angular 18 branch while `release/4.2.2` is already an
Angular 20 one. Always check `@angular/core` in the types' `package.json` before
changing a pin — the version number alone will mislead you.

Pinning `master` to an Angular 20 types branch does not work: it pulls a second
copy of `rxjs` and `@ngrx/store` into `node_modules/thingsboard/node_modules`,
and the build fails on type incompatibilities between the two copies. This is
also why `master` can keep serving 4.2.2 and 4.3.1 even though those platforms
ship Angular 20 — an Angular 18 build still runs there, it is simply less
optimized than what `release/4.4` produces.

## Where to make a change

**Always start from `master`.** Open your pull request against `master`, never
against a release branch.

Once it is merged, **merge forward** into `release/4.4`:

```bash
git checkout -b merge/master-into-4.4-$(date +%Y%m%d) origin/release/4.4
git merge origin/master
# resolve conflicts, if any
yarn install && yarn build && yarn lint
git push -u origin HEAD
gh pr create --base release/4.4
```

Do this after every merged pull request, not once per release. The longer the
branches stay apart, the more expensive the merge becomes.

**Never apply the same change to both branches separately.** Cherry-picking a
commit into `release/4.4` instead of merging makes every later merge conflict
with itself, because git no longer sees the two sides as sharing that change.
This has already happened once: `appearance="outline"` was applied twice, by
hand, to fifteen of the same files on both branches.

## What may differ between branches

Everything under `src/` is expected to be identical across branches. Only these
files may differ; anything else that diverges is a bug:

| File | Reason |
|---|---|
| `package.json`, `yarn.lock` | Angular and ThingsBoard types versions |
| `src/package.json`, `src/tsconfig.lib.json` | peer dependencies |
| `patches/` | patch file names contain the Angular version |
| `angular.json`, `tsconfig.json` | build configuration |
| `.eslintrc.json` vs `eslint.config.mjs` | different eslint generations |
| `install.js`, `builders/static-serve/index.ts` | build tooling |
| `gateway-locale.constant.ts`, `gateway-extension.module.ts` | ngx-translate 15 vs 17 API |
| `README.md`, `UPDATING.md` | per-branch documentation |

Before merging forward, compare against this list:

```bash
git diff --name-only origin/master origin/release/4.4 -- src
```

Note that the new control flow (`@if` / `@for` / `@switch`), omitting
`CommonModule`, and `takeUntilDestroyed(destroyRef)` are **not** reasons for the
branches to differ. All of them are valid on Angular 17 and later, so they work
on 18 and 20 alike. The branches once diverged across 101 files for exactly this
reason, and none of it was necessary.

## Before opening a pull request

```bash
yarn install
yarn build   # includes the license header check
yarn lint
```

`yarn build` runs `yarn license-check` first. If it reports a missing or
malformed header, fix it with `yarn license-add` — do not remove the check.
It was once dropped from `release/4.4`, and six files silently lost or corrupted
their license headers before anyone noticed.
