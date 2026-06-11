# AI Parallel Execution

## Purpose
This document defines the operating model for safe parallel Codex work in the Albion AI Council repository. It is repo-level execution doctrine only. It does not authorize product behavior changes, cross-brand borrowing, or unreviewed AI authority changes.

## Authority
- Gawain defines doctrine, slice scope, and merge order.
- Codex implements one assigned lane per session.
- Gemini reviews and criticizes.
- Gawain reconciles Gemini criticism and issues corrected prompts.
- Gemini criticism is not optional.
- Gawain controls merge order.

## Parallel Execution Rules
- One Codex session gets one lane.
- One lane gets one branch.
- Do not stack unrelated work into the same branch.
- Inspect first: read the relevant files, current branch, baseline SHA, and validation surface before editing.
- Choose the smallest safe slice that satisfies the assigned lane.
- Prefer contracts and tests before behavior when possible.
- Do not modify application behavior unless the assigned lane explicitly requires it.
- Do not alter product copy unless the assigned lane explicitly requires it.
- Do not import doctrine from another brand.
- Do not make broad cleanup changes.
- Do not rename existing files unless required by the lane.
- Do not touch files outside the lane unless reported in the return.

## Evidence And Status Rules
- No fake status.
- No fake commits.
- No fake test results.
- Do not claim tests passed unless they actually ran.
- Report skipped, unavailable, blocked, or unknown validation honestly.
- If no validation command exists, say so and do not invent one.
- Every final report must include the baseline SHA and final git status.

## Branch And Commit Rules
- Use one branch per lane.
- Branch names should identify the repo area and lane intent.
- Commit only the assigned lane changes.
- Do not include unrelated local changes in the commit.
- Validate before commit when a validation command exists.
- Use the assigned commit message when one is provided.

## Review And Merge Rules
- Gemini review is required before merge.
- Gemini criticism must be treated as blocking input until Gawain reconciles it.
- Gawain determines corrected prompts after Gemini review.
- Gawain controls merge order across parallel lanes.
- A lane is not merge-ready until validation status, risks, and follow-up needs are reported.

## Global Codex Lane Return Format
Every Codex lane must return:

- repo
- lane chosen
- branch
- baseline SHA
- files inspected
- files changed
- tests run
- test results
- commit SHA if committed
- PR link if opened
- final git status
- risks / follow-up needed
