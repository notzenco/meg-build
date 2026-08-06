# Meg Build

Public GitHub Actions orchestration for the private
[`notzenco/meg`](https://github.com/notzenco/meg) iPhone app.

This repository intentionally contains no application source and no build
artifacts. Both manual workflows check out one exact private source commit using
a read-only, repository-scoped deploy key. `Build private Meg source` performs
an unsigned simulator build. `Deploy private Meg source to TestFlight` creates
a signed archive and uploads it to App Store Connect when release credentials
are configured.

Workflow logs are public. Do not add steps that display source files,
environment variables, signing values, or personal content.

## TestFlight configuration

The deployment workflow requires these repository variables:

- `APPLE_TEAM_ID`
- `IOS_BUNDLE_ID`
- `IOS_WIDGET_BUNDLE_ID`
- `WATCH_BUNDLE_ID`
- `WATCH_WIDGET_BUNDLE_ID`
- `APP_GROUP_ID`
- `ICLOUD_CONTAINER_ID`

It requires these repository secrets:

- `MEG_SOURCE_DEPLOY_KEY`
- `APPLE_CERTIFICATE_P12`
- `APPLE_CERTIFICATE_PASSWORD`
- `IOS_PROVISIONING_PROFILE`
- `IOS_WIDGET_PROVISIONING_PROFILE`
- `WATCH_PROVISIONING_PROFILE`
- `WATCH_WIDGET_PROVISIONING_PROFILE`
- `APP_STORE_CONNECT_API_KEY`
- `APP_STORE_CONNECT_API_KEY_ID`
- `APP_STORE_CONNECT_ISSUER_ID`

The four provisioning profile secrets must contain unexpired App Store
distribution profiles for the iPhone app, iPhone widgets, Watch app, and Watch
widgets. The workflow validates every application identifier and App Group. The
main profile must additionally contain CloudKit, `iCloud.pw.kian.meg`, and the
Meg iCloud key-value identifier.

The source repository documents CloudKit schema deployment and the two-phone
sharing check in `docs/planner-and-sync.md`. This public repository never
contains the schema's private records or encrypted payloads.

The workflow deliberately does not publish archives, IPAs, source, or raw build
logs as artifacts. Compiler and archive diagnostics are suppressed because this
repository and its logs are public.
