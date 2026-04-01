# Larko API — Детальний опис ендпоінтів

> **Base URL**: `/api/v1` | **Auth**: `Authorization: Bearer <JWT>` | **Content-Type**: `application/json`

---

## 1. Auth (`/api/v1/auth`)

### 1.1 POST `/register` — Реєстрація
**Auth**: ❌ | **Status**: `201`

**Request Body**:
| Поле | Тип | Обов'язкове | Валідація | Опис |
|---|---|---|---|---|
| `email` | string | ✅ | email format | Email адреса |
| `password` | string | ✅ | 8–128 символів | Пароль |
| `full_name` | string | ✅ | 1–255 символів | Повне ім'я |
| `language` | string | ❌ | `uk` \| `en`, default: `uk` | Мова інтерфейсу |

**Response** — `AuthResponse`:
```json
{
  "tokens": {
    "access_token": "eyJhbG...",
    "refresh_token": "eyJhbG...",
    "token_type": "bearer",
    "expires_in": 3600
  },
  "account": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "Іван Петренко",
    "language": "uk",
    "telegram_id": null,
    "trial_used": false,
    "created_at": "2026-03-31T10:00:00Z"
  }
}
```

### 1.2 POST `/login` — Логін
**Auth**: ❌ | **Status**: `200`

| Поле | Тип | Обов'язкове | Опис |
|---|---|---|---|
| `email` | string | ✅ | Email |
| `password` | string | ✅ | Пароль |

**Response**: `AuthResponse` (як у register)

### 1.3 POST `/telegram` — Telegram WebApp Auth
**Auth**: ❌ | **Status**: `200`

| Поле | Тип | Обов'язкове | Опис |
|---|---|---|---|
| `init_data` | string | ✅ | Raw initData з Telegram.WebApp |
| `full_name` | string | ❌ | Ім'я (макс 255) |
| `language` | string | ❌ | `uk` \| `en`, default: `uk` |

**Response**: `AuthResponse`

### 1.4 POST `/refresh` — Оновити токен
**Auth**: ❌ | **Status**: `200` | ⏳ TODO

### 1.5 POST `/password/reset` — Запит скидання пароля
**Auth**: ❌ | **Status**: `200` | ⏳ TODO

| Поле | Тип | Обов'язкове |
|---|---|---|
| `email` | string (email) | ✅ |

### 1.6 POST `/password/reset/confirm` — Підтвердити скидання
**Auth**: ❌ | **Status**: `200` | ⏳ TODO

| Поле | Тип | Обов'язкове | Валідація |
|---|---|---|---|
| `token` | string | ✅ | — |
| `new_password` | string | ✅ | 8–128 символів |

### 1.7 GET `/me` — Мій акаунт
**Auth**: ✅ JWT | **Status**: `200`

