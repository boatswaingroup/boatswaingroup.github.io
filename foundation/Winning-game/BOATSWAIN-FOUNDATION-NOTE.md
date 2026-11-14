# Imported foundation snapshot

Complete snapshot of the authorized demtaiwo1-eng/Winning-game- source repository.
The original upstream repository is untouched. This is a technical reference foundation,
not the Boatswain product UI. Review dependencies, licences/notices, secrets, workflows,
security posture and deployment assumptions before adapting or executing any component.

## Upstream synchronization
- Upstream repository: https://github.com/demtaiwo1-eng/Winning-game-
- Upstream branch: `main`
- Verified upstream commit: `0fd60f19df75061de5a874fc0daaefab85616c32`
- Upstream commit date: 2026-11-13
- The imported `foundation/Winning-game/` tree was compared file-by-file against that upstream commit: 3,864 source-tree entries matched; no source files were missing or modified. The only destination-only file is this Boatswain foundation note.
- Recent upstream capabilities present in the foundation include the central DEMO/TEST/LIVE payment-mode controls, OPay payment/payout changes, and EPHINTA Guide/scale-QA work.
- Adaptation rule: integrate only domain-relevant components into Boatswain. EPHINTA event-planning screens and event-specific workflows are reference material, not Boatswain product requirements. Payment code must be adapted to the property reservation ledger and independently tested before any live-money use.
- Upstream repository remains unchanged; this destination repository maintains the imported snapshot.
