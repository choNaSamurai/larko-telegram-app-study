# API Endpoints Reference — Larko Backend

> **Версія**: 1.0 | **Дата**: 2026-03-31 | **Base URL**: `/api/v1`
>
> **Автентифікація**: `Authorization: Bearer <JWT>` (Supabase Auth)
>
> **Пагінація**: `?limit=20&offset=0` (max limit = 100)
>
> **Формат помилок**: RFC 7807 Problem Details

---

## Загальне

### Ролі
| Роль | Опис |
|---|---|
| `owner` | Власник компанії. Повний доступ |
| `manager` | Менеджер. Управління замовленнями, працівниками, фінансами |
| `worker` | Робітник. Перегляд тільки своїх даних |

### Пагіновані відповіді
```json
{
    "items": [...],
    "total": 42,
    "has_more": true
}
```

### Формат помилок (RFC 7807)
```json
{
    "type": "https://api.larko.ai/errors/not_found",
    "title": "Not Found",
    "status": 404,
    "detail": "Order with id '...' not found",
    "instance": "/api/v1/orders/..."
}
```

---

## 1. Auth — Автентифікація

Префікс: `/api/v1/auth`

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `POST` | `/register` | Реєстрація нового акаунту | ❌ | — |
| `POST` | `/login` | Логін (email + password) | ❌ | — |
| `POST` | `/telegram` | Авторизація через Telegram WebApp | ❌ | — |
| `POST` | `/refresh` | Оновити access token | ❌ | — |
| `POST` | `/password/reset` | Запит на скидання пароля | ❌ | — |
| `POST` | `/password/reset/confirm` | Підтвердження скидання пароля | ❌ | — |
| `GET` | `/me` | Отримати дані поточного акаунту | ✅ | будь-яка |
| `PATCH` | `/me` | Оновити дані акаунту | ✅ | будь-яка |
| `DELETE` | `/me` | Видалити акаунт (schedule deletion) | ✅ | будь-яка |
| `POST` | `/me/auth-methods` | Прив'язати соц. мережу (Google, Apple) | ✅ | будь-яка |
| `DELETE` | `/me/auth-methods/{provider}` | Відв'язати соц. мережу | ✅ | будь-яка |

### POST `/register`
```json
// Request
{
    "email": "user@example.com",
    "password": "securepass123",
    "full_name": "Іван Петренко"
}
// Response 201
{
    "account_id": "uuid",
    "email": "user@example.com",
    "access_token": "jwt...",
    "refresh_token": "jwt...",
    "token_type": "bearer"
}
```

### POST `/telegram`
```json
// Request
{
    "init_data": "query_id=...&user=...&hash=..."
}
// Response 200 — AuthResponse (ті ж поля що register)
```

---

## 2. Companies — Компанії

Префікс: `/api/v1/companies`

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `POST` | `/` | Створити компанію | ✅ | будь-яка |
| `GET` | `/` | Список моїх компаній | ✅ | будь-яка |
| `GET` | `/{company_id}` | Деталі компанії | ✅ | member |
| `PATCH` | `/{company_id}` | Оновити компанію | ✅ | owner, manager |
| `DELETE` | `/{company_id}` | Видалити компанію (soft, 30 днів) | ✅ | owner |
| `PUT` | `/{company_id}/industry` | Змінити тип індустрії (пересіяти каталог) | ✅ | owner |
| `POST` | `/{company_id}/invite-code` | Регенерувати invite code | ✅ | owner, manager |

### POST `/`
```json
// Request
{
    "name": "Будівельна компанія",
    "industry": "construction"
}
// Response 201 — CompanyResponse
{
    "id": "uuid",
    "name": "Будівельна компанія",
    "industry": "construction",
    "invite_code": "ABC12345",
    "overtime_enabled": false,
    "overtime_daily_threshold": 8.0,
    "created_at": "2026-03-31T10:00:00Z"
}
```

---

## 3. Members — Учасники

