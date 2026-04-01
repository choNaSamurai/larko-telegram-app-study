---
description: Local DB setup and sync — design data layer with Data_Architect_TMA, then implement with TMA_Implementer
---

# /local-db Workflow

## Trigger

```
/local-db
```

Запусти цей workflow для проєктування та реалізації data layer в Telegram Mini App.
Workflow автоматично визначає контекст: **перший запуск** (DAD ще відсутній) або **оновлення** (DAD вже існує, перевіряємо зміни).

---

## Виявлення контексту (ОБОВ'ЯЗКОВИЙ перший крок)

Перед запуском будь-якого агента — визначи контекст:

```
Перевір: чи існує хоча б один файл dad/DAD_*.md ?

├── НІ  → виконай Маршрут A (Перший запуск)
└── ТАК → виконай Маршрут Б (Оновлення)
```

Як перевірити: спробуй `list_dir dad/`. Якщо директорія не існує або порожня → Маршрут A.

---

## 🅐 Маршрут A — Перший запуск (DAD не існує)

> Виконується коли `dad/` порожня або відсутня.

### Крок A1 — Data Architect TMA (проєктування з нуля)

**Роль:** `.agents/roles/data_architect_tma.yaml`

**Завдання:** Прочитай роль Data_Architect_TMA та спроєктуй повний data layer для проєкту.

**Scope DAD:** `Global_Data_Layer` (охоплює всі реалізовані екрани)

**Контекст агента:**

| Ресурс | Шлях | Що взяти |
|--------|------|----------|
| BRD | `ba/` | Бізнес-сутності, офлайн-вимоги, user actions |
| ADR | `adr/ADR_SCREEN_*.md` | Існуючі рішення щодо стану і даних |
| Tech Stack | `tech-stack/TECH_STACK_SCREEN_*.md` | TypeScript interfaces, service patterns |
| Implemented screens | `implemented/IMPLEMENTED_SCREEN_*.md` | Що вже побудовано — уникнути переробки |
| DAD reference | `dad-example` (корінь проєкту) | Тон і структура документа |

**Що зробити (Step 0 → Step 9 з ролі):**

1. **Step 0 — MANDATORY:** Прочитай всі вхідні файли через `view_file` перед генерацією будь-якого контенту
2. Проінвентаризуй всі TypeScript entities зі всіх `tech-stack/` файлів
3. Обери технологію зберігання (Dexie.js / localStorage / in-memory) з таблицею відхилень
4. Спроєктуй Data Model — всі entities + SyncQueue + CacheMetadata
5. Визнач Sync Strategy — write path для кожної мутуючої дії
6. Визнач Caching Strategy — TTL (у форматі `N * 60 * 1000`) на кожну сутність
7. Нарисуй Data Layer Architecture diagram (UI → Hooks → Repository → LocalDB → SyncService → API)
8. Задокументуй Edge Cases та Security
9. **Step 9 — MANDATORY:** Запусти `bash .agents/skills/SKILL_DATA_ARCH_DAD/scripts/validate_dad.sh dad/DAD_Global_Data_Layer.md`
   - Виправ всі помилки перед збереженням
   - 0 errors → зберегти файл

**Вихідний артефакт:**

```
dad/DAD_Global_Data_Layer.md
```

**Критерії передачі (всі мають бути виконані):**
- [ ] Всі 16 секцій присутні і заповнені (без placeholder-тексту)
- [ ] `validate_dad.sh` — 0 errors
- [ ] Conflict resolution policy визначена (не "TBD")
- [ ] Кожна entity має `id`, `updatedAt`, `isSynced`, `_localVersion`
- [ ] SyncQueue і CacheMetadata визначені
- [ ] Всі `[BLOCKING]` питання мають fallback в §16 Developer Notes

---

### Крок A2 — TMA Implementer (реалізація data layer)

> Виконується **тільки після** успішного завершення Кроку A1.

**Роль:** `.agents/roles/tma_implementer.yaml`

**Завдання:** Прочитай роль Telegram_Mini_App_Implementer_TMA та реалізуй data layer згідно з DAD.

**Контекст агента:**

| Ресурс | Шлях | Що взяти |
|--------|------|----------|
| DAD (з Кроку A1) | `dad/DAD_Global_Data_Layer.md` | Data model, sync strategy, Repository interface |
| Tech Stack | `tech-stack/TECH_STACK_SCREEN_*.md` | Service patterns, existing code structure |
| ADR | `adr/ADR_SCREEN_*.md` | Existing architectural constraints |
| BRD | `ba/` | Business rules |
| Project root | `/Users/pavlyshyn/AI/ai-wt(27032026)/` | Existing code base |

