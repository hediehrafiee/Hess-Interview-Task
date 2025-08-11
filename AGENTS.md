# Event Management

> **Purpose:** This document tells an AI collaborator (and human reviewers) **what to do, how to do it, and when it’s done** for the Event Management feature. It encodes architecture, constraints, contracts, workflows, and guardrails so your agent can reliably ship, fix, and refactor code in a senior-quality way.

---

## 1) Mission & Scope

**Mission:** Build and maintain the _Event Management_ feature (list, create, update, delete) using Angular **standalone components**, **signals**, and a **Thin Component / Fat Service** architecture with unidirectional data flow. UI uses **ng-zorro-antd**.

**Primary outcomes**

- Users can browse events, filter/search/sort them, and perform CRUD.
- Create/Update returns to the list reliably, and the list reflects the latest state.
- In dev, mock data is handled locally (single source of truth = localStorage). In prod, real API.

**Out of scope (for now):** real uploads, real auth flows, server pagination, advanced RBAC.

---

## 2) Architecture Summary

**Pattern:** Standalone components + signals + services.

- **UI Layer (Components):** Only render & dispatch user intents. Use `ChangeDetectionStrategy.OnPush`.
- **State Layer (**``**):** Holds feature state via signals, exposes selectors and actions, and orchestrates CRUD through a data service.
- **Data Layer (**`** or **`**):** Pure CRUD. Switchable via DI/env. In dev, seeds from `mockDataUrl` once and then uses **localStorage** as the single source of truth. In prod, uses HTTP.
- **Form Layer (**``**):** Encapsulates reactive form creation, validation, patching, and payload mapping.

**Unidirectional flow**

```
User → Component (intent) → StateService (action) → DataService (CRUD) → State signals → Component re-renders
```

**Routes**

- List: `/p/events`
- Create: `/p/events/new`
- Edit: `/p/events/:id/edit`

---

## 3) Data Contracts

### 3.1 Models

- **EventModel**

  - `id: string`
  - `title: string` (≥ 3 chars)
  - `description?: string`
  - `startDateTime: string` (ISO)
  - `endDateTime?: string` (ISO; TODO: separate end)
  - `timezone: string` (IANA id)
  - `venueId: string`
  - `primaryImageUrl?: string`
  - `coverImageUrl?: string`
  - `isPublic: boolean`
  - `organizerId?: string`

- **CreateEventModel / UpdateEventModel**: Subsets of `EventModel` that the form maps to. For now `endDateTime` mirrors `startDateTime`.

- **EventQueryModel**: Optional map of field → exact-value for filtering in data service.

**Invariants**

- `title.trim().length >= 3`
- `venueId.trim().length >= 2`
- `startDateTime` must be valid ISO; if `endDateTime` exists, it’s ≥ `startDateTime`.

### 3.2 LocalStorage Schema (dev mode)

- Key: `${environment.localStorageKey}:events`
- **Value:** _Array_
- Migration guard: If legacy shape `{ events: [...] }` is found, normalize to array and rewrite.

---

## 4) Environment & Configuration

- `environment.apiUrl` — production base URL for events API.
- `environment.mockDataUrl` — dev-only JSON endpoint used **once** to seed localStorage if empty.
- `environment.localStorageKey` — namespace prefix for LS keys.

**Dev mode behavior**

1. On first `findAll`, if localStorage is empty and `mockDataUrl` is set → fetch `{events: [...]}`, write **only** the array into LS, and from then on read/write **exclusively** from LS.
2. `create`, `update`, `remove` mutate the LS array.
3. List reflects the latest state even after navigation or refresh.

---

## 5) Services — Responsibilities & Contracts

### 5.1 `EventMockService` (dev data layer)

