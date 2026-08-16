# IPM Connections

Внутренний веб-сервис команды поддержки. Заменил Excel-файл, в котором хранились подключения к предприятиям, график дежурств и техническая информация.

Рабочая версия: https://ArtemiyPv7.github.io/IPM-Connections/

## Что умеет

### Заводы и подключения
- Master-detail: слева список (поиск по названию, алиасам, версиям, группам; избранные ★ сверху), справа паспорт завода. На узких экранах паспорт открывается поверх со кнопкой «‹ Заводы».
- Строка завода: плитка протокола, название, версии сервера и КПЛ, названия торговых групп.
- Паспорт: мета-чипы (Сервер/КПЛ, контуры, группы «порт — группа», статус версии) и секции «Способы подключения», «Дополнительно», «Файлы и ссылки», «История и заметки».
- Подключения 11 типов с фирменными SVG-знаками (AnyDesk, RDP, VPN, OpenVPN, WireGuard, VNC, RuDesktop, RustDesk, Ammyy, Kontur, свой тип).
- Цепочки подключений (например, VPN → RDP): одна карточка с нумерацией шагов; задаётся полями «Цепочка» и «Номер шага».
- Секреты под защитой: пароли и секретные поля выглядят как ••••••••, 👁 открывает, копи-кнопка (SVG) копирует точное значение. Каждое копирование попадает в журнал.
- Быстрый запуск: открытие AnyDesk по ID, скачивание готового `.rdp`, ссылки на конфиги и веб — в «Файлах и ссылках».
- Отметка «проверено» на подключениях — видно, насколько данные свежие.
- Полное редактирование для админа: заводы, подключения, доп. поля, заметки; все формы — в модальных окнах.

### Дежурства
- Сводка-чипы: кто дежурит сейчас (смена 8:00–8:00), ближайшие дни рождения («через N дней»), активные и ближайшие отпуска.
- Календарь: слева список месяцев с переключением года, справа выбранный месяц; на широких экранах (≥1536px) — два месяца рядом, на мобильных — компактная агенда.
- Подсветка всех смен сотрудника по клику на имя (в календаре и в списке «Сотрудники»).
- Переработки: точка в ячейке, итоги — в Excel-выгрузке.
- Отпуска: тонировка дней в календаре, управление в раскрывающейся карточке.
- «Сотрудники» и «Отпуска» — раскрывающиеся карточки (свёрнуты по умолчанию), добавление и редактирование в модалках.
- Экспорт месяца в `.xlsx` с итогами по каждому сотруднику.

### Экспорт
- Полная выгрузка всех данных в `.xlsx` (7 листов): предприятия, подключения с паролями, доп. поля, история, люди, дежурства.

### Журнал действий (логи)
- События: входы/выходы, неудачные попытки входа, истечение сессии, просмотры заводов, копирования, экспорты, создание/изменение/удаление заводов, подключений, смен, сотрудников, отпусков.
- По каждому событию: кто, когда, с какого IP и из какого браузера (отпечаток устройства).
- Журнал видит только роль `dev` — отдельная страница «Логи» с поиском-фильтром и мини-дашбордом (входы по дням, топ заводов, кто сколько копирует).

### UX
- Две темы: тёмная и светлая. Переключатель в шапке, выбор хранится в браузере и применяется до загрузки React (без «вспышки»).
- Интерфейс в скруглённом «окне», пружинистые анимации, модальные окна, тост-уведомления.
- Заголовки вкладок меняются по страницам.
- Шрифты: Inter (интерфейс) + JetBrains Mono (адреса, пароли, версии).

## Роли и доступ

| Роль | Права |
|---|---|
| `admin` | всё: редактирование заводов, подключений, дежурств, сотрудников, отпусков |
| `support` | только просмотр и копирование |
| `dev` | только страница «Логи» (журнал действий) и мини-дашборд, без основного интерфейса |

Вход — по паролю одного из трёх служебных аккаунтов (`admin@ipm.local`, `support@ipm.local`, `dev@ipm.local`). Сессия живёт 6 часов, после чего автоматически разлогинивает.

## Стек

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS 3, react-router (HashRouter)
- **База и авторизация:** Supabase (PostgreSQL + Auth, Row Level Security)
- **Экспорт:** SheetJS (`xlsx`)
- **Шрифты:** @fontsource (Inter, JetBrains Mono)
- **Деплой:** GitHub Pages (`gh-pages`)

## Структура