Префікс: `/api/v1/members`

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `POST` | `/join` | Приєднатися до компанії по invite code | ✅ | будь-яка |
| `GET` | `/companies/{company_id}/members` | Список учасників | ✅ | member |
| `GET` | `/{member_id}` | Деталі учасника | ✅ | member (same company) |
| `PATCH` | `/{member_id}` | Оновити учасника | ✅ | owner, manager |
| `POST` | `/companies/{company_id}/members/{member_id}/deactivate` | Деактивувати | ✅ | owner, manager |
| `POST` | `/companies/{company_id}/members/{member_id}/reactivate` | Реактивувати | ✅ | owner, manager |
| `POST` | `/companies/{company_id}/members/{member_id}/promote` | Підвищити до manager | ✅ | owner |
| `POST` | `/companies/{company_id}/groups` | Створити групу працівників | ✅ | owner, manager |
| `GET` | `/companies/{company_id}/groups` | Список груп | ✅ | member |
| `PATCH` | `/companies/{company_id}/groups/{group_id}` | Оновити групу | ✅ | owner, manager |
| `DELETE` | `/companies/{company_id}/groups/{group_id}` | Видалити групу | ✅ | owner, manager |

### POST `/join`
```json
// Request
{
    "invite_code": "ABC12345"
}
// Response 201 — MemberResponse
{
    "id": "uuid",
    "account_id": "uuid",
    "company_id": "uuid",
    "role": "worker",
    "status": "active",
    "created_at": "..."
}
```

---

## 4. Billing — Тарифи та підписки

Префікс: `/api/v1/billing`

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `GET` | `/companies/{company_id}/subscription` | Поточна підписка | ✅ | owner, manager |
| `GET` | `/companies/{company_id}/limits` | Ліміти та використання | ✅ | owner, manager |
| `POST` | `/companies/{company_id}/checkout` | Створити сесію оплати (LemonSqueezy URL) | ✅ | owner |
| `POST` | `/billing/webhook` | LemonSqueezy webhook (HMAC) | ❌ | — (server) |

### GET `/companies/{company_id}/subscription`
```json
// Response 200
{
    "plan": "starter",
    "status": "active",
    "worker_limit": 15,
    "manager_limit": 3,
    "client_limit": 200,
    "current_workers": 7,
    "current_managers": 1,
    "current_clients": 12
}
```

**Тарифні плани**:
| План | Workers | Managers | Clients |
|---|---|---|---|
| `free` | 5 | 1 | 50 |
| `starter` | 15 | 3 | 200 |
| `business` | 50 | 10 | 1000 |
| `pro` | 500 | 50 | 10000 |

---

## 5. Catalog — Каталог (типи робіт, матеріали, типи відсутностей)

Префікс: `/api/v1/catalog`

### Product Types (типи робіт)

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `POST` | `/companies/{company_id}/products` | Створити тип роботи | ✅ | owner, manager |
| `GET` | `/companies/{company_id}/products` | Список типів робіт | ✅ | member |
| `GET` | `/products/{product_id}` | Деталі типу | ✅ | member (same company) |
| `PATCH` | `/products/{product_id}` | Оновити тип | ✅ | owner, manager |
| `DELETE` | `/products/{product_id}` | Видалити (soft-delete) | ✅ | owner, manager |

### POST `/companies/{company_id}/products`
```json
// Request
{
    "name": "Монтаж вікон",
    "pay_model": "per_unit",   // "per_hour" | "per_unit" | "per_job"
    "unit_rate": 350.00,
    "unit": "шт",
    "pricing_schema": {
        "overtime_enabled": true,
        "overtime_daily_threshold": 8
    }
}
```

### Material Types (типи матеріалів)

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `POST` | `/companies/{company_id}/materials` | Створити тип матеріалу | ✅ | owner, manager |
| `GET` | `/companies/{company_id}/materials` | Список типів матеріалів | ✅ | member |
| `PATCH` | `/materials/{material_id}` | Оновити | ✅ | owner, manager |
| `DELETE` | `/materials/{material_id}` | Видалити (soft-delete) | ✅ | owner, manager |

### Materials Used (використані матеріали на замовленні)

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `POST` | `/orders/{order_id}/materials` | Зафіксувати використаний матеріал | ✅ | owner, manager |
| `GET` | `/orders/{order_id}/materials` | Список використаних матеріалів | ✅ | member (same company) |

### Absence Types (типи відсутностей)

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `POST` | `/companies/{company_id}/absence-types` | Створити тип відсутності | ✅ | owner, manager |
| `GET` | `/companies/{company_id}/absence-types` | Список типів відсутностей | ✅ | member |
| `PATCH` | `/absence-types/{absence_type_id}` | Оновити тип відсутності | ✅ | owner, manager |

---

## 6. Orders — Замовлення

