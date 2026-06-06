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

### File: docs/albion/agents/gwaine-agent.onboarding.packet.v1.json
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
- Why it conflicts: Current doctrine says Merlin is separate and user-facing, while this entry implies Merlin is a Kingdom entity inside the registry.
- Recommended correction: Clarify Merlin as external user-facing layer and remove Kingdom listing unless explicitly modeled as a special exception with clear boundary law.
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
