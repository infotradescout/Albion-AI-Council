# UX QA Checklist Template

## Scope
- Feature or flow:
- Branch:
- Tester:
- Date:
- Build or commit:

## User Flow
- Entry point:
- Primary user goal:
- Success endpoint:
- Alternate paths:
- Exit or cancel path:

## Screen Inventory
| Screen | Purpose | States Checked | Notes |
| --- | --- | --- | --- |
|  |  | loading / empty / error / success |  |

## Interaction Checklist
- [ ] Every clickable control responds.
- [ ] Primary action is obvious.
- [ ] Secondary actions do not compete with the primary action.
- [ ] Back, cancel, close, and retry paths work.
- [ ] Disabled controls explain or imply why they are disabled.
- [ ] Destructive actions require appropriate confirmation.
- [ ] Keyboard focus is visible and logical.

## Forms
- [ ] Required fields are marked or clear from context.
- [ ] Invalid input shows useful errors.
- [ ] Submit cannot double-submit.
- [ ] Loading state appears during submit.
- [ ] Success state confirms what happened.
- [ ] Failure state preserves user input where possible.

## Data And States
- [ ] Realistic data tested.
- [ ] Long text tested.
- [ ] Empty data tested.
- [ ] Partial data tested.
- [ ] API error or failed load tested.
- [ ] Session expired or signed-out state tested when relevant.

## Responsive Layout
- [ ] Mobile checked.
- [ ] Tablet checked.
- [ ] Desktop checked.
- [ ] Text does not overlap or clip.
- [ ] Primary actions remain reachable.

## Visual And Accessibility
- [ ] Visual hierarchy is clear.
- [ ] Spacing and alignment are consistent.
- [ ] Contrast is readable.
- [ ] Inputs have accessible labels.
- [ ] Errors are visible and specific.
- [ ] No internal architecture leaks onto the user-facing surface.

## Console And Network
- [ ] No unexplained console errors.
- [ ] No failed network calls in the happy path.
- [ ] Failed network calls show user-safe recovery.

## Result
- Release gate status: pass / blocked
- Critical bugs:
- High bugs:
- Medium bugs:
- Low bugs:
- Re-QA required:
