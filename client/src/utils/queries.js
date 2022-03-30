import gql from 'graphql-tag';

const GET_ME = gql`
    {
        me {
            _id
            username
            email
            movieCount
            savedMovies {
                movieId
                release
                description
                title
                image
                
            }
        }
    }
`;

export default GET_ME;