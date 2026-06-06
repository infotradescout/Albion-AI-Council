# Founder Approval Board

## Purpose
Founder Approval Board provides one-view tracking for mandate status and blockers.

## Minimum Columns
- Run ID
- Kingdom
- Destination
- Sponsor
- Priority
- Status
- Gawain
- Lancelot
- Percival
- Blocked By
- Next Action

## Valid Status Values
- intake
- routing
- in_progress
- high_court_review
- roundtable_review
- approved
- blocked
- reroute_required
- human_discussion_required
- done

## Operational Rules
- Board must be updated for every Roundtable-bound run.
- Any single Knight reject marks status as blocked.
- blocked entries must include Blocked By and Next Action.
- approved requires 3 of 3 approvals.

## Starter Implementation
A shared sheet is acceptable as the first implementation as long as it is kept current and auditable.
