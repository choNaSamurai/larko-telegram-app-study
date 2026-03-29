---
description: End-to-end feature development workflow — from Figma design to production code via 3 sequential agents
---

# /do-feature Workflow

## Trigger

```
@do-feature
- [figma-design-link-1]
- [figma-design-link-2]
```

Запусти цей workflow, отримавши один або кілька Figma-посилань. Виконуй три кроки послідовно — кожен агент отримує результат попереднього.

---

## Крок 1 — System Analyst

**Роль:** `.agents/roles/system_analyst.yaml`

**Завдання:** Прочитай роль System_Analyst з `.agents/roles/system_analyst.yaml` та виконай повний аналіз наданих Figma-екранів.

**Контекст агента:**

| Ресурс | Шлях |
|---|---|
| Figma-посилання | `[figma-design-link]` (кожне посилання з виклику) |
| BRD та бізнес-вимоги | `/Users/pavlyshyn/AI/ai-wt(27032026)/ba/` |

**Що зробити:**

1. Прочитай роль: `.agents/roles/system_analyst.yaml`
2. Для кожного Figma-посилання: виконай `SKILL_FIGMA_PARSE` та `SKILL_BRD_PARSE`
3. Для кожного екрану: виконай `SKILL_SA_DOCUMENT` та запиши файл у `scenario/SCREEN_[NAME].md`
4. Виконай `handover_checklist` з ролі перед передачею результату далі

**Вихідні артефакти (передаються на Крок 2):**

- `scenario/SCREEN_[NAME].md` — один файл на кожен екран
- Список усіх `[BLOCKING]` питань з §12 кожного сценарію (якщо є — зупинись і запитай користувача)

---

## Крок 2 — Software Architect TMA

> Виконується **тільки після** успішного завершення Кроку 1.

**Роль:** `.agents/roles/software_architect_tma.yaml`

**Завдання:** Прочитай роль Software_Architect_TMA з `.agents/roles/software_architect_tma.yaml` та перетвори SA-сценарії на архітектурні рішення і технічний стек.

**Контекст агента:**

| Ресурс | Шлях |
|---|---|
| Figma-посилання | `[figma-design-link]` (ті самі, що в Кроці 1) |
| BRD та бізнес-вимоги | `/Users/pavlyshyn/AI/ai-wt(27032026)/ba/` |
| SA-сценарії (з Кроку 1) | `/Users/pavlyshyn/AI/ai-wt(27032026)/scenario/` |

**Вхід від Кроку 1:**

- Список файлів `scenario/SCREEN_[NAME].md`, які були щойно створені
- Список вирішених/невирішених `[BLOCKING]` питань

**Що зробити:**

1. Прочитай роль: `.agents/roles/software_architect_tma.yaml`
2. Для кожного сценарію: виконай `SKILL_TMA_ARCH_ADR` та `SKILL_TMA_ARCH_SPEC`
3. Запиши `adr/ADR_SCREEN_[NAME].md` згідно з шаблоном з `.agents/skills/SKILL_TMA_ARCH_SPEC/references/adr_template.md`
4. Запиши `tech-stack/TECH_STACK_SCREEN_[NAME].md` з обов'язковими секціями:
   - `## File Structure`
   - `## Step-by-Step Implementation` (кожен крок з `Traces to:`)
   - `## TypeScript Interfaces` (значення анотовані джерелом зі сценарію)
   - `## Developer Notes` (staleTime, gcTime, fallback-припущення для BLOCKING-питань)
5. Перевір: чи немає невирішених `[BLOCKING]` питань. Якщо є — задокументуй fallback-припущення в `## Developer Notes`

**Вихідні артефакти (передаються на Крок 3):**

- `adr/ADR_SCREEN_[NAME].md`
- `tech-stack/TECH_STACK_SCREEN_[NAME].md`

---

## Крок 3 — TMA Implementer

> Виконується **тільки після** успішного завершення Кроку 2.

**Роль:** `.agents/roles/tma_implementer.yaml`

**Завдання:** Прочитай роль Telegram_Mini_App_Implementer_TMA з `.agents/roles/tma_implementer.yaml` та реалізуй екрани на основі архітектурних рішень і сценаріїв.

