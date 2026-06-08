# Albion Doctrine Drift Audit

Date: 2026-06-06
Scope: Read-only terminology and doctrine drift audit across docs/albion

## 1. Search Terms Checked
- roundtable_knight_profile_v1
- roundtable_alignment_packet_v1
- static profile
- final profile
- AI Council approval
- High Court approval required
- 3/3 High Court approval
- Merlin inside Albion
- Merlin Kingdom
- Jeff
- Sovereign Triumvirate
- Trader's Corner
- Trader’s Corner
- Albien

## 2. Findings by File

### File: docs/albion/ALBION_CONTROL_BIBLE.md
- Exact stale phrase: roundtable_knight_profile_v1
- Location: line 234
- Why it conflicts: Current doctrine has moved to dynamic living profile packets.
- Recommended correction: Replace with roundtable_knight_profile_dynamic_v1.
- Severity: blocker
- Patch required: yes

- Exact stale phrase: roundtable_alignment_packet_v1
- Location: line 235
- Why it conflicts: Current doctrine has moved to dynamic alignment packet.
- Recommended correction: Replace with roundtable_alignment_packet_dynamic_v1.
- Severity: blocker
- Patch required: yes

### File: docs/albion/FOUNDER_ONBOARDING.md
- Exact stale phrase: roundtable_knight_profile_v1
- Location: lines 54 and 89
- Why it conflicts: Founder flow still points to static packet names.
- Recommended correction: Replace with roundtable_knight_profile_dynamic_v1 and update steps to dynamic update lifecycle.
- Severity: blocker
- Patch required: yes

- Exact stale phrase: roundtable_alignment_packet_v1
- Location: lines 55 and 91
- Why it conflicts: Founder flow still points to static alignment packet.
- Recommended correction: Replace with roundtable_alignment_packet_dynamic_v1 and add refresh-on-material-change instruction.
- Severity: blocker
- Patch required: yes

### File: docs/albion/agents/Gawain-agent.onboarding.packet.v1.json
- Exact stale phrase: "roundtable_knight_profile_v1 draft"
- Location: line 48
- Why it conflicts: Agent allowed outputs list references deprecated static packet naming.
- Recommended correction: Replace with "roundtable_knight_profile_dynamic_v1 draft".
- Severity: cleanup
- Patch required: yes

- Exact stale phrase: "roundtable_alignment_packet_v1 draft"
- Location: line 49
- Why it conflicts: Agent allowed outputs list references deprecated static alignment packet naming.
- Recommended correction: Replace with "roundtable_alignment_packet_dynamic_v1 draft".
- Severity: cleanup
- Patch required: yes

### File: docs/albion/KINGDOM_REGISTRY_V0.md
- Exact stale phrase: "- Merlin" in Active Kingdoms list
- Location: line 23
- Why it conflicts: Current doctrine says Merlin is the OR / Operational Router inside Albion, while this entry implies Merlin is a Kingdom entity inside the registry.
- Recommended correction: Clarify Merlin as the Operational Router, not a Kingdom, and remove Kingdom listing unless explicitly modeled as a special exception with clear boundary law.
- Severity: blocker
- Patch required: yes

### File: docs/albion/ROUNDTABLE_KNIGHT_DYNAMIC_PROFILE.md
- Exact phrase checked: final profile
- Location: line 4
- Why it conflicts: Does not conflict; phrase appears in the statement "not the final profile" which is aligned with dynamic doctrine.
- Recommended correction: None.
- Severity: harmless historical reference
- Patch required: no

## 3. Terms With No Matches
No matches found for:
- static profile
- AI Council approval
- High Court approval required
- 3/3 High Court approval
- Merlin inside Albion
- Merlin Kingdom (exact phrase)
- Jeff
- Sovereign Triumvirate
- Trader's Corner
- Trader’s Corner
- Albien

## 4. Summary
- Total actionable drift findings: 7
- Blocker findings: 5
- Cleanup findings: 2
- Harmless findings: 1

No doctrine files were modified during this audit. Only this audit report file was created.

## Follow-Up Patch
- Files patched:
	- docs/albion/ALBION_CONTROL_BIBLE.md
	- docs/albion/FOUNDER_ONBOARDING.md
	- docs/albion/agents/Gawain-agent.onboarding.packet.v1.json
	- docs/albion/KINGDOM_REGISTRY_V0.md
- Exact drift resolved:
	- Replaced roundtable_knight_profile_v1 with roundtable_knight_profile_dynamic_v1 in active doctrine references.
	- Replaced roundtable_alignment_packet_v1 with roundtable_alignment_packet_dynamic_v1 in active doctrine references.
	- Removed Merlin from Kingdom Registry active Kingdom list and added explicit Merlin OR rules.
	- Added dynamic lifecycle language in founder onboarding: starting profile only, update triggers, sourceRunId/sourceDecisionId, and alignment refresh after material changes.
- Validation grep results:
	- roundtable_knight_profile_v1: no matches in active doctrine docs under docs/albion (except harmless historical/deprecated contexts if present).
	- roundtable_alignment_packet_v1: no matches in active doctrine docs under docs/albion (except harmless historical/deprecated contexts if present).
	- Merlin Kingdom: no matches.
	- Merlin inside Albion: no matches.
	- Jeff: no matches.
	- Sovereign Triumvirate: no matches.
	- Trader's Corner / Trader’s Corner: no matches.
	- Albien: no matches.
- Remaining harmless historical references if any:
	- None identified in current active doctrine files.

## Superseding Merlin OR Correction
Thomas clarified after this audit that Merlin is not separate from Albion in the old boundary wording. Albion is the full Kingdom operating system. Merlin is the OR / Operational Router inside Albion.

Correct model:
- Albion = full Kingdom operating system.
- Merlin = OR / Operational Router.
- Squires = gather information.
- AI Council = organizes, challenges, and prepares routes.
- Knights = approve or deny.
- Merlin = executes approved routes only.

Do not describe Albion as the OR. Merlin is the OR.
