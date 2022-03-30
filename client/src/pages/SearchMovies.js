import React, { useState, useEffect } from 'react';
import { Jumbotron, Container, Col, Form, Button, Card, CardColumns } from 'react-bootstrap';
import { useMutation } from '@apollo/react-hooks';

import Auth from '../utils/auth';
import { SAVE_MOVIE } from '../utils/mutations';
import { searchTmdbMovies } from '../utils/API';
import { saveMovieIds, getSavedMovieIds } from '../utils/localStorage';

const SearchMovies = () => {
    const [saveMovie] = useMutation(SAVE_MOVIE);

    // create state for holding returned Tmdb api data
    const [searchedMovies, setSearchedMovies] = useState([]);
    // create state for holding our search field data
    const [searchInput, setSearchInput] = useState('');

    // create state to hold saved movieId values
    const [savedMovieIds, setSavedMovieIds] = useState(getSavedMovieIds());

    // set up useEffect hook to save `savedMovieIds` list to localStorage on component unmount
    // learn more here: https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup
    useEffect(() => {
        return () => saveMovieIds(savedMovieIds);
    });

    // create method to search for movies and set state on form submit
    const handleFormSubmit = async (event) => {
        event.preventDefault();

        if (!searchInput) {
            return false;
        }

        try {
            const response = await searchTmdbMovies(searchInput);

            if (!response.ok) {
                throw new Error('something went wrong!');
            }

            const { results } = await response.json();

            const movieData = results.map((results) => ({
                movieId: results.id,
                release: results.release_date || ['No date to display'],
                title: results.title,
                description: results.overview,
                image: results.poster_path || '',
            }));

            setSearchedMovies(movieData);
            setSearchInput('');
        } catch (err) {
            console.error(err);
        }
    };

    // create function to handle saving a movie to our database
    const handleSaveMovie = async (movieId) => {
        // find the movie in `searchedMovies` state by the matching id
        const movie = searchedMovies.find((movie) => movie.movieId === movieId);

        // get token
        const token = Auth.loggedIn() ? Auth.getToken() : null;

        if (!token) {
            return false;
        }

        try {
            // use SAVE_MOVIE mutation
            await saveMovie({
                variables: { movie }
            });

            // if movie successfully saves to user's account, save movie id to state
            setSavedMovieIds([...savedMovieIds, movie.movieId]);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <Jumbotron fluid className='text-light bg-dark'>
                <Container>
                    <h1>Search for Movies!</h1>
                    <Form onSubmit={handleFormSubmit}>
                        <Form.Row>
                            <Col xs={12} md={8}>
                                <Form.Control
                                name='searchInput'
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                type='text'
                                size='lg'
                                placeholder='Search for a movie'
                                />
                            </Col>
                            <Col xs={12} md={4}>
                                <Button type='submit' variant='success' size='lg '>
                                Submit Search
                                </Button>
                            </Col>
                        </Form.Row>
                    </Form>
                </Container>
            </Jumbotron>

            <Container>
                <h2>
                    {searchedMovies.length
                        ? `Viewing ${searchedMovies.length} results:`
                        : 'Search for a movie to begin'}
                </h2>
                <CardColumns>
                    {searchedMovies.map((movie) => {
                        return (
                        <Card key={movie.movieId} border='dark'>
                            {movie.image ? (
                                <Card.Img src={`https://image.tmdb.org/t/p/w500${movie.image}`} alt={`The cover for ${movie.title}`} variant='top' />
                                ) : null}
                            <Card.Body>
                            <Card.Title>{movie.title}</Card.Title>
                            <p className='small'>Release Date: {movie.release}</p>
                            <Card.Text>{movie.description}</Card.Text>
                            {Auth.loggedIn() && (
                                <Button
                                    disabled={savedMovieIds?.some((savedMovieId) => savedMovieId === movie.movieId)}
                                    className='btn-block btn-info'
                                    onClick={() => handleSaveMovie(movie.movieId)}>
                                    {savedMovieIds?.some((savedMovieId) => savedMovieId === movie.movieId)
                                        ? 'This movie has already been saved!'
                                        : 'Save this Movie!'}
                                </Button>
                            )}
                            </Card.Body>
                        </Card>
                        );
                    })}
                </CardColumns>
            </Container>
        </>
    );
};

export default SearchMovies;