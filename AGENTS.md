# Meg public build instructions

## Commands

- GitHub Actions `Build private Meg source` is the only supported build entry.

## Architecture

- `.github/workflows/build.yml` checks out the private source with a read-only
  deploy key and builds it on a public macOS runner.
- This repository never owns application source, signing assets, or personal
  content.

## Gotchas

- Never enable private-source access for pull request events.
- Never print source files, secrets, environment dumps, or signing values.
- Pin actions and build only an explicit private source ref.
- Do not upload source, DerivedData, archives, or app artifacts publicly.

## Definition of done

- Manual dispatch builds the requested private source revision.
- The deploy key can read only `notzenco/meg` and cannot write to it.
- No private source or build artifact is uploaded from the ephemeral runner.
