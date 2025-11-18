# METR Feature Specification Template

> Use this template when designing new features or major changes in METR. Keep specs in `docs/features/` or attach them to issues/PRs.

## 1. Summary

- **Feature name**:  
- **Owner(s)**:  
- **Status**: Draft / In review / Accepted / Implemented

Short, 2–3 sentence description of the feature and why it matters.

---

## 2. Problem / Opportunity

- What problem does this solve? For whom?  
- Why is the current behaviour insufficient?  
- How does this align with METR principles (AI‑First, Privacy‑First, Web3‑Ready, etc.)?

---

## 3. Goals & Non‑Goals

### 3.1 Goals

- [ ] G1 —
- [ ] G2 —

### 3.2 Non‑Goals

- NG1 — (explicitly out of scope)  
- NG2 —

---

## 4. User Stories & UX

### 4.1 User stories

- As a **[role]**, I want **[action]**, so that **[benefit]**.
- ...

### 4.2 UX flows

- Describe main flows (login → navigate → use feature → exit).
- Mention any new screens, components, or patterns.

### 4.3 UI/UX details

- Wireframes or references (Figma, screenshots).  
- How it interacts with existing METR UI (AdaptiveUI, MicroInteractions, etc.).

---

## 5. Architecture & Modules

- Which modules are involved? (e.g., `app/ai`, `app/ui`, `app/web3`, `app/computing`, `contracts`).
- New files or major changes:
  - `app/.../NewModule.ts`
  - `contracts/NewContract.sol`
- Event flows (who emits, who listens).

If helpful, include a simple diagram.

---

## 6. Data Model & APIs

- New or changed data structures (TypeScript interfaces, DB tables, contract structs).
- New API endpoints or changes to existing ones.
- Any migration concerns (backwards compatibility, rollout, fallback).

---

## 7. Security, Privacy & Compliance

- How does this impact security?  
- How are sensitive data and PII handled?  
- Any implications for **Emotional Blockchain**, **Blockchain Audit Trail** or access control?

---

## 8. Web3 / Tokenomics (if applicable)

- Does this feature mint, transfer or burn tokens or NFTs?
- Does it add DAO proposals or voting flows?
- How does it interact with existing contracts in `contracts/`?

---

## 9. Performance & Edge

- Expected load and performance characteristics.
- How does it behave offline or with poor connectivity?
- Can Edge Computing or Offline AI be leveraged?

---

## 10. Rollout & Metrics

- Rollout strategy: flag, beta cohort, per‑workspace enablement.  
- Key metrics to track (adoption, impact on productivity, error rates).
- Success criteria (how we know it worked).

---

## 11. Open Questions

- Q1 —
- Q2 —

List questions that must be resolved before implementation or GA.
