const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type User {
        _id: ID
        username: String
        email: String
        movieCount: String
        savedMovies: [Movie]
    }

    type Movie {
        movieId: Int
        release: [String]
        description: String
        title: String
        image: String
    }

    type Auth {
        token: ID!
        user: User
    }

    input MovieInput {
        movieId: Int
        release: [String]
        description: String
        title: String
        image: String
    }

    type Query {
        me: User
    }

    type Mutation {
        login(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        saveMovie(movie: MovieInput!): User
        removeMovie(movieId: Int): User
    }
`;

module.exports = typeDefs;