- `create(data) → Observable<EventModel>`: generate `id` via `crypto.randomUUID()` fallback to timestamp, set `organizerId`, push to LS, return new event.
- `findAll(query?) → Observable<EventModel[]>`: if LS has data, return filtered LS; otherwise seed from `mockDataUrl` and persist.
- `findOne(id) → Observable<EventModel | undefined>`: LS first, then fallback to `mockDataUrl` lookup.
- `update(id, data) → Observable<EventModel>`: merge, replace in LS by index, return updated.
- `remove(id) → Observable<void>`: filter from LS and persist.
- **Must** normalize LS shape on read.

### 5.2 `EventStateService` (feature state)

Signals:

- `state = { data: EventModel[], loading: boolean, error: string|null }`
- `eventDetail: EventModel | null`
- Filters: `searchTerm`, `visibility (All/Public/Private)`, `sortDirection (Asc/Desc)`

Selectors:

- `events`, `loading`, `error`
- `filtered`: scope to active org (if available), apply privacy filter, text search on `title`, sort by `startDateTime` asc/desc.

Actions:

- `load()` — fetch all; uses `finalize` to clear loading and `catchError` to set `error`.
- `loadOne(id)` — set `eventDetail` (LS or mock fallback).
- `create(data)` — optimistic append on success.
- `update(id, data)` — optimistic in-place merge on success.
- `remove(id)` — optimistic removal on success.
- `submitEvent(data, mode, eventId?)` — unified create/update with notifications.
- Filter controls: `toggleSortDirection`, `resetFilters` and direct setters on signals.

**Navigation contract:** Components call `router.navigate(['/p/events'])` after success to avoid relative path quirks.

### 5.3 `EventFormService` (form logic)

- `form: FormGroup` with validators for `title`, `venueId`, `startDateTime`, `timezone`.
- `patchForm(event: EventModel)` — map model → form.
- `toPayload(): CreateEventModel | UpdateEventModel` — trims strings, maps dates to ISO, mirrors `endDateTime=startDateTime` for now.
- `markAllAsTouched()` — to surface all errors on submit.
- `timeZones`: `["UTC", ...Intl.supportedValuesOf('timeZone')]` fallback to `UTC`.

---

## 6) Components — Responsibilities

### 6.1 List (`EventListComponent`)

- **OnInit:** `eventStates.load()`.
- Binds to `filtered()`; shows loading/empty states.
- Search input binds to `eventStates.searchTerm.set(...)`.
- Privacy `nz-select` binds to `eventStates.visibility.set(...)`.
- Sort header toggles `eventStates.toggleSortDirection()` and shows icon for current sort.
- Actions: `edit(id)` → `/p/events/:id/edit`; `create()` → `/p/events/new`; `remove(id)` → `eventStates.remove(id)`.

### 6.2 Form (`EventFormComponent`)

- Injects `EventFormService` and `EventStateService`.
- **OnInit:** if route has `id`, call `eventState.loadOne(id)`; else clear `eventDetail` and set mode to create.
- When `eventDetail` changes (signal `effect`), patch the form and create initial image file previews if URLs exist.
- **Submit:** if invalid → `markAllAsTouched()` + message; else call `eventState.submitEvent(...)` and on success navigate to `/p/events`.
- Image uploads are simulated client-side: accept image/\*, push data URL into form control. On remove, **clear the form control value** as well as the list.

---

## 7) UX / i18n / a11y

- All labels/messages should pass through a translate pipe or be easily translatable.
- Form controls use `nz-form-label` + `nz-form-control` for proper ARIA linkage.
- Buttons have clear `aria-label`s for icon-only actions.
- Validation errors are concise and actionable.
- Empty states provide a CTA (Create your first event).

---

## 8) Performance

- `OnPush` everywhere; use signals for fine-grained updates.
- Use `trackBy` in `*ngFor` (tracking by `event.id`).
- Defer heavy work (e.g., large images) off the critical path.

---

## 9) Error Handling & Notifications

- User feedback via `NzMessageService` or `NzNotificationService`.
- Log errors with context (action, id, payload size) to console in dev.
- Services normalize dev storage errors (malformed LS).

---

## 10) Testing Strategy

**Unit**

