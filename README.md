# Meg Build

Public GitHub Actions orchestration for the private
[`notzenco/meg`](https://github.com/notzenco/meg) iPhone app.

This repository intentionally contains no application source and no build
artifacts. The manual workflow checks out one requested private source revision
using a read-only, repository-scoped deploy key, generates the Xcode project,
and performs an unsigned simulator build.

Workflow logs are public. Do not add steps that display source files,
environment variables, signing values, or personal content.

