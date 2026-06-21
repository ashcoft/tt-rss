---
"tt-rss": patch
---

Security patches merged in PR #42 and subsequent fixes

This release includes:
- SQL injection prevention with whitelist validation in order_by parameter
- XSS prevention in Db.php error message handling
- DOM text reinterpreted as HTML fix (PR #45)
- Dependency security updates

### Merged PRs:
- #42: Fix SQL injection vulnerability
- #45: Fix SonarCloud XSS issues
