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

It requires these repository secrets:

- `MEG_SOURCE_DEPLOY_KEY`
- `APPLE_CERTIFICATE_P12`
- `APPLE_CERTIFICATE_PASSWORD`
- `APP_STORE_CONNECT_API_KEY`
- `APP_STORE_CONNECT_API_KEY_ID`
- `APP_STORE_CONNECT_ISSUER_ID`

The workflow uses the App Store Connect API to enable the app's iCloud
capability and prepare fresh App Store distribution profiles for both the app
and widget at runtime. It validates both embedded profiles after archiving;
provisioning profiles do not need to be stored as repository secrets.

The workflow deliberately does not publish archives, IPAs, source, or raw build
logs as artifacts. Compiler and archive diagnostics are suppressed because this
repository and its logs are public.
