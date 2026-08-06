# Meg public build instructions

## Commands

- GitHub Actions `Build private Meg source` is the only supported build entry.
- GitHub Actions `Deploy private Meg source to TestFlight` is the only supported
  signed release entry.

## Architecture

- `.github/workflows/build.yml` checks out the private source with a read-only
  deploy key and builds its iPhone, Watch, and widget targets on a public macOS
  runner.
- `.github/workflows/testflight.yml` checks out an exact private commit, validates
  all four App Store profiles including the main app's CloudKit entitlements,
  archives them, and uploads the result to App Store Connect.
- This repository never owns application source, signing assets, or personal
  content.

## Gotchas

- Never enable private-source access for pull request events.
- Never print source files, secrets, environment dumps, or signing values.
- Pin actions and build only an explicit private source ref.
- Do not upload source, DerivedData, archives, or app artifacts publicly.
- Suppress raw compiler, archive, and export diagnostics in public logs.
- Keep `iCloud.pw.kian.meg` in variables only; never store CloudKit data here.

## Definition of done

- Manual dispatch builds the requested private source revision.
- TestFlight dispatch validates the signed iPhone app, Watch companion, and
  both widget extensions before receiving upload acceptance.
- The deploy key can read only `notzenco/meg` and cannot write to it.
- No private source or build artifact is uploaded from the ephemeral runner.
