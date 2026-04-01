# Каталог помилок API — Larko Backend

> Всі помилки повертаються у форматі **RFC 7807 Problem Details**.
>
> **Content-Type**: `application/json`

---

## Формат відповіді

```json
{
  "type": "https://api.larko.ai/errors/{error_type}",
  "title": "Human Readable Title",
  "status": 422,
  "detail": "Конкретне повідомлення про помилку",
  "instance": "/api/v1/orders/uuid",
  "errors": []
}
```

| Поле | Тип | Опис |
|---|---|---|
| `type` | string | URI типу помилки |
| `title` | string | Заголовок (з `error_type`) |
| `status` | int | HTTP статус код |
| `detail` | string | Людиночитане пояснення |
| `instance` | string | Шлях запиту що спричинив помилку |
| `errors` | array? | Тільки для `validation_error` — масив полів |

---

## Ієрархія помилок

```
Exception
└── AppError (500)
    ├── NotFoundError (404)
    ├── ConflictError (409)
    ├── BusinessRuleError (422)
    ├── ForbiddenError (403)
    │   └── PlanLimitError (403)
    └── ExternalServiceError (503)
```

---

## 1. `validation_error` — 422

> Помилка валідації Pydantic (невалідні дані в запиті).

```json
{
  "type": "https://api.larko.ai/errors/validation_error",
  "title": "Validation Error",
  "status": 422,
  "detail": "Request validation failed",
  "instance": "/api/v1/auth/register",
  "errors": [
    { "field": "email", "message": "value is not a valid email address" },
    { "field": "password", "message": "String should have at least 8 characters" }
  ]
}
```

**Коли виникає**: невалідний тип, пропущене обов'язкове поле, порушена валідація `Field()`.

**Обробка на фронті**: показати помилки під відповідними полями форми, використовуючи `errors[].field`.

---

## 2. `not_found` — 404

> Ресурс не знайдено.

```json
{
  "type": "https://api.larko.ai/errors/not_found",
  "title": "Not Found",
  "status": 404,
  "detail": "Order with id '550e8400-...' not found"
}
```

**Де виникає**:

| Модуль | Ресурси |
|---|---|
| Auth | `Account` |
| Companies | `Company` |
| Members | `Member`, `WorkerGroup`, `Company with this invite code` |
| Orders | `Order`, `ProductType`, `Assignment` |
| TimeLogs | `TimeLog` |
| Catalog | `ProductType`, `MaterialType`, `MaterialUsed`, `AbsenceType` |
| Finance | `Member` (при розрахунку балансу) |
| Workflows | `AbsenceRequest`, `Dispute` |
| Content | `Order` |
| Clients | `Client` |

**Обробка на фронті**: показати повідомлення "Не знайдено" або redirect на список.

---

## 3. `conflict` — 409

> Дублікат або конфлікт даних.

```json
{
  "type": "https://api.larko.ai/errors/conflict",
  "title": "Conflict",
  "status": 409,
  "detail": "Account with email 'user@example.com' already exists"
}
```

**Сценарії**:

| Модуль | Ситуація |
|---|---|
| Auth | `Account with email '...' already exists` |
| Auth | `Supabase signup failed: ...` |
| Members | `Member with this Telegram ID already exists in the company` |
| TimeLogs | `Timelog already exists for worker on {date} for this order` |

**Обробка на фронті**: показати повідомлення що запис вже існує, запропонувати оновити замість створення.

---

## 4. `business_rule_violation` — 422

> Порушення бізнес-правила. Дані валідні, але операція заборонена за бізнес-логікою.

```json
{
  "type": "https://api.larko.ai/errors/business_rule_violation",
  "title": "Business Rule Violation",
  "status": 422,
  "detail": "Cannot update order details after it is marked as done."
}
```

**Сценарії по модулях**:

### Orders
| Повідомлення | Контекст |
|---|---|
| `Cannot update order details after it is marked as done.` | PATCH на done order |
| `Invalid status transition: {from} → {to}` | FSM порушення |
| `Cannot assign workers to a completed order.` | Assign на done |
| `Cannot delete a completed order.` | Видалення done |
| `Payment split is only for per-job orders.` | Split на per_hour |
| `Order is already done.` | Повторне закриття |
| `Payment split must total 100%. Got X%.` | Сума != 100 |
| `All assigned workers must be in the split.` | Пропущений worker |

### TimeLogs
| Повідомлення | Контекст |
|---|---|
| `Cannot submit timelog for a completed order.` | Табель на done order |
| `User is not a member of the company for this order` | Не в компанії |
| `Worker is not assigned to this order` | Не призначений |
| `End time must be after start time` | Невалідний час |
| `Both start_time and end_time must be provided, or neither.` | Часткові дані |
| `TimeLog must have either time or a quantity.` | Пустий табель |
| `Maximum 5 breaks allowed per timelog` | Ліміт перерв |
| `Break N: end time must be after start time` | Невалідна перерва |
| `Break N: break must be within work hours` | Перерва поза зміною |
| `Break N: overlaps with break M` | Перетин перерв |
| `You can only edit your own timelogs` | Чужий табель |
| `Cannot edit timelog for a completed order` | Редагування done |

