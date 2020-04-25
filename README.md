# CI Build Server

## Принцип работы
Есть очередь билдов на обработку и хранилище агентов. 

Сервер стартует:
- начинается заполняться очередь
- запускается loop заполнения очереди (период опроса задан в конфигах REQUEST_PERIOD - мин.)
- подписка на события

События:
- когда агент регистрируется, ему назначается билд из очереди
- когда агент освобождается, ему назначается билд из очереди
- когда очередь заполняется, смотрим есть ли свободные агенты и разбираем очередь

Заполнение очереди:
- вытаскиваются из базы (через shri api) все билды. Фильтруются по сатусам "Waiting" и "InProgress" и тех что не заняты в агентах. "InProgress" нужен для обработки билдов, если агент(-ты) отвалились

Регистрация агента:
- проверяется есть ли агент в хранилище и если его нет, то добавляется в хранилище

Для решения проблем с connect и ошибками типа 500 используется retry помощник в папке helpers.

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Usage](#usage)

## About <a name = "about"></a>

Build server for continuous integration system.
- https://github.com/MOTORIST/shri-2020-homework-node
- https://github.com/MOTORIST/shri-2020-homework-node-build-server
- https://github.com/MOTORIST/shri-2020-homework-node-build-agent

## Getting Started <a name = "getting_started"></a>

### Installing

```
git clone https://github.com/MOTORIST/shri-2020-homework-node-build-server.git

cd shri-2020-homework-node-build-server && yarn install

rename .env.example to .env

set API_TOKEN=....
```

NOTE! If set ENV=dev, build server events will be displayed.

## Usage <a name = "usage"></a>

```
yarn start
or 
yarn dev
```
