---
name: SKILL_DATA_ARCH_DAD
description: >
  Produces a Data Architecture Document (DAD) for Telegram Mini App projects.
  Covers: local storage technology selection (IndexedDB/Dexie.js), full data model
  with entity relationships, sync strategy (optimistic UI + background sync),
  conflict resolution, caching TTL, Repository layer design, and migration planning.
  Use this skill whenever a project needs a data layer design — triggered by any mention of:
  "data layer", "local storage", "offline", "sync", "caching strategy", "IndexedDB",
  "DAD", "Data Architecture", "data model", "SyncQueue", or "Repository pattern".
  Also triggered when an implemented screen has no documented persistence strategy.
---

# SKILL_DATA_ARCH_DAD — Data Architecture Document Generator

## Purpose

This skill transforms existing tech-stack, ADR, BRD, and implemented-screen documents into a complete **Data Architecture Document (DAD)** — the single source of truth for how the Telegram Mini App stores, synchronizes, and caches data client-side.

The DAD bridges the gap between **what data the UI needs** (from tech-stack) and **how that data lives on the device** (IndexedDB, SyncQueue, Repository). It is a design document, not code. It enables the implementer to build the data layer without making architecture decisions.

---

## Prerequisites

Before executing, **read all of the following** (use `view_file` tool):

| Source | What to extract |
|--------|----------------|
| `ba/BRD` | Business entities, user actions, offline requirements |
| `adr/ADR_SCREEN_*.md` | Existing storage/caching decisions already made |
| `tech-stack/TECH_STACK_SCREEN_*.md` | TypeScript interfaces, entity shapes, service patterns |
| `implemented/IMPLEMENTED_SCREEN_*.md` | What is already built — avoid redesigning existing patterns |
| `dad-example` (project root) | Reference DAD format and style |

---

## Output

Single file: `dad/DAD_[SCOPE].md`

Where `[SCOPE]` is either a specific screen name (e.g., `My_Tasks`) or a cross-cutting scope (e.g., `Global_Data_Layer`).

---

## Execution Workflow

### Step 0 — MANDATORY: Read All Prerequisites First

**Do not generate any content until all input files are read.** Use `view_file` for each:

```
1. view_file: ba/BRD (or list_dir ba/ + read each file)
2. view_file: adr/ADR_SCREEN_*.md  (read ALL ADR files)
3. view_file: tech-stack/TECH_STACK_SCREEN_*.md  (read ALL tech-stack files)
4. view_file: implemented/IMPLEMENTED_SCREEN_*.md  (read ALL implemented screens)
5. view_file: dad-example  (project root — tone and format reference)
```

Record for each tech-stack file:
- What TypeScript interfaces / types are defined
- What service pattern is used (mock vs real API)
- What state management is in use (Zustand, React Query)

If a file is missing → note as [NON-BLOCKING] in §15 Open Questions. Do NOT stop.

---

### Step 1 — Inventory Existing Data Contracts

Read all tech-stack files. For every entity found (TypeScript interface or type), record:
- Entity name
- Fields + types
- Where it comes from (which screen service)
- Whether it has a "synced" or "local" marker already

### Step 2 — Technology Selection

Evaluate storage options using this decision matrix:

| Option | Async | Structured | Volume | Transactions | TMA Safe |
|--------|-------|-----------|--------|--------------|---------|
| `localStorage` | ❌ Sync | ❌ String only | ❌ ~5MB | ❌ None | ✅ Yes |
| `IndexedDB (raw)` | ✅ Yes | ✅ Yes | ✅ 50MB+ | ✅ Yes | ✅ Yes |
| `Dexie.js` (IndexedDB wrapper) | ✅ Yes | ✅ Yes | ✅ 50MB+ | ✅ Yes | ✅ Yes |
| `idb` (IndexedDB wrapper) | ✅ Yes | ✅ Yes | ✅ 50MB+ | ✅ Yes | ✅ Yes |
| In-memory (Zustand only) | ✅ Yes | ✅ Yes | ✅ Unlimited | ❌ None | ✅ Yes |

**Default ruling for Telegram Mini App:**
- Use **Dexie.js** (IndexedDB) if the app has: offline requirements, SyncQueue, or more than 2 entity types.
- Use **localStorage** ONLY for simple key-value flags (e.g., `onboarding_completed`).
- Use **in-memory (Zustand)** ONLY for pure UI state with no persistence requirement.

### Step 3 — Data Model Design

For every entity from Step 1, define the DAD entity block:

