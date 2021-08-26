const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express')
require('dotenv').config()

const db = require('./db')

// Запускаем сервер на порте, указанном в файле .env, или на порте 4000
const port = process.env.PORT || 4000
// Сохраняем значение DB_HOST в виде переменной
const DB_HOST = process.env.DB_HOST

let notes = [
    {id: '1', content: 'This is a note', author: 'Pa Pa'},
    {id: '2', content: 'This is a another note', author: 'Mar Ka'},
    {id: '3', content: 'Oh hey look, another note!', author: 'Chelsea'},
]

// Строим схему, используя язык схем GraphQL
const typeDefs = gql`
    type Note {
        id: ID!
        content: String!
        author: String!
    }
    type Query {
        hello: String!
        notes:[Note!]!
        note(id: ID!): Note!
    }
    type Mutation {
        newNote(content: String!): Note!
    }
`

// Предоставляем функцию распознавания для полей схемы
const resolvers = {
    Query: {
        hello: () => 'Hello World!',
        notes: () => notes,
        note: (parent, args) => {
            return notes.find(note=>note.id===args.id)
        }
    },
    Mutation: {
        newNote: ( parent, args ) => {
            let noteValue = {
                id: String(notes.length + 1),
                content: args.content,
                author: 'Pa Pa'
            }
            notes.push(noteValue)
            return noteValue
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