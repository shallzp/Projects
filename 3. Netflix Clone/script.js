const yt_api_key = "AIzaSyDE1-U79ej6aoXFkqJWRMw87WZX4JAr8gQ";
const yt_api_path = (query) => `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${yt_api_key}`;

function init() {
    fetchAndBuildTrending();
    fetchAndBuildAllSections();
    setupNavigationFiltering
}


function buildBanner(movie) {
    $("#banner-section").css("background-image", `url(${movie.banner})`);

    const bannerSectionHTML = `
    <div class="banner-content container">
        <h2 class="banner-title">${movie.title}</h2>
        <p class="banner-info">#4 in TV Shows Today</p>
        <p class="banner-overview">${movie.overview}</p>
        <div class="action-buttons">
            <button class="action"><img src="./images/icons/play.png">Play</button>
            <button class="action"><img src="./images/icons/info.png">More Info</button>
        </div>
    </div>
    `;

    $("#banner-section").append(bannerSectionHTML);
}

// Returns result array with popularity higher than the threshold
function getMoviesByPopularity(threshold) {
    return tmdb_example.results.filter(movie => movie.popularity > threshold);
}

function fetchAndBuildTrending() {
    const trending = getMoviesByPopularity(80);
    buildMovieSection(trending, "Trending Now");

    const randomIndex = Math.floor(Math.random() * trending.length);
    buildBanner(trending[randomIndex]);
}

// Fetches each genre and builds sections for it
function fetchAndBuildAllSections() {
    const categories = genre_data["genre"];
    if (Array.isArray(categories) && categories.length) {
        categories.forEach(category => {
            fetchMovie(category);
        });
    }
}

// Returns results array that have genre id
function getMoviesByGenreId(genreId) {
    return tmdb_example.results.filter(movie => movie.genre_ids.includes(genreId));
}

// Fetches each movie with different genre ids
function fetchMovie(category) {
    const category_id = category["id"];
    const category_name = category["name"];

    const movies = getMoviesByGenreId(category_id);
    if (Array.isArray(movies) && movies.length) {
        buildMovieSection(movies, category_name);
    }
}

// Builds movie sections
function buildMovieSection(list, category_name) {
    console.log(list, category_name);

    const movieListHTML = list.map(item => {
        return `
        <div class="movie-item" onmouseover="searchMovieTrailer('${item.title}', 'yt${item.id}')">
            <img class="movie-item-img" src="${item.backdrop_path}" alt="${item.title}">
            <div class="yt-iframe" id="yt${item.id}"></div>
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


function searchMovieTrailer(movieName, iframeId) {
    if (!movieName) return;

    fetch(yt_api_path(movieName))
    .then(res => res.json())
    .then(res => {
        const bestResult = res.items[0];
        const movieTrailerHTML = `
        <div>
            <iframe width="245px" height="137px" src="https://www.youtube.com/embed/${bestResult.id.videoId}?autoplay=1&controls=0"></iframe>
        </div>`;

        $(`#${iframeId}`).append(movieTrailerHTML);
    })
    .catch(err => console.log(err));
}


$(document).ready(() => {
    init();
    $(window).scroll(() => {
        if (window.scrollY > 2)
            $("#header").addClass("black-bg");
    });
});


// Navigation
function setupNavigationFiltering() {
    const navItems = document.querySelectorAll('.nav-items');

    navItems.forEach(item => {
        item.addEventListener('click', function () {
            const category = this.dataset.category;
            filterContent(category);
            setActiveNavItem(this);
        });
    });
}

function setActiveNavItem(activeItem) {
    const navItems = document.querySelectorAll('.nav-items');
    navItems.forEach(item => item.classList.remove('active'));
    activeItem.classList.add('active');
}

function filterContent(category) {
    const sections = document.querySelectorAll('.movie-section');
    sections.forEach(section => {
        if (category === 'all' || section.dataset.category === category) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}