**Що реалізувати (послідовно):**

```
Phase 1 — DB Setup
  ├── Встанови Dexie.js (якщо не встановлено): npm install dexie
  ├── Створи src/db/AppDB.ts — Dexie schema (версія 1, всі таблиці з DAD §5)
  └── Створи src/db/migrations/ (якщо є міграції)

Phase 2 — Repository Layer
  ├── Створи src/db/repositories/[Entity]Repository.ts для кожної entity з DAD §4
  │     реалізуй: getAll(), getById(), save(), delete(), getPendingSync(), markSynced()
  └── Створи src/db/repositories/index.ts (exports)

Phase 3 — Sync Service
  ├── Створи src/services/SyncService.ts
  │     реалізуй: flush(), handleConflict(), scheduleRetry()
  │     використовуй navigator.locks.request для lock
  └── Підключи тригери: window 'online' + document 'visibilitychange'

Phase 4 — Cache Layer
  ├── Створи src/db/repositories/CacheMetadataRepository.ts
  └── Інтегруй TTL-перевірку в кожен Repository.getAll()

Phase 5 — Integration  ← ⚠️ MANDATORY. Workflow НЕ завершено без цього кроку.
  ├── Оновлюй існуючі сервіси (src/services/*.ts) → замінюй прямі API-виклики
  │     на Repository calls + SyncQueue
  ├── Для кожного інтегрованого сервісу — задокументуй у implemented/ (step log)
  └── Після останнього сервісу — запусти: npx tsc --noEmit → 0 errors

⛔ STOP GATE після Phase 5:
  Workflow вважається ЗАВЕРШЕНИМ тільки якщо:
  - [ ] Кожен src/services/*.ts (окрім balanceService, якщо Q2=confirmed) використовує Repository
  - [ ] `npx tsc --noEmit` → 0 errors
  - [ ] implemented/IMPLEMENTED_Data_Layer.md оновлено з записом про Phase 5
  - [ ] Відкрий браузер → перевір Console: немає Dexie errors, є Cache HIT/MISS логи

  Якщо хоч одна умова не виконана → НЕ завершуй workflow. Виправ і перевір знову.
```

**Verification gates після КОЖНОГО кроку (не після всього блоку!):**
- `Type Contract Check` — типи відповідають DAD §4 Data Model
- `TMA Compatibility Check` — немає browser-native API несумісних з TMA
- `Log Completeness Check` — лог оновлено в `implemented/` після КОЖНОЇ фази
- `Phase 5 Integration Gate` — ОБОВ'ЯЗКОВИЙ фінальний gate, описано вище в ⛔ STOP GATE

**Вихідні артефакти:**

```
implemented/IMPLEMENTED_Data_Layer.md  ← лог реалізації з діаграмами
src/db/AppDB.ts
src/db/repositories/[Entity]Repository.ts  (по одному на entity)
src/services/SyncService.ts
```

---

## 🅑 Маршрут Б — Оновлення (DAD вже існує)

> Виконується коли `dad/DAD_*.md` вже є.

### Крок Б1 — Data Architect TMA (аудит змін)

**Роль:** `.agents/roles/data_architect_tma.yaml`

**Завдання:** Прочитай роль Data_Architect_TMA та проведи диференційний аналіз — що змінилося з моменту останнього DAD?

**Контекст агента:**

| Ресурс | Шлях | Що взяти |
|--------|------|----------|
| Існуючий DAD | `dad/DAD_*.md` | Поточний стан data layer design |
| BRD | `ba/` | Нові бізнес-вимоги |
| ADR | `adr/ADR_SCREEN_*.md` | Нові архітектурні рішення |
| Tech Stack | `tech-stack/TECH_STACK_SCREEN_*.md` | Нові entities або interfaces |
| Implemented screens | `implemented/IMPLEMENTED_SCREEN_*.md` | Нові реалізовані екрани |

**Що зробити:**

1. **Step 0 — MANDATORY:** Прочитай всі вхідні файли через `view_file`
2. Порівняй entities у `tech-stack/` vs entities у `dad/DAD_*.md §4 Data Model`:
   - Є нові TypeScript interfaces яких немає в DAD? → **DELTA DETECTED**
   - Є нові ADR рішення що впливають на sync/cache? → **DELTA DETECTED**
   - Є нові implemented екрани з новими сервісами? → **DELTA DETECTED**
3. **Якщо DELTA = 0** (нічого нового):
   - Повідом: "Data layer is up to date. No changes needed."
   - Зупинись. Крок Б2 не виконується.
