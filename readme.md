# VK Birthday Exporter
### Выгрузка дней рождений друзей в календарь

---

## Как поднять свой смобственный экземпляр программы:

1. Необходимо получить свой ID приложения Vkontakte (ищите и разбирайтесь в разделе разработчика VK). Приложение привязывается к домену через CORS, 
поэтому необходимо публиковать ваши файла под доменом, указанном в настройках Web-приложения VK, иначе JS API будет выдавать ошибку кросс-доменности.
2. В файле index.html в строке 100 необходимо установить ID вашего приложения VK, полученного в первом пункте.

Или просто воспользуйтесь одним из демо-проектов по ссылке ниже. JavaScript API VK используется только на фронте  На сервере никаких данных не получается и не сохраняется.

---

Используются:
* Используется [VK Javascript SDK](https://vk.com/dev/Javascript_SDK)
* Расширение [Bootstrap-table](https://github.com/wenzhixin/bootstrap-table)
* Библиотека для [создания ics](https://github.com/nwcell/ics.js)
* Работа с датами [Moment JS](http://momentjs.com/)


Ссылки
* Импорт в google calendar [ссылка](https://support.google.com/calendar/answer/37118)

---

DEMO:
    http://sboychenko.ru/project/vk-exporter
    http://ectica.io/vk/index.html
