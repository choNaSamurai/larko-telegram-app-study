# Система нотифікацій — Larko Backend

> Модуль `app/features/notifications/` — внутрішній сервіс (без API ендпоінтів).
> Нотифікації надсилаються автоматично при бізнес-подіях через Telegram Bot API та Email.

---

## Архітектура

```
┌─────────────────────────────────────────────────────┐
│                NotificationService                   │
│        .trigger(event, recipient_id, context)        │
├──────────────────────┬──────────────────────────────┤
│  TelegramNotifier    │     EmailNotifier            │
│  (Bot API, retry x3) │     (SendGrid/Resend)        │
└──────────────────────┴──────────────────────────────┘
```

### Канали доставки

| Канал | Статус | Технологія | Retry |
|---|---|---|---|
| `telegram` | ✅ Реалізовано | Telegram Bot API (`httpx`) | 3 спроби |
| `email` | ⏳ Stub | SendGrid / Resend | — |

### Env змінні

| Змінна | Опис | Обов'язкове |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота | Так (для Telegram) |
| `EMAIL_API_KEY` | API ключ email провайдера | Ні (stub) |

---

## Події (10 типів)

### 1. `order.status_changed` — Статус замовлення змінено
**Тригер**: `OrderService.change_status()`
**Отримувач**: Призначені workers

```
📋 Статус замовлення змінено
Замовлення "Монтаж вікон" → in_progress
```

| Контекст | Тип | Опис |
|---|---|---|
| `order_title` | string | Назва замовлення |
| `new_status` | string | Новий статус |

---

### 2. `order.worker_assigned` — Працівника призначено
**Тригер**: `OrderService.assign_workers()`
**Отримувач**: Призначений worker

```
👷 Вас призначено на замовлення
Ви призначені на замовлення "Монтаж вікон"
```

| Контекст | Тип |
|---|---|
| `order_title` | string |

---

### 3. `order.completed` — Замовлення завершено
**Тригер**: `OrderService.change_status()` → `done`
**Отримувач**: Всі workers + manager

```
✅ Замовлення завершено
Замовлення "Монтаж вікон" — завершено
```

| Контекст | Тип |
|---|---|
| `order_title` | string |

---

### 4. `worker.done_signaled` — Працівник завершив роботу
**Тригер**: `OrderService.signal_worker_done()`
**Отримувач**: Manager / Owner

```
🏁 Працівник завершив роботу
Іван Петренко позначив роботу як виконану на "Монтаж вікон"
```

| Контекст | Тип |
|---|---|
| `worker_name` | string |
| `order_title` | string |

---

### 5. `dispute.filed` — Подано скаргу
**Тригер**: `WorkflowService.create_dispute()`
**Отримувач**: Manager / Owner

```
⚠️ Нова скарга
Подано скаргу (blocker) для замовлення "Монтаж вікон"
```

| Контекст | Тип |
|---|---|
| `issue_type` | string (`blocker` \| `correction`) |
| `order_title` | string |

---

### 6. `dispute.resolved` — Скаргу вирішено
**Тригер**: `WorkflowService.resolve_dispute()`
**Отримувач**: Worker (filed_by)

```
✔️ Скаргу вирішено
Скаргу для "Монтаж вікон" — approved
```

| Контекст | Тип |
|---|---|
| `order_title` | string |
| `resolution_status` | string |

---

### 7. `absence.requested` — Запит на відсутність
**Тригер**: `WorkflowService.create_absence()`
**Отримувач**: Manager / Owner

```
🏖 Запит на відсутність
Іван Петренко запитує відсутність 2026-04-01 — 2026-04-05
```

| Контекст | Тип |
|---|---|
| `worker_name` | string |
| `start_date` | string |
| `end_date` | string |

---

### 8. `absence.reviewed` — Відповідь на запит
**Тригер**: `WorkflowService.review_absence()`
**Отримувач**: Worker (requester)

```
📝 Відповідь на запит відсутності
Ваш запит на відсутність: approved
```

| Контекст | Тип |
|---|---|
| `decision` | string (`approved` \| `rejected`) |

---

### 9. `finance.advance_issued` — Видано аванс
**Тригер**: `FinanceService.create_advance()`
**Отримувач**: Worker

```
💰 Видано аванс
Вам видано аванс 3000 UAH
```

| Контекст | Тип |
|---|---|
| `amount` | float |
| `currency` | string |

---

### 10. `finance.adjustment_created` — Корекція зарплати
**Тригер**: `FinanceService.create_adjustment()`
**Отримувач**: Worker

```
📊 Коригування зарплати
bonus: 500 UAH — Преміум за якісну роботу
```

| Контекст | Тип |
|---|---|
| `adjustment_type` | string |
| `amount` | float |
| `currency` | string |
| `reason` | string |

---

## Використання в коді

```python
from app.features.notifications.service import NotificationService, NotificationEvent

svc = NotificationService()

# Тригер через подію
await svc.trigger(
    NotificationEvent.ORDER_STATUS_CHANGED,
    recipient_id="123456789",  # telegram_id
    context={
        "order_title": "Монтаж вікон",
        "new_status": "in_progress",
    }
)

# Або напряму
from app.features.notifications.service import NotificationPayload

await svc.notify(NotificationPayload(
    recipient_id="user@example.com",
    subject="Тема",
    body="Текст повідомлення",
    channel="email",
))
```

---

## Зведена таблиця подій

| Подія | Отримувач | Канал | Emoji |
|---|---|---|---|
| `order.status_changed` | Workers | Telegram | 📋 |
| `order.worker_assigned` | Worker | Telegram | 👷 |
| `order.completed` | All | Telegram | ✅ |
| `worker.done_signaled` | Manager | Telegram | 🏁 |
| `dispute.filed` | Manager | Telegram | ⚠️ |
| `dispute.resolved` | Worker | Telegram | ✔️ |
| `absence.requested` | Manager | Telegram | 🏖 |
| `absence.reviewed` | Worker | Telegram | 📝 |
| `finance.advance_issued` | Worker | Telegram | 💰 |
| `finance.adjustment_created` | Worker | Telegram | 📊 |