```
src/
app/           # Layout — «окно» с шапкой, навигацией и переключателем темы
shared/        # общее для всех фич:
               #   types, lib (format, storage, errors, audit),
               #   hooks (useRole, usePageTitle),
               #   ui (styles, Modal, Collapsible, Field, CopyButton, SecretValue,
               #       EmptyState, Skeleton, ToastHost, KeyValueEditor)
features/      # логика по доменам:
auth/          #   вход по паролю + логирование входов
companies/     #   api, избранное, плитки протоколов (protocols.ts, ProtocolTile),
               #   разбор групп (groups.ts), паспорт завода (CompanyPassport),
               #   карточки подключений (ConnectionCard, ConnectionDetails, ChainCard),
               #   формы (CompanyForm, ConnectionForm), FilesLinksSection, HistorySection
duty/          #   календарь (calendar.ts), api дежурств и отпусков, экспорт месяца,
               #   DutyPage (master-detail), MonthGrid, MonthAgenda, DutySummary,
               #   PeopleManager, VacationsManager, OnDutyNow
export/        #   полный экспорт в .xlsx (buildWorkbook.ts)
dev/           #   мини-дашборд и статистика для роли dev
pages/         # тонкие страницы: Companies (master-detail), Duty, Export, Login, Logs
lib/           # типизированный клиент supabase, database.types.ts, toast.ts
App.tsx        # роутинг, проверка сессии, лимит 6 часов, разделение по ролям
main.tsx       # входная точка и подключение шрифтов
index.css      # токены тем (тёмная/светлая), карточки, поля, кнопки, календарь, анимации
```

## База данных

| Таблица | Назначение |
|---|---|
| `profiles` | пользователи и роли (admin / support / dev) |
| `companies` | предприятия: версии, контуры, группы, статусы |
| `connections` | подключения: тип, адрес, логин, пароль, конфиги; `chain_id`/`chain_step` для цепочек |
| `connection_fields` | доп. поля подключений (ключ-значение, флаг `is_secret`) |
| `company_fields` | доп. поля заводов (ЭЦП, ссылки, пароли КПЛ; флаг `is_secret`) |
| `company_history` | заметки и история по заводу |
| `people` | сотрудники, дни рождения, флаг «может дежурить» |
| `duty_assignments` | график дежурств с часами переработки |
| `vacations` | отпуска: сотрудник, период, примечание |
| `audit_log` | журнал действий: кто, когда, IP, браузер; читает только `dev` |

Доступ защищён Row Level Security: чтение — для авторизованных, запись — только для `admin`. `audit_log` на запись открыт авторизованным и анонимам (чтобы фиксировать неудачные попытки входа), на чтение — только `dev`; изменение и удаление записей запрещено.

## Локальный запуск

```bash
git clone https://github.com/ArtemiyPv7/IPM-Connections.git
cd IPM-Connections
npm install
```

Создай файл `.env` (не коммитится, лежит в `.gitignore`):

```
VITE_SUPABASE_URL=https://ваш-проект.supabase.co
VITE_SUPABASE_ANON_KEY=ваш_publishable_ключ
```

```bash
npm run dev        # http://localhost:5173
```

## Миграции

Применяются вручную в Supabase (SQL Editor):

```sql
-- Цепочки подключений
alter table connections add column if not exists chain_id text;
alter table connections add column if not exists chain_step integer not null default 0;

-- Отпуска
create table if not exists public.vacations (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  date_start date not null,
  date_end date not null,
  note text,
  created_at timestamptz not null default now()
);
alter table public.vacations enable row level security;
create policy "vacations_select" on public.vacations
  for select to authenticated using (true);
create policy "vacations_admin_insert" on public.vacations
  for insert to authenticated
  with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));
create policy "vacations_admin_update" on public.vacations
  for update to authenticated
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));
create policy "vacations_admin_delete" on public.vacations
  for delete to authenticated
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));
```

## Сборка и деплой

```bash
npm run build      # сборка в dist/
npm run deploy     # публикация dist/ в ветку gh-pages
git add . && git commit -m "..." && git push
```

## Безопасность

- `.env` не попадает в репозиторий; в сборку уходит только publishable-ключ Supabase.
- Все таблицы под Row Level Security; анонимный доступ к данным закрыт.
- Журнал действий append-only: изменение и удаление записей запрещено политиками.
- Сессия ограничена 6 часами.
- Секреты скрываются в интерфейсе, но доставляются клиенту для копирования — доступ к ним контролируется RLS и ролями.
- Формы подключений не провоцируют менеджеры паролей браузера (маска через `-webkit-text-security`).