```
EntityName {
  id: string              // UUID — generated client-side
  field1: type            // from TECH_STACK_SCREEN_*.md — §TypeScript Interfaces
  field2: type
  updatedAt: number       // Unix timestamp (ms) — conflict resolution key
  isSynced: boolean       // false = pending sync
  _localVersion: number   // increment on each local mutation
}
```

**Required system entities:**

```
SyncQueue {
  id: string
  entityType: 'task' | 'timeLog' | ...   // union of all mutable entities
  action: 'create' | 'update' | 'delete'
  payload: Record<string, unknown>
  retryCount: number       // starts at 0, max 5
  createdAt: number        // Unix timestamp (ms)
  lastAttemptAt: number | null
  error: string | null
}

CacheMetadata {
  key: string              // e.g., 'tasks_list', 'user_profile'
  fetchedAt: number        // Unix timestamp (ms)
  ttl: number              // milliseconds
}
```

### Step 4 — Sync Strategy Design

Define for EVERY user action that mutates data:

```
Action: [user action description]
  Write path:
    1. Validate input client-side
    2. Write to Local DB (entity table)
    3. Push entry to SyncQueue (action: 'create' | 'update' | 'delete')
    4. Trigger UI update immediately (optimistic)
    5. SyncService flushes queue (background, on: app focus + network online)
  
  On sync success:
    - Mark entity.isSynced = true
    - Remove from SyncQueue
    - Update CacheMetadata.fetchedAt
  
  On sync failure:
    - Increment SyncQueue.retryCount
    - Apply exponential backoff: 2^retryCount * 1000ms (max: 32s)
    - At retryCount === 5: mark as DEAD_LETTER, log error, notify user
```

**Conflict Resolution Policy** — pick ONE:
- `last-write-wins`: compare `updatedAt`, higher timestamp wins. Simple, good for MVP.
- `server-priority`: server response always overwrites local. Safe for critical financial data.
- `merge-fields`: field-level merging. Complex — only if explicitly required by BRD.

### Step 5 — Caching Strategy

For each entity:

```
Entity: [EntityName]
  TTL: [N] * 60 * 1000  ms  // define in code as a constant, not inline
  Cache key: '[entity_plural]_[qualifier]'   // e.g., 'tasks_list', 'tasks_detail_[id]'
  Invalidation triggers:
    - On mutation (create/update/delete) of same entity type
    - On TTL expiry (staleness check in Repository.get())
    - On explicit user refresh (pull-to-refresh or reload action)
  Read strategy:
    - Check CacheMetadata.fetchedAt + ttl → if fresh, return local DB data
    - If stale or missing → fetch from API → write to local DB → update CacheMetadata
```

### Step 6 — Repository Layer Architecture

Define the Repository interface that EVERY screen service must use:

```typescript
// This interface goes in dad/DAD_*.md — not implemented here, just defined
interface [Entity]Repository {
  getAll(filter?: Partial<[Entity]>): Promise<[Entity][]>
  getById(id: string): Promise<[Entity] | null>
  save(entity: [Entity]): Promise<void>           // creates or updates
  delete(id: string): Promise<void>
  getPendingSync(): Promise<SyncQueueItem[]>
  markSynced(id: string): Promise<void>
}
```

Data Layer diagram (MUST appear in DAD):
```
UI Components
    ↓
Hooks / React Query
    ↓
Repository (interface — no storage dependency)
    ↓
Local DB Adapter (Dexie.js)        ← reads/writes IndexedDB
    ↓
Sync Service (background)          ← flushes SyncQueue
    ↓
API Client (fetch + auth headers)
    ↓
Backend REST API
```

### Step 7 — Edge Cases

Document all of the following (mandatory):

| Edge Case | Behavior |
|-----------|---------|
| **First launch** | DB is empty — skip local read, fetch from API, populate DB, set CacheMetadata |
| **DB corruption** | Catch Dexie open error → wipe DB (`Dexie.delete(dbName)`) → re-initialize → notify user |
| **App upgrade / schema change** | Dexie version upgrade — run migration in `db.version(N).upgrade()` callback |
| **Offline at first launch** | Show empty state with "No connection" banner — do NOT crash |
| **SyncQueue DEAD_LETTER** | Show persistent toast with retry button — do not silently discard |
| **Token expiry during sync** | Abort sync queue, redirect to re-auth, resume queue after login |
| **Duplicate sync (race condition)** | SyncService acquires a lock (`navigator.locks.request`) before flush |

### Step 8 — Security Checklist