**Контекст агента:**

| Ресурс | Шлях |
|---|---|
| Figma-посилання | `[figma-design-link]` (ті самі, що в Кроці 1) |
| BRD та бізнес-вимоги | `/Users/pavlyshyn/AI/ai-wt(27032026)/ba/` |
| SA-сценарії | `/Users/pavlyshyn/AI/ai-wt(27032026)/scenario/` |
| Tech Stack (з Кроку 2) | `/Users/pavlyshyn/AI/ai-wt(27032026)/tech-stack/` |
| ADR (з Кроку 2) | `/Users/pavlyshyn/AI/ai-wt(27032026)/adr/` |

**Вхід від Кроку 2:**

- Список файлів `adr/ADR_SCREEN_[NAME].md`
- Список файлів `tech-stack/TECH_STACK_SCREEN_[NAME].md`

**Що зробити:**

1. Прочитай роль: `.agents/roles/tma_implementer.yaml`
2. Для кожного екрану: виконай `SKILL_TMA_IMPLEMENT`
3. Дотримуйся `verification_gates` після кожного атомарного кроку:
   - `Type Contract Check`
   - `File Structure Check`
   - `TMA Compatibility Check`
   - `Log Completeness Check`
   - `Global Layout Check`
   - `Figma Icon Extraction Check`
   - `Visual Fidelity Check` ← **MANDATORY per component**
   - `Color Token Check` ← **MANDATORY per component**
   - `Spacing Fidelity Check` ← **MANDATORY per section/card**
4. **Visual Verification Gate (виконати для кожного major компонента):**
   - Виклич `get_screenshot` для Figma-вузла компонента (node ID з Scenario §7)
   - Зроби скріншот браузера з dev-сервера (localhost:5173 або відповідний порт)
   - Порівняй side-by-side:
     * Кольори фону/тексту відповідають hex з Scenario §12.1?
     * Розміри шрифту, вага відповідає Figma?
     * Відступи (padding, gap) відповідають px-значенням?
     * Іконки правильні (правильний `data-name`, розмір, колір)?
     * Бордер картки — лише лівий (`borderLeft`)?
   - Запиши результат у `implemented/IMPLEMENTED_SCREEN_[NAME].md`:
     ```
     ### Visual Fidelity — [ComponentName]
     - Figma node: [node-id]
     - Delta: PASS / FAIL + конкретні відмінності
     - Виправлення: [список]
     ```
   - **Якщо FAIL** — виправ і повтори порівняння перед переходом до наступного компонента
5. Після КОЖНОГО атомарного кроку: оновлюй `implemented/IMPLEMENTED_SCREEN_[NAME].md`
6. Пріоритет документів при конфлікті: **Tech Stack > ADR > Scenario > BRD**


**Вихідні артефакти:**

- `implemented/IMPLEMENTED_SCREEN_[NAME].md` — лог реалізації з діаграмами
- Production-ready вихідний код у `app/src/`

---

## Правила передачі між агентами

```
Крок 1 (System_Analyst)
  └─► передає: scenario/SCREEN_*.md + список BLOCKING-питань
        │
        ▼
Крок 2 (Software_Architect_TMA)
  └─► передає: adr/ADR_SCREEN_*.md + tech-stack/TECH_STACK_SCREEN_*.md
        │
        ▼
Крок 3 (Telegram_Mini_App_Implementer_TMA)
  └─► виробляє: implemented/IMPLEMENTED_SCREEN_*.md + production code
```

- Якщо Крок 1 має невирішені `[BLOCKING]` питання → зупинись та запитай користувача перед Кроком 2.
- Якщо Крок 2 має `[BLOCKING]` питання без fallback → задокументуй fallback у `## Developer Notes` та продовжуй.
- Якщо Крок 3 знаходить невідповідність типів → зупинись та повідом користувача.

---

## Приклад виклику

```
@do-feature
- https://www.figma.com/design/XXXXX/Larko?node-id=123-456
- https://www.figma.com/design/XXXXX/Larko?node-id=789-012
```