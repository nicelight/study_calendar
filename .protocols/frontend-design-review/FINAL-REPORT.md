# Frontend design review — финальный QA

Дата: 2026-09-06  
Сервер: `http://127.0.0.1:5175`  
Browser: Chromium channel `chrome`  
Данные: только `/home/serg/Projects/study_calendar/tmp/frontend-review-20260906.db`

## Покрытие

Сняты desktop `1440×1000` и mobile `390×844` для public/login, student и
parent calendar/lesson, admin home/profile/statistics/center/finance.

Viewport-only mobile evidence:

- [admin](./mobile-390x844-admin-viewport.png)
- [finance](./mobile-390x844-finance-viewport.png)

Ключевые обновлённые снимки:

- [public desktop](./wide-1440x1000-public-refresh.png)
- [public mobile](./mobile-390x844-public-refresh.png)
- [student calendar mobile](./mobile-390x844-calendar-student-refresh.png)
- [finance mobile full page](./mobile-390x844-admin-finance-refresh.png)

## Результаты

- Ключевые финальные навигации вернули HTTP `200`; в точечных проходах `pageerror`
  и `console.error`: `0`.
- Финансы mobile: `document.clientWidth=390`, `document.scrollWidth=390`,
  `documentOverflow=false`. Единственный намеренный overflow — `.table-wrap`:
  `clientWidth=319`, `scrollWidth=1042`, `overflow-x:auto`.
- Admin mobile: `clientWidth=390`, `scrollWidth=390`, overflow отсутствует.
  DOM-проверка видит только скрытые `.sr-only` элементы с `overflow-x:hidden`.
- Calendar mobile: document overflow отсутствует; недели прокручиваются внутри
  `.week` (`324 → 515px`), что сохраняет elastic tracks.
- Public mobile: document overflow отсутствует; недельный внутренний scroll
  (`324 → 505px`) ожидаем.
- Поля даты на public/calendar: `44px`, `16px`.
- Finance/Admin controls: видимые поля и кнопки `44–48.8px`, `16px`.
- В idle `TaskDuration` delta: Admin `0.000156s`, Finance `0.000177s` за
  короткое окно наблюдения; это локальный снимок, не общая гарантия CPU.
- При `prefers-reduced-motion: reduce`: media query совпала, running animations `0`
  на Admin и Finance.
- Statistics keyboard: `Space` переключает `aria-sort` с `ascending` на
  `descending`, `Enter` возвращает `ascending`; ошибок нет.
- Smoke click по free day на стабильном сервере воспроизвёл переход на
  `&date=2026-08-03`; `elementFromPoint` попал в `.day-number` внутри
  `.day-link`, hydration готов. Предыдущий сбой не воспроизведён после HMR.

## Остаточные замечания

1. На auth calendar самый узкий `.day-link` измерен шириной `39.4px` при высоте
   `46.7px`; outer `.day` шире. Навигация работает, но строгий критерий touch
   target `≥44px` по ширине для этой elastic track не выполняется.
2. На узких calendar tracks подпись `Свободно` переносится внутри ячейки
   (`Свобо / дно`). Это устраняет обрезание и не создаёт document overflow, но
   остаётся компромиссом читаемости при сохранении elastic layout.

Оба замечания — presentation-only, server/business behavior не затрагивают.

## Безопасность QA

Исходники во время browser QA не изменялись. Реальные session tokens не записаны
в evidence или logs; synthetic admin session использовалась только в review DB и
после прохода отсутствует (`0` строк). Формы и POST-действия не отправлялись.