4. **Якщо DELTA > 0** (є зміни):
   - Опиши DELTA у форматі:
     ```
     DELTA REPORT:
     + New entities: [список]
     + Changed sync rules: [список]
     + New cache requirements: [список]
     + Affected sections in DAD: [§N, §M, ...]
     ```
   - Оновлюй `dad/DAD_*.md` — додай нові entities, оновлюй змінені секції
   - Увесь документ має лишатися цілісним (не видаляй старі секції)
   - Запусти `bash .agents/skills/SKILL_DATA_ARCH_DAD/scripts/validate_dad.sh dad/DAD_*.md`
   - Виправ всі помилки → 0 errors → зберегти

**Передати на Крок Б2:**
- DELTA REPORT (список конкретних змін)
- Оновлений `dad/DAD_*.md`
- Список нових entities або змінених секцій DAD

---

### Крок Б2 — TMA Implementer (реалізація дельти)

> Виконується **тільки якщо** Крок Б1 виявив DELTA > 0.

**Роль:** `.agents/roles/tma_implementer.yaml`

**Завдання:** Реалізуй тільки те, що змінилося — згідно з DELTA REPORT від Кроку Б1.

**Контекст агента:**

| Ресурс | Шлях | Що взяти |
|--------|------|----------|
| Оновлений DAD | `dad/DAD_*.md` | Повний data layer design |
| DELTA REPORT | (від Кроку Б1) | Що саме змінилося — реалізовувати тільки це |
| Існуючий data layer | `src/db/`, `src/services/SyncService.ts` | Що вже реалізовано — не переписувати |
| Tech Stack | `tech-stack/TECH_STACK_SCREEN_*.md` | Нові interfaces |

**Принцип мінімального збитку:** реалізуй тільки DELTA — не торкайся стабільних частин data layer.

**Що реалізувати (на основі DELTA REPORT):**

```
Для кожного нового entity:
  ├── Додай таблицю в src/db/AppDB.ts (нова версія Dexie schema)
  └── Створи src/db/repositories/[NewEntity]Repository.ts

Для змінених sync правил:
  └── Оновлюй src/services/SyncService.ts

Для нових cache TTL:
  └── Оновлюй src/constants/cache.ts (CACHE_TTL об'єкт)

Для нових сервісів:
  └── Оновлюй src/services/[Screen]Service.ts → Repository calls
```

**Якщо необхідна міграція схеми БД:**
```typescript
// Обов'язково: increment DB version, не пропускати версії
db.version(N + 1).stores({ ... }).upgrade(tx => { ... })
```

**Verification gates:**
- `Type Contract Check` — нові типи відповідають DAD §4
- `TMA Compatibility Check`
- `Log Completeness Check`

**Вихідні артефакти:**

```
implemented/IMPLEMENTED_Data_Layer.md  ← оновлений лог з DELTA секцією
src/db/AppDB.ts (якщо схема змінилася)
src/db/repositories/[NewEntity]Repository.ts (якщо нові entities)
src/services/SyncService.ts (якщо sync змінився)
src/constants/cache.ts (якщо нові TTL)
```

---

## Правила передачі між агентами

```
Маршрут A (перший запуск):
  Крок A1 (Data_Architect_TMA)
    └─► передає: dad/DAD_Global_Data_Layer.md + validation report (0 errors)
          │
          ▼
  Крок A2 (TMA_Implementer)
    └─► виробляє: src/db/ + src/services/SyncService.ts + implemented/

Маршрут Б (оновлення):
  Крок Б1 (Data_Architect_TMA)
    ├─► DELTA = 0 → STOP (нічого робити)
    └─► DELTA > 0 → передає: DELTA REPORT + оновлений dad/DAD_*.md
          │
          ▼
  Крок Б2 (TMA_Implementer)
    └─► реалізовує тільки DELTA → оновлює src/db/ + implemented/
```

**Правила зупинки:**
- Якщо `validate_dad.sh` → ERRORS > 0 перед передачею → **зупинись і виправ**
- Якщо в DAD є `[BLOCKING]` питання без fallback в §16 → **зупинись і запитай користувача**
- Якщо Implementer знаходить невідповідність типів → **зупинись і повідом**
- Якщо Маршрут Б → DELTA = 0 → **зупинись після Б1, не запускай Б2**
- **Якщо Phase 5 Integration не завершена → workflow НЕ завершений, навіть якщо Phases 1–4 PASS**
- Якщо `npx tsc --noEmit` після Phase 5 показує errors → **зупинись і виправ перед закриттям**

---

## Приклад виклику

```
/local-db
```

> Workflow сам визначить маршрут: перевірить `dad/` → обере A або Б.