Префікс: `/api/v1/orders`

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `POST` | `/companies/{company_id}/orders` | Створити замовлення | ✅ | owner, manager |
| `GET` | `/companies/{company_id}/orders` | Список замовлень компанії | ✅ | owner, manager |
| `GET` | `/orders/my?company_id=` | Мої замовлення (worker) | ✅ | будь-яка |
| `GET` | `/orders/{order_id}` | Деталі замовлення | ✅ | member (same company) |
| `PATCH` | `/orders/{order_id}` | Оновити замовлення | ✅ | owner, manager |
| `DELETE` | `/orders/{order_id}` | Видалити (soft-delete) | ✅ | owner, manager |
| `PUT` | `/orders/{order_id}/status` | Змінити статус (FSM) | ✅ | owner, manager |
| `POST` | `/orders/{order_id}/payment-split` | Розподіл оплати (per_job) | ✅ | owner, manager |
| `POST` | `/orders/{order_id}/assign` | Призначити працівників | ✅ | owner, manager |
| `POST` | `/orders/{order_id}/duplicate` | Дублювати замовлення | ✅ | owner, manager |
| `POST` | `/orders/{order_id}/worker-start` | Worker сигналізує початок роботи | ✅ | member (assigned) |
| `POST` | `/orders/{order_id}/worker-done` | Worker сигналізує завершення | ✅ | member (assigned) |

### POST `/companies/{company_id}/orders`
```json
// Request
{
    "product_type_id": "uuid",
    "client_id": "uuid",
    "title": "Монтаж вікон — вул. Шевченка 12",
    "description": "5 вікон, металопластик",
    "quantity": 5,
    "due_date": "2026-04-15",
    "address": "вул. Шевченка 12, Львів"
}
// Response 201 — OrderResponse
{
    "id": "uuid",
    "status": "new",
    "pay_model_snapshot": "per_unit",
    "unit_rate_snapshot": 350.00,
    "client_name": "ТОВ Будмайстер",
    "assignments": [],
    "created_at": "..."
}
```

### PUT `/orders/{order_id}/status`
```json
// Request
{ "status": "in_progress" }
```

**Дозволені переходи FSM**:
```
new         → in_progress, dispute
in_progress → blocked, in_review, done, dispute
blocked     → in_progress, dispute
in_review   → done, in_progress, dispute
dispute     → in_progress, in_review, done
done        → dispute
```

### POST `/orders/{order_id}/assign`
```json
// Request
{
    "member_ids": ["uuid1", "uuid2"],
    "payout_percentage": 50.0
}
// Response 200 — AssignmentResponse[]
```

### POST `/orders/{order_id}/payment-split`
```json
// Request (для per_job моделі оплати)
{
    "splits": [
        { "member_id": "uuid1", "percentage": 60 },
        { "member_id": "uuid2", "percentage": 40 }
    ]
}
```

---

## 7. TimeLogs — Табелі робочого часу

Префікс: `/api/v1/timelogs`

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `POST` | `/` | Подати табель (з перервами) | ✅ | worker (assigned) |
| `GET` | `/companies/{company_id}` | Список табелів компанії | ✅ | member |
| `GET` | `/orders/{order_id}/timelogs` | Табелі за замовленням | ✅ | member (same company) |
| `GET` | `/my?company_id=` | Мої табелі (worker) | ✅ | будь-яка |
| `PATCH` | `/{timelog_id}` | Оновити табель | ✅ | owner (of timelog) |
| `GET` | `/{timelog_id}` | Деталі табелю | ✅ | member (same company) |

### POST `/`
```json
// Request
{
    "order_id": "uuid",
    "work_date": "2026-03-31",
    "start_time": "08:00:00",
    "end_time": "17:00:00",
    "breaks": [
        { "start_time": "12:00:00", "end_time": "13:00:00" }
    ],
    "notes": "Встановлено 3 вікна",
    "quantity_done": 3
}
// Response 201 — TimeLogResponse
{
    "id": "uuid",
    "gross_hours": 9.0,
    "break_hours": 1.0,
    "net_hours": 8.0,
    "overtime_hours": 0.0
}
```

**Бізнес-правила**:
- Перерви: max 5, не можуть перетинатися, мають бути в межах робочого часу
- Overtime: автоматичний розрахунок при `net_hours > daily_threshold`
- Ідемпотентність: 409 Conflict при повторному submit на тих же worker/order/date
- Авто-статус: подача табелю переводить order `new → in_progress`

