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

#### Настройка Google OAuth

В Google Cloud Console создайте OAuth client типа **Web application** и
добавьте точный redirect URI:

```text
http://127.0.0.1:5173/auth/google/callback
```

Для production укажите тот же путь на HTTPS-домене приложения. Схема, host,
path и trailing slash должны совпадать полностью, иначе Google вернёт
`redirect_uri_mismatch`. Client ID и secret передаются только серверу через
`GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET`.

#### Первый локальный Admin

После реализации `TASK-029` создайте первого Admin только локальной
интерактивной CLI-командой, используя ту же базу, что и приложение:

```bash
export DATABASE_URL=./study-calendar.db
npm run bootstrap:admin
```

Команда запросит email и пароль локально; ввод пароля скрыт. Не передавайте
пароль аргументом командной строки и не сохраняйте его в shell history, env,
логах, чате или репозитории. Bootstrap разрешён только при пустой таблице
`accounts`, создаёт Admin account и password credential атомарно и закрыто
отказывает при повторном запуске. Откройте `/login`, введите тот же email и
пароль в браузерной форме (email нормализуется как `trim().toLowerCase()`),
затем создайте центр в защищённой Admin-поверхности.

#### Настройка Telegram Login

1. Создайте бота через `@BotFather` командой `/newbot`. Сохраните token только в
   локальной переменной `TELEGRAM_BOT_TOKEN`; не отправляйте его в чат и не
   записывайте в репозиторий.
2. В `@BotFather` откройте настройки созданного бота и добавьте публичный HTTPS
   origin приложения в **Web Login / Allowed URLs**. В интерфейсе, где эта
   настройка представлена старой командой, используйте `/setdomain` и укажите
   тот же публичный домен.
3. Для live-smoke нужен доступный Telegram публичный HTTPS origin. Временный
   tunnel допустим, но в репозитории `cloudflared`/`ngrok` не установлен и не
   управляется приложением. Запустите сервер с token, откройте
   `https://<ваш-домен>/login` и выберите Telegram; callback приложения будет
   `https://<ваш-домен>/auth/telegram/callback`.

Приложение проверяет callback на сервере по `hash`, `auth_date` и bot token;
роль, центр и membership из callback не принимаются.

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

Начальные данные автоматически не загружаются: общего seed-скрипта нет. Первый
Admin создаётся один раз server-only email/password командой из раздела выше;
ручной SQL не требуется. Центр, membership, классы и приглашения после этого
создаются Admin в браузере; вручную создавать центр в БД не требуется.

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
