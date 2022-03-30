const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')

                return userData;
            }

            throw new AuthenticationError('Not logged in.')
        }
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const token = signToken(user);

            return { token, user };
        },
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        saveMovie: async (parent, { movie }, context) => {
            if (context.user) {
                const addMovie = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedMovies: movie } },
                    { new: true }
                );

                return addMovie;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
        removeMovie: async (parent, { movieId }, context) => {
            if (context.user) {
                const removeMovie = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedMovies: { movieId: movieId } } },
                    { new: true }
                );

                return removeMovie;
            }

            throw new AuthenticationError('You need to be logged in!');
        }
    }
};

module.exports = resolvers;