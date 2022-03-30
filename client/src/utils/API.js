// make a search to Tmdb api

export const searchTmdbMovies = (query) => {
  return fetch(`https://api.themoviedb.org/3/search/movie?api_key=2717866a802715a7ed0b60c733372a28&query=${query}`);
};