### Query params для GET `/companies/{company_id}`
| Параметр | Тип | Опис |
|---|---|---|
| `member_id` | UUID? | Фільтр по працівнику |
| `order_id` | UUID? | Фільтр по замовленню |
| `limit` | int | Max 100, default 20 |
| `offset` | int | Default 0 |

---

## 8. Clients — Клієнти

Префікс: `/api/v1/clients`

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `POST` | `/companies/{company_id}/clients` | Створити клієнта | ✅ | owner, manager |
| `GET` | `/companies/{company_id}/clients` | Список клієнтів | ✅ | owner, manager |
| `GET` | `/clients/{client_id}` | Деталі клієнта | ✅ | member (same company) |
| `PATCH` | `/clients/{client_id}` | Оновити клієнта | ✅ | owner, manager |
| `DELETE` | `/clients/{client_id}` | Видалити (soft-delete) | ✅ | owner, manager |

### POST `/companies/{company_id}/clients`
```json
// Request
{
    "name": "ТОВ Будмайстер",
    "phone": "+380501234567",
    "email": "info@budmayster.ua",
    "address": "вул. Промислова 5, Київ"
}
```

> ⚠️ Перевіряється ліміт тарифу `client_limit` перед створенням

---

## 9. Finance — Фінанси

Префікс: `/api/v1/finance`

### Advances (аванси)

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `POST` | `/companies/{company_id}/advances` | Видати аванс | ✅ | owner, manager |
| `GET` | `/companies/{company_id}/advances` | Список авансів | ✅ | owner, manager |

### Ledger Adjustments (корекції)

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `POST` | `/companies/{company_id}/adjustments` | Створити корекцію (bonus/penalty/deduction/refund) | ✅ | owner, manager |
| `GET` | `/companies/{company_id}/adjustments` | Список корекцій | ✅ | owner, manager |

### POST `/companies/{company_id}/adjustments`
```json
// Request
{
    "member_id": "uuid",
    "order_id": "uuid (optional)",
    "adjustment_type": "bonus",  // bonus | penalty | deduction | refund
    "amount": 500.00,
    "reason": "Преміум за якісну роботу"
}
```

### Balances & Dashboard

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `GET` | `/companies/{company_id}/balance/{member_id}` | Баланс працівника | ✅ | owner, manager, self |
| `GET` | `/companies/{company_id}/balance/{member_id}/history` | Історія транзакцій | ✅ | owner, manager, self |
| `GET` | `/companies/{company_id}/members/{member_id}/stats` | Статистика працівника | ✅ | owner, manager, self |
| `GET` | `/companies/{company_id}/dashboard` | Фінансовий dashboard | ✅ | owner, manager |
| `GET` | `/companies/{company_id}/dashboard/stats` | Повна статистика (M1) | ✅ | owner, manager |

> ⚠️ Workers бачать тільки **свій** баланс, історію, і статистику (self-access guard)

### GET `/companies/{company_id}/balance/{member_id}`
```json
// Response 200
{
    "member_id": "uuid",
    "total_earned": 15200.00,
    "total_advances": 3000.00,
    "total_adjustments": 500.00,
    "balance": 12700.00,
    "currency": "UAH"
}
```

### Rate History

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `GET` | `/products/{product_type_id}/rate-history` | Історія змін ставки | ✅ | member (same company) |
| `GET` | `/companies/{company_id}/members/{member_id}/rate-history` | Історія ставок працівника | ✅ | owner, manager, self |

### Export

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `GET` | `/companies/{company_id}/export/finance` | Експорт фінансів (CSV) | ✅ | owner, manager |

---

## 10. Workflows — Відсутності та диспути

Префікс: `/api/v1/workflows`

### Absences (відсутності / відпустки)

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `POST` | `/companies/{company_id}/absences` | Створити запит на відсутність | ✅ | member |
| `GET` | `/companies/{company_id}/absences` | Список відсутностей | ✅ | member |
| `PUT` | `/absences/{absence_id}/review` | Підтвердити/відхилити | ✅ | owner, manager |

### GET `/companies/{company_id}/absences` Query params
| Параметр | Тип | Опис |
|---|---|---|
| `worker_id` | UUID? | Фільтр по працівнику |
| `status` | string? | `pending` / `approved` / `rejected` |

### POST `/companies/{company_id}/absences`
```json
// Request
{
    "absence_type_id": "uuid",
    "start_date": "2026-04-01",
    "end_date": "2026-04-05",
    "reason": "Сімейні обставини"
}
```