### Members
| Повідомлення | Контекст |
|---|---|
| `Cannot deactivate yourself.` | Самодеактивація |
| `Member is already a manager` | Подвійне підвищення |
| `This member was deactivated. Ask the manager to reactivate.` | Деактивований join |

### Companies
| Повідомлення | Контекст |
|---|---|
| `Maximum N companies allowed per account` | Ліміт компаній |

### Workflows
| Повідомлення | Контекст |
|---|---|
| `End date must be after start date` | Невалідні дати відсутності |
| `Overlapping absence request exists` | Перетин відсутностей |
| `Absence already reviewed` | Повторний review |
| `Cannot file a dispute for a completed order.` | Диспут на done |
| `Dispute already resolved` | Повторний resolve |

### Content
| Повідомлення | Контекст |
|---|---|
| `Cannot modify content for completed orders` | Контент на done |
| `Maximum 3 photos per day per order` | Ліміт фото |

### Catalog
| Повідомлення | Контекст |
|---|---|
| `Cannot log materials for completed orders` | Матеріали на done |
| `Cannot delete product type with active orders` | Видалення з активними |

### Clients
| Повідомлення | Контекст |
|---|---|
| `Cannot delete client with active orders` | Видалення з активними |

**Обробка на фронті**: показати `detail` користувачу як toast / alert, бо це зрозуміле повідомлення.

---

## 5. `forbidden` — 403

> Доступ заборонено (RBAC або company scope).

```json
{
  "type": "https://api.larko.ai/errors/forbidden",
  "title": "Forbidden",
  "status": 403,
  "detail": "You do not have access to this Order."
}
```

**Сценарії**:
| Повідомлення | Контекст |
|---|---|
| `You do not have access to this {Entity}.` | RBAC — невірна роль |
| `Entity does not belong to a company` | Cross-company доступ |
| `Workers can only view their own balance` | Self-access guard |
| `Workers can only view their own balance history` | Self-access guard |
| `Workers can only view their own stats` | Self-access guard |
| `Workers can only view their own rate history` | Self-access guard |
| `You are not an active member of this company` | Неактивний member |

**Обробка на фронті**: показати "Доступ заборонено", можливо redirect на головну.

---

## 6. `plan_limit_exceeded` — 403

> Перевищено ліміт тарифного плану (підклас `forbidden`).

```json
{
  "type": "https://api.larko.ai/errors/plan_limit_exceeded",
  "title": "Plan Limit Exceeded",
  "status": 403,
  "detail": "Plan limit reached: workers (15/15). Upgrade to increase limits."
}
```

**Ліміт перевірки**:
| Ліміт | Де перевіряється |
|---|---|
| `workers` | Додавання нового worker |
| `managers` | Підвищення до manager |
| `clients` | Створення клієнта |
| `photo_storage_mb` | Завантаження фото |

**Обробка на фронті**: показати модалку "Upgrade Plan" з кнопкою на `/billing/checkout`.

---

## 7. `external_service_error` — 503

> Зовнішній сервіс недоступний.

```json
{
  "type": "https://api.larko.ai/errors/external_service_error",
  "title": "External Service Error",
  "status": 503,
  "detail": "Supabase Auth service is temporarily unavailable"
}
```

**Обробка на фронті**: "Сервіс тимчасово недоступний. Спробуйте через кілька хвилин."

---

## 8. `internal_error` — 500

> Необроблена помилка сервера (catch-all).

```json
{
  "type": "https://api.larko.ai/errors/internal_error",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred. Please try again later."
}
```

**Обробка на фронті**: generic error screen, не показувати деталі (безпека).

---

## HTTP Status Codes — Зведення

| Код | Тип | Коли |
|---|---|---|
| `200` | OK | Успішна операція |
| `201` | Created | Створено новий ресурс |
| `204` | No Content | Видалено (groups) |
| `401` | Unauthorized | Відсутній/невалідний JWT |
| `403` | Forbidden / PlanLimit | RBAC або ліміт тарифу |
| `404` | Not Found | Ресурс не знайдено |
| `409` | Conflict | Дублікат (email, timelog) |
| `422` | Unprocessable | Валідація або бізнес-правило |
| `429` | Too Many Requests | Rate limiting (SlowAPI) |
| `503` | Service Unavailable | Зовнішній сервіс недоступний |
| `500` | Internal Error | Необроблена помилка |

---

## Рекомендації для фронтенду

1. **Завжди перевіряй `status`** — для вибору типу обробки
2. **Для 422 з `errors[]`** — показуй під полями форми
3. **Для 422 без `errors[]`** — це BusinessRule, показуй `detail` як toast
4. **Для 403 з `plan_limit_exceeded`** — покажи upgrade modal
5. **Для 409** — запропонуй оновити замість створення
6. **Для 401** — redirect на login
7. **Для 429** — покажи "Забагато запитів, зачекайте"
