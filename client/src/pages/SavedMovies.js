import React from 'react';
import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/react-hooks';

import Auth from '../utils/auth';
import GET_ME from '../utils/queries';
import { REMOVE_MOVIE } from '../utils/mutations';
import { removeMovieId } from '../utils/localStorage';

const SavedMovies = () => {
    const { loading, data } = useQuery(GET_ME);
    const [deleteMovie] = useMutation(REMOVE_MOVIE);
    const user = data?.me || {};

    // renders if data is not queried yet
    if (loading) {
        return <h2>LOADING...</h2>;
    }

    if (!user?.username) {
        return (
            <h4>
                You must be logged into see this page.
            </h4>
        )
    }

    // accepts movieId and deletes the movie from the database
    const handleDeleteMovie = async (movieId) => {
        const token = Auth.loggedIn() ? Auth.getToken() : null;

        if (!token) {
            return false;
        }

        try {
            // use REMOVE_MOVIE mutation
            await deleteMovie({ 
                variables: { movieId }
            });
            // upon success, remove movie's id from localStorage
            removeMovieId(movieId);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <Jumbotron fluid className='text-light bg-dark'>
                <Container>
                    <h1>Viewing saved movies!</h1>
                </Container>
            </Jumbotron>
            <Container>
                <h2>
                    {user.savedMovies.length
                        ? `Viewing ${user.savedMovies.length} saved ${user.savedMovies.length === 1 ? 'movie' : 'movies'}:`
                        : 'You have no saved movies!'}
                </h2>
                <CardColumns>
                    {user.savedMovies.map((movie) => {
                        return (
                            <Card key={movie.movieId} border='dark'>
                                {movie.image ? <Card.Img src={`https://image.tmdb.org/t/p/w500${movie.image}`} alt={`The cover for ${movie.title}`} variant='top' /> : null}
                                <Card.Body>
                                    <Card.Title>{movie.title}</Card.Title>
                                    <p className='small'>Release Date: {movie.release}</p>
                                    <Card.Text>{movie.description}</Card.Text>
                                    <Button className='btn-block btn-danger' onClick={() => handleDeleteMovie(movie.movieId)}>
                                        Delete this Movie!
                                    </Button>
                                </Card.Body>
                            </Card>
                        );
                    })}
                </CardColumns>
            </Container>
        </>
    );
};

export default SavedMovies;
