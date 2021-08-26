const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express')
require('dotenv').config()

const db = require('./db')
const models = require('./models')

// Запускаем сервер на порте, указанном в файле .env, или на порте 4000
const port = process.env.PORT || 4000
// Сохраняем значение DB_HOST в виде переменной
const DB_HOST = process.env.DB_HOST

// Строим схему, используя язык схем GraphQL
const typeDefs = gql`
    type Note {
        id: ID
        content: String
        author: String
    }
    type Query {
        hello: String
        notes:[Note]
        note(id: ID): Note
    }
    type Mutation {
        newNote(content: String!): Note
    }
`

// Предоставляем функцию распознавания для полей схемы
const resolvers = {
    Query: {
        hello: () => 'Hello World!',
        notes: async () => {
            return await models.Note.find()
        },
        note: async (parent, args) => {
            return await models.Note.findById(args.id)
        }
    },
    Mutation: {
        newNote: async (parent, args) => {
            return await models.Note.create({
                content: args.content,
                author: 'Pa Pa'
            })
        }
    }
}

const app = express();

// Подключаем БД
db.connect(DB_HOST)

// Настраиваем Apollo Server
const server = new ApolloServer({ typeDefs, resolvers })

// Применяем промежуточное ПО Apollo GraphQL и указываем путь к /api
server.applyMiddleware({ app, path: '/api' })

app.get('/', (req, res) => res.send('Hello Web Server!!!!'));
app.listen(port, () => console.log(`GraphQL Server running at http://localhost:${port}${server.graphqlPath}`));