**Response** — `AccountResponse`:
| Поле | Тип | Опис |
|---|---|---|
| `id` | UUID | ID акаунту |
| `email` | string | Email |
| `full_name` | string | Повне ім'я |
| `language` | string | Мова |
| `telegram_id` | int? | Telegram ID (якщо прив'язано) |
| `trial_used` | bool | Чи використано безкоштовний тріал |
| `created_at` | datetime | Дата реєстрації |

### 1.8 PATCH `/me` — Оновити акаунт
**Auth**: ✅ JWT | **Status**: `200`

| Поле | Тип | Обов'язкове | Валідація |
|---|---|---|---|
| `full_name` | string | ❌ | 1–255 символів |
| `language` | string | ❌ | `uk` \| `en` |

### 1.9 DELETE `/me` — Видалити акаунт
**Auth**: ✅ JWT | **Status**: `200`
Response: `{"message": "Account scheduled for deletion"}`

### 1.10 POST `/me/auth-methods` — Прив'язати соц. мережу
**Auth**: ✅ JWT | **Status**: `200` | ⏳ TODO

### 1.11 DELETE `/me/auth-methods/{provider}` — Відв'язати
**Auth**: ✅ JWT | **Status**: `200` | ⏳ TODO
**Path**: `provider` — `google` | `apple`

---

## 2. Companies (`/api/v1/companies`)

### 2.1 POST `/` — Створити компанію
**Auth**: ✅ JWT | **Status**: `201`

**Request** — `CompanyCreate`:
| Поле | Тип | Обов'язкове | Валідація | Default |
|---|---|---|---|---|
| `name` | string | ✅ | 1–255 | — |
| `industry_type` | string | ✅ | макс 50 | — |
| `country` | string | ❌ | макс 5 | `UA` |
| `base_currency` | string | ❌ | макс 5 | `UAH` |

**Response** — `CompanyResponse`:
| Поле | Тип | Опис |
|---|---|---|
| `id` | UUID | ID компанії |
| `account_id` | UUID | Власник |
| `name` | string | Назва |
| `industry_type` | string | Тип індустрії |
| `country` | string | Країна |
| `base_currency` | string | Валюта |
| `invite_code` | string | Код запрошення |
| `overtime_enabled` | bool | Чи ввімкнено overtime |
| `overtime_multiplier` | float | Множник overtime |
| `overtime_daily_threshold` | float | Денний поріг (годин) |
| `overtime_weekly_threshold` | float | Тижневий поріг (годин) |
| `status` | string | `active` \| `scheduled_deletion` |
| `created_at` | datetime | — |
| `scheduled_deletion_at` | datetime? | Дата видалення (30 днів) |

### 2.2 GET `/` — Список компаній
**Auth**: ✅ JWT | **Пагінація**: ✅ `?limit=&offset=`
**Response**: `{ items: CompanyResponse[], total: int, has_more: bool }`

### 2.3 GET `/{company_id}` — Деталі компанії
**Auth**: ✅ JWT | **Роль**: member
**Response**: `CompanyResponse`

### 2.4 PATCH `/{company_id}` — Оновити компанію
**Auth**: ✅ JWT | **Роль**: owner, manager

**Request** — `CompanyUpdate`:
| Поле | Тип | Валідація |
|---|---|---|
| `name` | string? | 1–255 |
| `overtime_enabled` | bool? | — |
| `overtime_multiplier` | float? | 1.0–5.0 |
| `overtime_daily_threshold` | float? | 1.0–24.0 |
| `overtime_weekly_threshold` | float? | 1.0–168.0 |

### 2.5 DELETE `/{company_id}` — Видалити (soft, 30 днів)
**Auth**: ✅ JWT | **Роль**: owner only

### 2.6 PUT `/{company_id}/industry` — Змінити індустрію
**Auth**: ✅ JWT | **Роль**: owner only
**Request**: `{ "industry_type": "construction" }` (макс 50)

### 2.7 POST `/{company_id}/invite-code` — Регенерація invite code
**Auth**: ✅ JWT | **Роль**: owner, manager

---

## 3. Members (`/api/v1/members`)

### 3.1 POST `/join` — Приєднатися по invite code
**Auth**: ✅ JWT | **Status**: `201`

| Поле | Тип | Обов'язкове | Валідація |
|---|---|---|---|
| `invite_code` | string | ✅ | 4–16 |
| `full_name` | string | ✅ | 1–255 |
| `telegram_id` | string? | ❌ | макс 50 |

**Response** — `MemberResponse`:
| Поле | Тип | Опис |
|---|---|---|
| `id` | UUID | Member ID |
| `company_id` | UUID | — |
| `account_id` | UUID? | — |
| `telegram_id` | string? | — |
| `full_name` | string | — |
| `role` | string | `owner` \| `manager` \| `worker` |
| `status` | string | `active` \| `deactivated` |
| `worker_group_id` | UUID? | Група працівника |
| `hourly_rate` | float | Ставка за годину |
| `created_at` | datetime | — |

### 3.2 GET `/companies/{company_id}/members` — Список
**Auth**: ✅ | **Роль**: member | **Пагінація**: ✅

### 3.3 GET `/{member_id}` — Деталі
**Auth**: ✅ | **Роль**: member (same company)

### 3.4 PATCH `/{member_id}` — Оновити
**Auth**: ✅ | **Роль**: owner, manager

| Поле | Тип | Валідація |
|---|---|---|
| `full_name` | string? | 1–255 |
| `worker_group_id` | UUID? | — |
| `hourly_rate` | float? | ≥ 0 |

### 3.5 POST `/companies/{cid}/members/{mid}/deactivate`
**Auth**: ✅ | **Роль**: owner, manager | Не можна деактивувати себе

### 3.6 POST `/companies/{cid}/members/{mid}/reactivate`
**Auth**: ✅ | **Роль**: owner, manager

### 3.7 POST `/companies/{cid}/members/{mid}/promote`
**Auth**: ✅ | **Роль**: owner only | Підвищення worker → manager

### 3.8 POST `/companies/{cid}/groups` — Створити групу
**Auth**: ✅ | **Роль**: owner, manager | **Status**: `201`

| Поле | Тип | Обов'язкове | Default |
|---|---|---|---|
| `name` | string | ✅ | — |
| `color` | string | ❌ | `#3B82F6` (hex format) |

**Response** — `WorkerGroupResponse`:
`{ id, company_id, name, color, created_at }`

### 3.9 GET `/companies/{cid}/groups` — Список груп
### 3.10 PATCH `/companies/{cid}/groups/{gid}` — Оновити
### 3.11 DELETE `/companies/{cid}/groups/{gid}` — Видалити (`204`)

---

## 4. Billing (`/api/v1/billing`)

### 4.1 GET `/companies/{cid}/subscription`
**Auth**: ✅ | **Роль**: owner, manager

**Response** — `SubscriptionResponse`:
| Поле | Тип | Опис |
|---|---|---|
| `id` | UUID | — |
| `company_id` | UUID | — |
| `plan` | string | `free`\|`starter`\|`business`\|`pro` |
| `billing_cycle` | string | `monthly`\|`annual` |
| `status` | string | `active`\|`cancelled`\|`trial` |
| `current_period_end` | datetime? | — |
| `worker_limit` | int | Ліміт робітників |
| `manager_limit` | int | Ліміт менеджерів |
| `client_limit` | int | Ліміт клієнтів |
| `photo_storage_mb` | int | Ліміт фото сховища |
| `history_retention_days` | int | Зберігання історії |
| `created_at` | datetime | — |

### 4.2 GET `/companies/{cid}/limits`
**Response** — `PlanLimitsResponse`:
```json
{
  "plan": "starter",
  "worker_limit": 15, "manager_limit": 3, "client_limit": 200,
  "photo_storage_mb": 500, "history_retention_days": 365,
  "workers_used": 7, "managers_used": 1, "clients_used": 12,
  "billing_status": "active"
}
```

### 4.3 POST `/companies/{cid}/checkout` — Checkout URL
**Auth**: ✅ | **Роль**: owner | ⏳ TODO
**Response**: `{ "checkout_url": "https://..." }`

### 4.4 POST `/billing/webhook` — LemonSqueezy Webhook
**Auth**: HMAC `X-Signature` header | Внутрішній

---

## 5. Catalog (`/api/v1/catalog`)

### 5.1 POST `/companies/{cid}/products` — Тип роботи
**Auth**: ✅ | **Роль**: owner, manager | **Status**: `201`

| Поле | Тип | Обов'язкове | Default | Валідація |
|---|---|---|---|---|
| `name` | string | ✅ | — | 1–255 |
| `description` | string? | ❌ | null | — |
| `unit` | string | ❌ | `unit` | макс 20 |
| `unit_rate` | float | ❌ | 0 | ≥ 0 |
| `pay_model` | string | ❌ | `per_unit` | `per_unit`\|`per_hour`\|`fixed`\|`single_unit`\|`time_based`\|`composite` |
| `pricing_schema` | object? | ❌ | null | JSON об'єкт довільної структури |

**Response** — `ProductTypeResponse`:
`{ id, company_id, name, description, unit, unit_rate, pay_model, pricing_schema, is_active, sort_order, created_at }`

### 5.2 GET `/companies/{cid}/products` — Список типів робіт
**Пагінація**: ✅

### 5.3 GET `/products/{pid}` — Деталі типу
### 5.4 PATCH `/products/{pid}` — Оновити (+ `is_active`, `sort_order`)
### 5.5 DELETE `/products/{pid}` — Soft-delete

### 5.6 POST `/companies/{cid}/materials` — Тип матеріалу
| Поле | Тип | Default | Валідація |
|---|---|---|---|
| `name` | string | — | 1–255 |
| `unit` | string | `unit` | макс 20 |
| `default_price` | float | 0 | ≥ 0 |

**Response**: `{ id, company_id, name, unit, default_price, is_active, sort_order, created_at }`

### 5.7 GET `/companies/{cid}/materials` — Список | **Пагінація**: ✅
### 5.8 PATCH `/materials/{mid}` — Оновити (+ `is_active`, `sort_order`)
### 5.9 DELETE `/materials/{mid}` — Soft-delete

### 5.10 POST `/orders/{oid}/materials` — Зафіксувати використання
**Роль**: owner, manager

| Поле | Тип | Обов'язкове |
|---|---|---|
| `material_type_id` | UUID | ✅ |
| `quantity` | float | ✅ (>0) |
| `notes` | string? | ❌ |

**Response**: `{ id, order_id, material_type_id, quantity, unit_cost_snapshot, notes, reported_by, created_at }`

### 5.11 GET `/orders/{oid}/materials` — Список використаних

### 5.12 POST `/companies/{cid}/absence-types` — Тип відсутності
| Поле | Тип | Default |
|---|---|---|
| `name` | string | — (1–100) |
| `is_paid` | bool | false |

**Response**: `{ id, company_id, name, is_paid, is_enabled, sort_order, created_at }`

### 5.13 GET `/companies/{cid}/absence-types` — Список
### 5.14 PATCH `/absence-types/{atid}` — Оновити (+ `is_enabled`, `sort_order`)

---

## 6. Orders (`/api/v1/orders`)

### 6.1 POST `/companies/{cid}/orders` — Створити замовлення
**Auth**: ✅ | **Роль**: owner, manager | **Status**: `201`

| Поле | Тип | Обов'язкове | Валідація | Опис |
|---|---|---|---|---|
| `product_type_id` | UUID | ✅ | — | Тип роботи |
| `title` | string | ✅ | 1–255 | Назва |
| `description` | string? | ❌ | макс 5000 | Опис |
| `notes` | string? | ❌ | макс 2000 | Нотатки |
| `order_number` | string? | ❌ | макс 50 | Номер замовлення |
| `order_date` | date? | ❌ | — | Default: today |
| `work_start_date` | date? | ❌ | — | Початок робіт |
| `due_date` | date? | ❌ | — | Дедлайн |
| `quantity` | float? | ❌ | > 0 | Кількість |
| `client_id` | UUID? | ❌ | — | Клієнт |
| `lead_worker_id` | UUID? | ❌ | — | Відповідальний |
| `priority` | string | ❌ | `low`\|`normal`\|`high`\|`urgent` | Default: `normal` |
| `address` | string? | ❌ | — | Адреса |

**Response** — `OrderResponse`:
| Поле | Тип | Опис |
|---|---|---|
| `id` | UUID | — |
| `company_id` | UUID | — |
| `product_type_id` | UUID | — |
| `client_id` | UUID? | — |
| `client_name` | string? | Ім'я клієнта (join) |
| `title` | string | — |
| `description` | string? | — |
| `notes` | string? | — |
| `status` | string | FSM стан |
| `assignments` | OrderAssignmentDetail[] | Призначені працівники |
| `order_number` | string? | — |
| `order_date` | date | — |
| `work_start_date` | date? | — |
| `due_date` | date? | — |
| `priority` | string | — |
| `lead_worker_id` | UUID? | — |
| `pay_model_snapshot` | string | Snapshot моделі оплати |
| `unit_rate_snapshot` | float | Snapshot ставки |
| `unit_snapshot` | string | Snapshot одиниці |
| `pricing_schema_snapshot` | object? | Snapshot pricing |
| `quantity` | float? | — |
| `address` | string? | — |
| `created_by` | UUID | — |
| `created_at` | datetime | — |

**OrderAssignmentDetail** (вкладено в assignments):
`{ member_id, full_name, is_lead, status, worker_done, payout_percentage?, created_at?, updated_at? }`

### 6.2 GET `/companies/{cid}/orders` — Список
**Пагінація**: ✅ | **Query**: `?status=in_progress`

### 6.3 GET `/orders/my` — Мої замовлення (worker)
**Query**: `?company_id=UUID` (обов'язковий) + пагінація

### 6.4 GET `/orders/{oid}` — Деталі
### 6.5 PATCH `/orders/{oid}` — Оновити (ті ж поля без product_type_id)
### 6.6 DELETE `/orders/{oid}` — Soft-delete

### 6.7 PUT `/orders/{oid}/status` — Змінити статус (FSM)
| Поле | Тип | Значення |
|---|---|---|
| `status` | string | `new`\|`in_progress`\|`blocked`\|`in_review`\|`dispute`\|`done` |

**FSM переходи**:
```
new         → in_progress, dispute
in_progress → blocked, in_review, done, dispute
blocked     → in_progress, dispute
in_review   → done, in_progress, dispute
dispute     → in_progress, in_review, done
done        → dispute
```

### 6.8 POST `/orders/{oid}/assign` — Призначити працівників
| Поле | Тип | Обов'язкове |
|---|---|---|
| `member_ids` | UUID[] | ✅ (min 1) |
| `lead_member_id` | UUID? | ❌ |

**Response**: `AssignmentResponse[]`
`{ id, order_id, member_id, assigned_by, status, is_lead, worker_done, created_at }`

### 6.9 POST `/orders/{oid}/payment-split` — Розподіл оплати (per_job)
```json
{ "splits": [{ "member_id": "uuid", "percentage": 60.0 }] }
```
`percentage`: 0 < x ≤ 100, сума = 100%

### 6.10 POST `/orders/{oid}/duplicate` — Дублювати (`201`)
### 6.11 POST `/orders/{oid}/worker-start` — Worker почав роботу
### 6.12 POST `/orders/{oid}/worker-done` — Worker завершив
| Поле | Тип | Обов'язкове |
|---|---|---|
| `notes` | string? | ❌ |

---

## 7. TimeLogs (`/api/v1/timelogs`)

### 7.1 POST `/` — Подати табель
**Auth**: ✅ JWT | **Status**: `201` | **Ідемпотентність**: 409 на дублікат

| Поле | Тип | Обов'язкове | Валідація |
|---|---|---|---|
| `order_id` | UUID | ✅ | — |
| `work_date` | date | ✅ | — |
| `start_time` | time? | ❌ | HH:MM:SS |
| `end_time` | time? | ❌ | HH:MM:SS |
| `breaks` | BreakCreate[] | ❌ | макс 5, не перетинаються |
| `notes` | string? | ❌ | макс 500 |
| `quantity_done` | float? | ❌ | > 0 |

**BreakCreate**: `{ start_time: time, end_time: time }`

**Response** — `TimeLogResponse`:
| Поле | Тип | Опис |
|---|---|---|
| `id` | UUID | — |
| `member_id` | UUID | Працівник |
| `order_id` | UUID | Замовлення |
| `company_id` | UUID | — |
| `work_date` | date | — |
| `start_time` | time? | — |
| `end_time` | time? | — |
| `gross_hours` | float | Загальні години |
| `break_hours` | float | Години перерв |
| `net_hours` | float | Чисті робочі години |
| `overtime_hours` | float | Понаднормові (авторозрахунок) |
| `status` | string | — |
| `notes` | string? | — |
| `quantity_done` | float? | — |
| `created_at` | datetime | — |

### 7.2 GET `/companies/{cid}` — Список табелів
**Query**: `?member_id=UUID&order_id=UUID` + пагінація

### 7.3 GET `/orders/{oid}/timelogs` — Табелі по замовленню
### 7.4 GET `/my` — Мої табелі | **Query**: `?company_id=UUID`
### 7.5 PATCH `/{tid}` — Оновити табель
### 7.6 GET `/{tid}` — Деталі табелю

---

## 8. Clients (`/api/v1/clients`)

### 8.1 POST `/companies/{cid}/clients` — Створити
**Status**: `201` | ⚠️ Перевірка `client_limit`

| Поле | Тип | Обов'язкове |
|---|---|---|
| `name` | string | ✅ (1–255) |
| `email` | string? | ❌ |
| `phone` | string? | ❌ (макс 50) |
| `address` | string? | ❌ |
| `notes` | string? | ❌ |

**Response**: `{ id, company_id, name, email, phone, address, notes, is_active, created_at }`

### 8.2 GET `/companies/{cid}/clients` — Список | **Пагінація**: ✅
### 8.3 GET `/clients/{clid}` — Деталі
### 8.4 PATCH `/clients/{clid}` — Оновити (+ `is_active`)
### 8.5 DELETE `/clients/{clid}` — Soft-delete

---

## 9. Finance (`/api/v1/finance`)

### 9.1 POST `/companies/{cid}/advances` — Видати аванс
**Роль**: owner, manager | **Status**: `201`

| Поле | Тип | Обов'язкове | Валідація |
|---|---|---|---|
| `member_id` | UUID | ✅ | — |
| `amount` | float | ✅ | > 0 |
| `currency` | string | ❌ | макс 3, default: `UAH` |
| `advance_date` | date | ✅ | — |
| `notes` | string? | ❌ | макс 500 |

**Response**: `{ id, company_id, member_id, amount, currency, advance_date, notes, issued_by, created_at }`

### 9.2 GET `/companies/{cid}/advances` — Список
**Query**: `?member_id=UUID` + пагінація

### 9.3 POST `/companies/{cid}/adjustments` — Корекція
| Поле | Тип | Обов'язкове | Валідація |
|---|---|---|---|
| `member_id` | UUID | ✅ | — |
| `order_id` | UUID? | ❌ | — |
| `adjustment_type` | string | ✅ | `bonus`\|`penalty`\|`deduction`\|`refund` |
| `amount` | float | ✅ | > 0 |
| `currency` | string | ❌ | макс 3, default: `UAH` |
| `reason` | string | ✅ | мін 5 символів |

**Response**: `{ id, company_id, member_id, order_id, adjustment_type, amount, currency, reason, created_by, created_at }`

### 9.4 GET `/companies/{cid}/adjustments` — Список | **Query**: `?member_id=UUID`

### 9.5 GET `/companies/{cid}/balance/{mid}` — Баланс працівника
**⚠️ Worker бачить тільки свій** | `{ member_id, total_earned, total_advances, balance, currency }`

### 9.6 GET `/companies/{cid}/balance/{mid}/history` — Історія
**Response**: `{ member_id, transactions: BalanceTransactionEntry[], total, currency }`

**BalanceTransactionEntry**:
| Поле | Тип | Значення |
|---|---|---|
| `date` | datetime | — |
| `transaction_type` | string | `earning`\|`advance`\|`bonus`\|`penalty`\|`deduction`\|`refund` |
| `amount` | float | — |
| `description` | string | — |
| `order_title` | string? | — |

### 9.7 GET `/companies/{cid}/members/{mid}/stats` — Статистика
**Response** — `MemberStatsResponse`:
```json
{
  "member_id": "uuid", "full_name": "Іван", "role": "worker",
  "total_orders": 25, "completed_orders": 20,
  "total_hours_worked": 180.5, "total_earned": 15200.0,
  "total_advances": 3000.0, "balance": 12200.0,
  "active_disputes": 1, "pending_absences": 0,
  "currency": "UAH"
}
```

### 9.8 GET `/companies/{cid}/dashboard` — Фінансовий dashboard
`{ total_payroll, total_advances, total_adjustments, total_balance, worker_count, currency }`

### 9.9 GET `/companies/{cid}/dashboard/stats` — Повна статистика (M1)
```json
{
  "total_orders": 50, "active_orders": 12, "completed_orders": 35,
  "total_workers": 15, "active_workers": 12,
  "total_payroll": 125000.0, "total_advances": 15000.0,
  "total_balance": 110000.0,
  "open_disputes": 3, "pending_absences": 2,
  "currency": "UAH"
}
```

### 9.10 GET `/products/{ptid}/rate-history` — Історія ставки
### 9.11 GET `/companies/{cid}/members/{mid}/rate-history` — Ставки працівника

**RateHistoryResponse**: `{ id, product_type_id, previous_rate, new_rate, changed_by, change_reason, created_at }`

### 9.12 GET `/companies/{cid}/export/finance` — CSV експорт
**Content-Type**: `text/csv` | **Filename**: `finance_{company_id}.csv`

---

## 10. Workflows (`/api/v1/workflows`)

### 10.1 POST `/companies/{cid}/absences` — Запит на відсутність
| Поле | Тип | Обов'язкове | Валідація |
|---|---|---|---|
| `start_date` | date | ✅ | — |
| `end_date` | date | ✅ | — |
| `reason` | string | ✅ | `vacation`\|`sick`\|`personal`\|`other` |
| `absence_type` | string | ❌ | макс 50, default: `other` |
| `description` | string? | ❌ | — |

**Response** — `AbsenceResponse`:
`{ id, company_id, member_id, start_date, end_date, reason, absence_type, description, status, reviewed_by, reviewed_at, review_comment, created_at, overlapping_orders_count }`

### 10.2 GET `/companies/{cid}/absences`
**Query**: `?worker_id=UUID&status=pending|approved|rejected`

### 10.3 PUT `/absences/{aid}/review`
| Поле | Тип | Значення |
|---|---|---|
| `status` | string | `approved` \| `rejected` |
| `review_comment` | string? | — |

### 10.4 POST `/companies/{cid}/disputes` — Диспут
| Поле | Тип | Обов'язкове | Валідація |
|---|---|---|---|
| `issue_type` | string | ✅ | `blocker` \| `correction` |
| `sub_type` | string? | ❌ | макс 50 |
| `target_type` | string | ✅ | `timelog`\|`order`\|`material` |
| `target_id` | UUID | ✅ | — |
| `order_id` | UUID? | ❌ | — |
| `description` | string | ✅ | мін 10 |
| `expected_value` | string? | ❌ | макс 200 |

**Response**: `DisputeResponse` з вкладеним `attachments[]`

### 10.5 GET `/companies/{cid}/disputes`
**Query**: `?order_id=UUID&worker_id=UUID&status=open|resolved`

### 10.6 PUT `/disputes/{did}/resolve`
| Поле | Значення |
|---|---|
| `status` | `approved`\|`rejected`\|`needs_clarification`\|`resolved` |
| `resolution` | string (мін 1) |

### 10.7 POST `/disputes/{did}/attachments` — Вкладення
| Поле | Тип | Валідація |
|---|---|---|
| `file_type` | string | `photo` \| `file` |
| `url` | string | мін 1 |
| `filename` | string | 1–255 |
| `file_size` | int | > 0 |

### 10.8 GET `/disputes/{did}/attachments` — Список

---

## 11. Content (`/api/v1/content`)

### 11.1 POST `/orders/{oid}/comments` — Коментар
| Поле | Тип | Валідація |
|---|---|---|
| `body` | string | 1–2000 |

**Response**: `{ id, order_id, author_id, body, created_at }`

### 11.2 GET `/orders/{oid}/comments` — Список

### 11.3 POST `/orders/{oid}/photos` — Метадані фото
| Поле | Тип | Обов'язкове | Валідація |
|---|---|---|---|
| `storage_path` | string | ✅ | макс 500 |
| `thumbnail_path` | string? | ❌ | — |
| `file_size_bytes` | int | ✅ | > 0, ≤ 10MB |
| `content_type` | string | ❌ | default: `image/jpeg` |
| `caption` | string? | ❌ | макс 255 |

> Файл → Supabase Storage напряму. Цей ендпоінт тільки метадані.

### 11.4 GET `/orders/{oid}/photos` — Список

---

## 12. Audit (`/api/v1/audit`)

### 12.1 GET `/companies/{cid}/audit` — Журнал аудиту
**Роль**: owner, manager | **Тариф**: Pro only | **Пагінація**: ✅
**Query**: `?entity_type=order&entity_id=UUID`

---

## 13. Public API (`/api/v1/public`)

### 13.1 POST `/companies/{cid}/keys` — Створити API ключ
**Auth**: ✅ JWT | **Роль**: owner | **Тариф**: Pro
**Request**: `{ "name": "Integration Key" }`

**Response** — `ApiKeyCreateResponse`:
```json
{
  "id": "uuid",
  "key": "lrk_live_a1b2c3d4...",  // ⚠️ показується ТІЛЬКИ РАЗ
  "key_prefix": "lrk_live_a1b2",
  "name": "Integration Key",
  "created_at": "..."
}
```

### 13.2 GET `/companies/{cid}/keys` — Список ключів
**Response**: `ApiKeyResponse[]` — `{ id, company_id, key_prefix, name, is_active, last_used_at, created_at }`

### 13.3 DELETE `/keys/{kid}` — Відкликати ключ

### 13.4 GET `/v1/orders` — Read-only замовлення
**Auth**: `X-API-Key` header | **Response**: `OrderResponse[]`

### 13.5 GET `/v1/timelogs` — Read-only табелі
**Auth**: `X-API-Key` header | **Response**: `TimeLogResponse[]`

---

## 14. System

### 14.1 GET `/health` — Shallow health check
### 14.2 GET `/health/ready` — Deep health check (DB ping)
