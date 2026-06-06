---
"tt-rss-non-dockerize": patch
---

Fix PHPStan error with booleanAnd checks

PHPStan was reporting errors about "Left side of && is always false" due to
PHPDoc types being treated as certain. This change adds `treatPhpDocTypesAsCertain: false`
to phpstan.neon as suggested by PHPStan's hint.

Also fix release artifact size by excluding vendor, node_modules, lib/dojo, lib/dijit directories
since they exceed GitHub's 100 MB file size limit.