# DRY/SRP Audit Template

## Scope
- Files inspected:
- Flow or feature:
- Auditor:
- Date:
- Commit:

## Summary
- Overall risk: critical / high / medium / low
- Refactor now: yes / no
- Reason:

## Findings
| File | Finding | Risk | Suggested Lane |
| --- | --- | --- | --- |
|  | oversized file / repeated try-catch / raw fetch / duplicated formatter / mixed responsibility |  |  |

## Oversized File Check
- File:
- Approximate size:
- Responsibilities mixed:
- Suggested split:
- Tests needed before split:

## Repetition Check
- Repeated server `try/catch` blocks:
- Raw `fetch()` bypasses:
- Duplicated formatters:
- Repeated validation:
- Repeated permission checks:

## SRP Check
- Data access mixed with rendering:
- Transformation mixed with side effects:
- UI component owns too many concerns:
- Shared helper candidate:

## Refactor Guardrails
- Behavior to preserve:
- Tests required before refactor:
- Rollback plan:
- Re-QA flow:

## Decision
- Proceed to refactor lane:
- Defer with justification:
- Block feature work:
