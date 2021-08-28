const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');
const cors = require('cors');
const helmet = require('helmet')
const express = require('express');
const { ApolloServer} = require('apollo-server-express')
require('dotenv').config()

// Импортируем локальные модули
const db = require('./db')
const models = require('./models')
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const jwt = require('jsonwebtoken');

// Получаем информацию пользователя из JWT
const getUser = token => {
    if (token) {
        try {
            // Возвращаем информацию пользователя из токена
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            // Если с токеном возникла проблема, выбрасываем ошибку
            new Error('Session invalid');
        }
    }
}

// Запускаем сервер на порте, указанном в файле .env, или на порте 4000
const port = process.env.PORT || 4000
const DB_HOST = process.env.DB_HOST

const app = express();
app.use(helmet());
app.use(cors());

// Подключаем БД
db.connect(DB_HOST)

// Обновляем код ApolloServer, добавив validationRules
const server = new ApolloServer({
    typeDefs,
    resolvers,
    validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
    context: async ({ req }) => {
        // Получаем из заголовков токен пользователя
        const token = req.headers.authorization;
        // Пробуем извлечь пользователя с помощью токена
        const user = await getUser(token);
        // Добавляем модели БД и пользователя в контекст
        return { models, user };
    }
})

// Применяем промежуточное ПО Apollo GraphQL и указываем путь к /api
server.applyMiddleware({ app, path: '/api' })

// app.get('/', (req, res) => res.send('Hello Web Server!!!!'));
app.listen(port, () => console.log(`GraphQL Server running at http://localhost:${port}${server.graphqlPath}`));