# 03 — MVP Wireframes

Low-fidelity, ASCII wireframes for the V1 screens. They define layout and the
key elements — visual polish is owned by the Tailwind implementation.

Global shell: a left sidebar (collapsible on mobile) + top bar with org switcher
and user menu.

```
┌────────────┬───────────────────────────────────────────────────────────┐
│  NIST      │  [Acme Health ▾]                         🔔   (DM) Dana ▾  │
│  COMPASS   ├───────────────────────────────────────────────────────────┤
│            │                                                           │
│ ▸ Dashboard│                  << page content >>                       │
│ ▸ Framework│                                                           │
│ ▸ Gaps     │                                                           │
│ ▸ Calendar │                                                           │
│ ▸ Evidence │                                                           │
│ ▸ Reports  │                                                           │
│            │                                                           │
│ ─────────  │                                                           │
│ ⚙ Settings │                                                           │
└────────────┴───────────────────────────────────────────────────────────┘
```

## 1. Dashboard

```
┌───────────────────────────────────────────────────────────────────────┐
│  Dashboard                                                              │
│                                                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐               │
│  │ OPEN     │ │ CLOSED   │ │ OVERDUE  │ │ DUE ≤ 30 DAYS │               │
│  │   18     │ │   42     │ │    5     │ │      9        │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘               │
│                                                                        │
│  Gaps by status                  Gaps by risk                          │
│  ┌──────────────────────────┐    ┌──────────────────────────┐          │
│  │ Not started   ▓▓▓▓ 6      │    │ Critical ▓ 2             │          │
│  │ In progress   ▓▓▓▓▓▓ 9    │    │ High     ▓▓▓ 7           │          │
│  │ Blocked       ▓▓ 3        │    │ Medium   ▓▓▓▓ 6          │          │
│  │ Complete      ▓▓▓▓▓▓▓ 42  │    │ Low      ▓▓ 3            │          │
│  └──────────────────────────┘    └──────────────────────────┘          │
│                                                                        │
│  Upcoming deadlines                          Overdue items             │
│  ┌──────────────────────────────────┐  ┌──────────────────────────┐    │
│  │ Q3 Access Review     Jul 01  Dana│  │ MFA rollout   −4d   Sam  │    │
│  │ Vendor Review: AWS   Jul 08  Sam │  │ Policy: AUP   −9d   Dana │    │
│  │ Patch attestation    Jul 15  Lee │  │ ...                      │    │
│  └──────────────────────────────────┘  └──────────────────────────┘    │
└───────────────────────────────────────────────────────────────────────┘
```

## 2. Framework Library (NIST CSF 2.0)

Browse Function → Category → Subcategory. "Create gap" deep-links a subcategory.

```
┌───────────────────────────────────────────────────────────────────────┐
│  NIST CSF 2.0 Framework                          [ search subcats... ] │
│                                                                        │
│  [ GOVERN ][ IDENTIFY ][ PROTECT ][ DETECT ][ RESPOND ][ RECOVER ]     │
│  ───────────────────────────────────────────────────────────────────  │
│  GOVERN (GV)                                                           │
│  Establish & monitor the cybersecurity risk management strategy...     │
│                                                                        │
│  ▾ GV.OC — Organizational Context                                      │
│      GV.OC-01  The mission is understood and informs ...   [+ Gap]     │
│      GV.OC-02  Internal/external stakeholders are ...      [+ Gap]     │
│      GV.OC-03  Legal, regulatory, contractual reqs ...     [+ Gap] ●   │
│  ▸ GV.RM — Risk Management Strategy                                    │
│  ▸ GV.RR — Roles, Responsibilities & Authorities                      │
│  ▸ GV.SC — Cybersecurity Supply Chain Risk Management                  │
│                                                                        │
│  ●  = a gap already exists for this subcategory                        │
└───────────────────────────────────────────────────────────────────────┘
```

## 3. Gap Register (list)

```
┌───────────────────────────────────────────────────────────────────────┐
│  Gaps                                                   [ + New Gap ]   │
│                                                                        │
│  Status: [All ▾]  Risk: [All ▾]  Owner: [All ▾]  [ search... ]         │
│  ───────────────────────────────────────────────────────────────────  │
│  TITLE                 NIST       RISK    STATUS       OWNER    DUE     │
│  ─────────────────────────────────────────────────────────────────    │
│  Enable MFA org-wide   PR.AA-03   High    In progress  Sam      Jul 12 │
│  Asset inventory       ID.AM-01   Med     Not started  Dana     Aug 01 │
│  Encrypt backups       PR.DS-01   High    Blocked      Lee   ⚠ Jun 10 │
│  IR plan documented    RS.MA-01   Crit    Complete     Dana     —      │
│  ...                                                                   │
│                                              ◀  1 2 3 ... 8  ▶          │
└───────────────────────────────────────────────────────────────────────┘
```

