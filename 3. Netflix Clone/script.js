function init() {
    buildMovieSection(trending.results, "Trending Now");
    fetchAndBuildAllSections();
}

//fetches each genres and builds sections for it
function fetchAndBuildAllSections() {
    const categories = genre_data["genre"];
    if(Array.isArray(categories) && categories.length) {
        categories.forEach(category => {
            fetchMovie(category);
        })
    }
}

//returns results array that have genre id
function getMoviesByGenreId(genreId) {
    return tmdb_example.results.filter(movie => movie.genre_ids.includes(genreId));
}

//fetches each movies with different genre ids
function fetchMovie(category) {
    const category_id = category["id"];
    const category_name = category["name"];

    const movies = getMoviesByGenreId(category_id);
    if(Array.isArray(movies) && movies.length) {
        buildMovieSection(movies, category_name);
    }
}

//builds movie sections
function buildMovieSection(list, category_name) {
    console.log(list, category_name);

    const movieListHTML = list.map(item => {
        return `
        <div class="movie-item">
            <img src="${item.backdrop_path}" alt="${item.title}">
        </div>
        `;
    }).join(''); 

    const movieSectionHTML = `
    <div class="movie-section">
        <h2 class="movie-section-heading">${category_name} <span class="explore-nudge">Explore All</span></h2>
        <div class="movie-row">
            ${movieListHTML}
        </div>
    </div>
    `;

    $("#movie-section").append(movieSectionHTML);
}

$(document).ready(() => {
   init(); 
});