# Study Calendar: локальный запуск

## local deployment

### Prerequisites

Установите Node.js версии `>= 22` и npm. Проверки этого репозитория выполнены
на Node.js `v22.22.1` и npm `9.2.0`.

Все команды ниже выполняются из корня репозитория.

### Install dependencies

Установите зависимости по lock-файлу:

```bash
npm ci
```

### Env/config

Конфигурация читается из переменных окружения процесса. Обязательная для
локального запуска переменная не нужна:

- `DATABASE_URL` — имя или путь к SQLite-файлу; если переменная не задана,
  используется `study-calendar.db` в текущем каталоге.
- `TELEGRAM_BOT_TOKEN` — нужен только для входа через Telegram.
- `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` — нужны только для входа через
  Google.

В репозитории нет `.env.example` и отдельного env-шаблона. Перед запуском
задайте нужные значения в текущем shell, например:

```bash
export DATABASE_URL=./study-calendar.db
export TELEGRAM_BOT_TOKEN='...'
export GOOGLE_CLIENT_ID='...'
export GOOGLE_CLIENT_SECRET='...'
```

Строки с provider secrets нужны только при проверке соответствующего login
flow; для запуска приложения и открытия главной страницы достаточно не задавать
их.

### Database setup, migrations and seed

Отдельные команды setup, migrations и seed в проекте не предусмотрены. При
первом обращении приложения к базе `better-sqlite3` открывает файл из
`DATABASE_URL`, а `SharedDatabase` создаёт таблицы через
`CREATE TABLE IF NOT EXISTS`.

Начальные данные автоматически не загружаются: seed-скрипта нет.

### Dev server URL

Запустите dev server:

```bash
npm run dev -- --host 127.0.0.1
```

Откройте [http://127.0.0.1:5173/](http://127.0.0.1:5173/). Адрес и порт
соответствуют локальному smoke-пути Vite; фактический адрес также печатается в
терминале при запуске.

### Test and build

Проверки проекта:

```bash
npm run check
npm run test
npm run build
```

`npm run check` запускает `svelte-check`, `npm run test` — Vitest, а
`npm run build` собирает production build.

### Stop

В терминале с dev server нажмите `Ctrl+C`.