## 4. Gap Detail / Edit

```
┌───────────────────────────────────────────────────────────────────────┐
│  ‹ Gaps   Enable MFA org-wide                       [ Save ] [ ··· ]   │
│  ───────────────────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ Description                      │  │ DETAILS                     │  │
│  │ [ multiline...................] │  │ NIST   PR.AA-03  [change]   │  │
│  │                                 │  │ Status [In progress ▾]      │  │
│  │ Current state                   │  │ Risk   [High ▾]             │  │
│  │ [ ........................... ] │  │ Priority [High ▾]           │  │
│  │ Desired state                   │  │ Owner  [Sam ▾]              │  │
│  │ [ ........................... ] │  │ Due    [2026-07-12]         │  │
│  │ Notes                           │  │ Created by Dana · Jun 1     │  │
│  │ [ ........................... ] │  └─────────────────────────────┘  │
│  └─────────────────────────────────┘                                   │
│                                                                        │
│  Evidence (3)                                          [ + Upload ]    │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ 📄 mfa-policy.pdf        220 KB   Dana  Jun 3      [view] [del]   │  │
│  │ 🖼 okta-config.png       1.1 MB   Sam   Jun 5      [view] [del]   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Comments                                                              │
│  [ add a note................................................ ] [Post] │
└───────────────────────────────────────────────────────────────────────┘
```

## 5. Compliance Calendar

```
┌───────────────────────────────────────────────────────────────────────┐
│  Compliance Calendar                              [ + New Activity ]    │
│                                                                        │
│  View: [ List ▾ ]   Category: [All ▾]   [ ◀ June 2026 ▶ ]              │
│  ───────────────────────────────────────────────────────────────────  │
│  DUE        ACTIVITY                  CATEGORY        OWNER    STATUS   │
│  ─────────────────────────────────────────────────────────────────    │
│  Jun 30    Q2 User Access Review     Access review   Dana    ◷ Pending │
│  Jun 30    Quarterly Controls Check  Controls        Lee     ◷ Pending │
│  Jul 01    Monthly Termination Rev   Termination     Sam     ◷ Pending │
│  Jul 15    Vendor Review: AWS        Vendor          Sam     ✓ Done    │
│  ...                                                                   │
│                                                                        │
│  Each activity defines a frequency (monthly/quarterly/annual); the     │
│  system generates dated occurrences you check off.                     │
└───────────────────────────────────────────────────────────────────────┘
```

## 6. Evidence Repository

Cross-gap view of every uploaded artifact (the gap detail page shows the
per-gap subset).

```
┌───────────────────────────────────────────────────────────────────────┐
│  Evidence                                          [ search files... ] │
│  ───────────────────────────────────────────────────────────────────  │
│  FILE                  GAP                 TYPE   SIZE   BY     DATE     │
│  ─────────────────────────────────────────────────────────────────    │
│  📄 mfa-policy.pdf      Enable MFA org-wide PDF    220KB Dana   Jun 3   │
│  🖼 okta-config.png     Enable MFA org-wide PNG    1.1MB Sam    Jun 5   │
│  📄 backup-runbook.pdf  Encrypt backups     PDF    98KB  Lee    Jun 7   │
│  ...                                                                   │
└───────────────────────────────────────────────────────────────────────┘
```

## 7. Reports

```
┌───────────────────────────────────────────────────────────────────────┐
│  Reports                                                               │
│                                                                        │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐    │
│  │ Open Gap Report   │ │ Overdue Items     │ │ Executive Summary │    │
│  │ All open gaps with│ │ Everything past   │ │ One-page posture  │    │
│  │ owner, risk, due  │ │ its due date      │ │ overview for execs│    │
│  │ [View] [Export ▾] │ │ [View] [Export ▾] │ │ [View] [Export ▾] │    │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘    │
│                                                                        │
│  Export ▾ = CSV (V1) · PDF (V1.1)                                      │
└───────────────────────────────────────────────────────────────────────┘
```

## 8. Auth screens

```
┌────────────────────────┐      ┌────────────────────────┐
│   NIST COMPASS          │      │   Create your account  │
│   Sign in               │      │   Full name [........] │
│   Email    [.........]  │      │   Org name  [........] │
│   Password [.........]  │      │   Email     [........] │
│   [ Sign in ]           │      │   Password  [........] │
│   — or —                │      │   [ Create account ]   │
│   [ Email magic link ]  │      │                        │
│   New here? Sign up →   │      │   Have an account? →   │
└────────────────────────┘      └────────────────────────┘
```
