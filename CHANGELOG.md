# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [10.0.4] - 2026-07-16

### Fixed
- **tools**: harden jwt-decoder Base64 handling and add regex-tester ReDoS guard
- **tools**: correct `ok:false` contract and input guards in ssl-decoder / cron-parser / bmi-bfr-bmr
- **math-core**: harden complex / solver / graph error paths and add tests
- **tools**: harden color / compound / csv / diff tool cores
- **tools**: harden http / lunar / password / timezone / graph / css-js-minify cores
- **tools**: adjust desktop views for electricity / sql / graph

### Changed
- **types**: extend `Tool` / `ToolOutput` types
- **cli-core**: update registry and dynamic loader
- **config**: add `tsconfig.json`, adjust `biome.json` and root `package.json`

## [10.0.3b]

Previous beta release. See git history for details.

[10.0.4]: https://github.com/QscReLinwe/ToolDepot/compare/v10.0.3b...v10.0.4
[10.0.3b]: https://github.com/QscReLinwe/ToolDepot/releases/tag/v10.0.3b