```
❌ NEVER store in local DB:
  - JWT access tokens (keep in memory only)
  - Refresh tokens (use Telegram.WebApp.initData for re-auth)
  - Payment card numbers, CVV
  - Raw password hashes

✅ Safe to store locally:
  - Task data, time logs, orders
  - User display name, avatar URL
  - App settings, preferences
  - SyncQueue payloads (must not contain raw credentials)
```

### Step 9 — MANDATORY: Run Validation Before Saving

Before writing the output file, run the validation script:

```bash
bash .agents/skills/SKILL_DATA_ARCH_DAD/scripts/validate_dad.sh dad/DAD_[SCOPE].md
```

- If `ERRORS > 0` → fix before saving.
- If `WARNINGS > 0` → note in §16 Developer Notes and explain why it was intentionally omitted.
- Only save the DAD file when the script exits with **0 errors**.

Also manually verify: **no placeholder text** (`[EntityName]`, `[Question text]`, `[YYYY-MM-DD]`, etc.) remains in the final document.

---

## DAD Document Structure (Required Sections)

See the full template at: `.agents/skills/SKILL_DATA_ARCH_DAD/references/dad_template.md`

| Section | Key deliverable |
|---------|----------------|
| `## 1. Overview` | Scope, goal, out-of-scope |
| `## 2. Constraints & Context` | TMA platform limits |
| `## 3. Technology Decision` | Selected tech + rejection table |
| `## 4. Data Model` | All entities with fields + types |
| `## 5. Storage Structure` | DB name, tables, indexes |
| `## 6. Data Flow` | Per-action write path |
| `## 7. Sync Strategy` | Optimistic UI + conflict policy + retry |
| `## 8. Caching Strategy` | TTL per entity + invalidation |
| `## 9. Data Layer Architecture` | Layered diagram |
| `## 10. Offline Behavior` | No-network user experience |
| `## 11. Migrations` | Version strategy |
| `## 12. Error Handling` | **Runtime** errors: DB crash, 4xx/5xx, quota exceeded |
| `## 13. Security` | What NOT to store |
| `## 14. Edge Cases` | **Lifecycle** scenarios: first launch, upgrade, clear |
| `## 15. Open Questions` | [BLOCKING] / [NON-BLOCKING] |
| `## 16. Developer Notes` | BLOCKING fallbacks + implementer hints |

---

## Constraints & Rules

- **Client-side ONLY**: This skill does not design backend schema.
- **No invented types**: All entity fields must trace back to existing TypeScript interfaces in `tech-stack/`.
- **No "TBD" conflict resolution**: Sync strategy must state a concrete policy.
- **No vague TTLs**: Always write TTL as `N * 60 * 1000` (milliseconds constant), never "a few minutes".
- **Repository is an interface, not an implementation**: DAD defines the contract; implementation is the executor's job.
- **Reference the dad-example**: Use the project root `dad-example` file as the structural and tonal reference.

---

## Quality Checklist (run before saving output)

- [ ] Step 0 completed — all prerequisite files were read before generation
- [ ] Technology decision has a rejection table with ≥ 2 alternatives
- [ ] Every entity has `updatedAt`, `isSynced`, `id`, `_localVersion` fields
- [ ] SyncQueue entity is defined with `retryCount`, `action`, `lastAttemptAt`, `error` fields
- [ ] CacheMetadata entity is defined with `key`, `fetchedAt`, `ttl` fields
- [ ] Every user-mutating action has a documented write path in §6
- [ ] Conflict resolution policy is stated and justified (not "depends")
- [ ] Every cached entity has a TTL in milliseconds (N * 60 * 1000 format)
- [ ] Data Layer Architecture diagram is present (layered, not flat)
- [ ] §12 Error Handling covers RUNTIME errors only (not lifecycle scenarios)
- [ ] §14 Edge Cases covers LIFECYCLE scenarios only (not runtime errors)
- [ ] All 7 edge cases from Step 7 are documented
- [ ] Security section lists what is NOT stored
- [ ] All Open Questions are tagged [BLOCKING] or [NON-BLOCKING]
- [ ] §16 Developer Notes has fallback assumption for every [BLOCKING] question
- [ ] validate_dad.sh exits with 0 errors
- [ ] No placeholder text remains (`[EntityName]`, `[YYYY-MM-DD]`, etc.)
- [ ] Output file path matches: `dad/DAD_[SCOPE].md`
- [ ] DB name is project-specific (not left as `[app_name]_db` placeholder)