### PUT `/absences/{absence_id}/review`
```json
// Request
{
    "decision": "approved",  // "approved" | "rejected"
    "comment": "Погоджено"
}
```

### Disputes (диспути)

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `POST` | `/companies/{company_id}/disputes` | Створити диспут | ✅ | member |
| `GET` | `/companies/{company_id}/disputes` | Список диспутів | ✅ | member |
| `PUT` | `/disputes/{dispute_id}/resolve` | Вирішити диспут | ✅ | owner, manager |
| `POST` | `/disputes/{dispute_id}/attachments` | Додати вкладення | ✅ | member (same company) |
| `GET` | `/disputes/{dispute_id}/attachments` | Список вкладень | ✅ | member (same company) |

### GET `/companies/{company_id}/disputes` Query params
| Параметр | Тип | Опис |
|---|---|---|
| `order_id` | UUID? | Фільтр по замовленню |
| `worker_id` | UUID? | Фільтр по працівнику |
| `status` | string? | `open` / `resolved` |

---

## 11. Content — Коментарі та фото

Префікс: `/api/v1/content`

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `POST` | `/orders/{order_id}/comments` | Додати коментар до замовлення | ✅ | member (same company) |
| `GET` | `/orders/{order_id}/comments` | Список коментарів | ✅ | member (same company) |
| `POST` | `/orders/{order_id}/photos` | Завантажити метадані фото | ✅ | member (same company) |
| `GET` | `/orders/{order_id}/photos` | Список фото | ✅ | member (same company) |

> Фото файли завантажуються напряму в **Supabase Storage**. Цей ендпоінт зберігає тільки метадані (URL, caption).

---

## 12. Audit — Журнал аудиту

Префікс: `/api/v1/audit`

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `GET` | `/companies/{company_id}/audit` | Запит журналу аудиту | ✅ | owner, manager |

### Query params
| Параметр | Тип | Опис |
|---|---|---|
| `entity_type` | string? | `order` / `member` / `client` / ... |
| `entity_id` | UUID? | Конкретна сутність |
| `limit` / `offset` | int | Пагінація |

> ⚠️ Доступно тільки на тарифі **Pro**

---

## 13. Public API — Зовнішній API (API ключі)

Префікс: `/api/v1/public`

### Key Management (JWT auth)

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `POST` | `/companies/{company_id}/keys` | Створити API ключ | ✅ JWT | owner |
| `GET` | `/companies/{company_id}/keys` | Список ключів (без raw key) | ✅ JWT | owner, manager |
| `DELETE` | `/keys/{key_id}` | Відкликати ключ | ✅ JWT | owner |

### Read-only Endpoints (API Key auth: `X-API-Key` header)

| Метод | Шлях | Опис | Auth | Ролі |
|---|---|---|---|---|
| `GET` | `/v1/orders` | Список замовлень (read-only) | 🔑 API Key | — |
| `GET` | `/v1/timelogs` | Список табелів (read-only) | 🔑 API Key | — |

> ⚠️ Доступно тільки на тарифі **Pro**

---

## 14. System — Системні ендпоінти

| Метод | Шлях | Опис | Auth |
|---|---|---|---|
| `GET` | `/health` | Живий? (shallow) | ❌ |
| `GET` | `/health/ready` | БД доступна? (deep) | ❌ |

---

## Зведена статистика API

| Модуль | Ендпоінтів | CRUD | Auth |
|---|---|---|---|
| Auth | 11 | ✓ | JWT / Public |
| Companies | 7 | ✓ | JWT + RBAC |
| Members | 11 | ✓ | JWT + RBAC |
| Billing | 4 | R + webhook | JWT + HMAC |
| Catalog | 10 | ✓ | JWT + RBAC |
| Orders | 12 | ✓ + FSM | JWT + RBAC |
| TimeLogs | 6 | CR + U | JWT + RBAC |
| Clients | 5 | ✓ | JWT + RBAC |
| Finance | 12 | CR + dashboards | JWT + self-guard |
| Workflows | 8 | CR + review | JWT + RBAC |
| Content | 4 | CR | JWT + RBAC |
| Audit | 1 | R (Pro) | JWT + RBAC |
| Public API | 5 | keys + read | JWT / API Key |
| System | 2 | R | Public |
| **Всього** | **98** | | |