- `EventMockService`: read/write LS, seeding from mock JSON, shape normalization, CRUD.
- `EventStateService`: loading flags, optimistic updates, error signals.
- `EventFormService`: validators, `patchForm`, `toPayload` date/trim rules.

**Component**

- List: search/filter/sort recompute, empty/loading states, actions emit.
- Form: validation errors, submit disabled until valid, navigation after success.

**E2E**

- Create → list shows new item.
- Edit → list reflects changes.
- Delete → item disappears.
- Refresh → data persists in dev (LS).

---

## 11) Definition of Done (DoD)

- ***

## 12) Prompts & Playbooks for the Agent

**Refactor Playbook**

- Identify logic in components → move to `EventStateService` or `EventFormService`.
- Ensure unidirectional data flow; avoid circular dependencies.
- Keep public method contracts stable; update unit tests.

**Bugfix Playbook**

- Reproduce via route + action steps.
- Inspect signals: `loading`, `error`, `state.data.length`.
- Check LS key shape; if object with `{events: [...]}`, normalize.
- Add `take(1)` on single-shot streams if finalize not firing.

**Feature Playbook** (e.g., add End Date)

- Extend form + validators + `toPayload`.
- Adjust `EventModel`/DTOs.
- Update list column(s) + sorting logic for end date if needed.
- Write unit tests for new validation.

**API Migration Playbook**

- Implement HTTP methods in `EventService` behind env flag.
- Add interceptors for auth + error mapping.
- Toggle DI provider to real service in prod.
- Keep mock path for dev/testing.

**Testing Playbook**

- For any change in state logic, snapshot tests for `filtered()` with different filters.
- For form changes, specs for each validator and `toPayload()` output.

---

## 13) Commit Convention & Branching

- Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`, `test:`, `docs:`
- Example messages:
  - `fix(events): seed once from mock and read from localStorage`
  - `feat(event-form): add endDate and cross-field validation`
  - `refactor(state): extract unified submitEvent action`

---

## 14) Security & Compliance

- Sanitize any future rich text (description) before rendering.
- Enforce client-side file type/size checks for images; server validation in prod.
- Respect cookie domain/samesite policy in auth code (future).

---

## 15) Known Limitations / TODO (Extended)

1. **Mock Only**: Needs real API with pagination, filters, uploads.
2. **Uploads**: Replace data-URLs with storage service (S3/GCS) + pre-signed URLs.
3. **Dates**: Add explicit `endDateTime` and enforce `end ≥ start`.
4. **Org Scoping**: Strengthen server-side org filters once real API exists.
5. **Observability**: Add Sentry/OTEL for prod.

---

## 16) Troubleshooting

- **Stuck on submit / not navigating**: Ensure `subscribe` completes (use `take(1)` in component if needed) and use **absolute** navigation `this.router.navigate(['/p/events'])`.
- ``: LocalStorage contains an object instead of an array. `readStorage()`must normalize legacy`{ events: [...] }` and rewrite an array.
- **New data disappears after returning to list**: Seeding from mock is overwriting LS—ensure seeding happens **only once** when empty, then always read/write LS.
- **Images removed but still saved**: Ensure `(nzRemove)` clears the corresponding form control value.

---

## 17) How to Run Locally

1. Set `environment.mockDataUrl` to a reachable JSON with `{ "events": [...] }` **or** leave it empty and start with an empty list.
2. Set `environment.localStorageKey` (e.g., `app`).
3. Run app: `npm run start`.
4. Navigate to `/p/events`.

Optional: Clear LS via DevTools → Application → Local Storage to re-seed from mock.

---

## 18) Acceptance Criteria (Sample)

- Creating an event with title `"Conf 2025"` and valid fields adds it to the list and navigates to `/p/events` within 1s.
- Editing `"Conf 2025"` title to `"Conf 2025 Rev"` updates the row immediately.
- Deleting the event removes it from the table without refresh.
- Refreshing the browser preserves the list in dev mode.

---

_End of AGENT.md_
