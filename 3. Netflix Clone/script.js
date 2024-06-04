const yt_api_key = "AIzaSyDE1-U79ej6aoXFkqJWRMw87WZX4JAr8gQ";
const yt_api_path = (query) => `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${yt_api_key}`;


function init() {
    fetchAndBuildAllSections(tmdb_example, genre_data);

    setupNavigationFiltering();
    Hover();
}


function buildBanner(movieItem) {
    $("#banner-section").css("background-image", `url(${movieItem.banner})`);

    const bannerSectionHTML = `
    <div class="banner-content container">
        <h2 class="banner-title">${movieItem.title}</h2>
        <p class="banner-info">#4 in TV Shows Today</p>
        <p class="banner-overview">${movieItem.overview}</p>
        <div class="action-buttons">
            <button class="action"><img src="./images/icons/play.png">Play</button>
            <button class="action"><img src="./images/icons/info.png">More Info</button>
        </div>
    </div>
    `;

    $("#banner-section").append(bannerSectionHTML);
}


// Returns result array with popularity higher than the threshold
function getMoviesByPopularity(data, threshold) {
    return data.results.filter(movie => movie.popularity > threshold);
}

function fetchAndBuildTrending(data) {
    const trendingData = getMoviesByPopularity(data, 80);
    buildMovieSection(trendingData, "Trending Now");

    const randomIndex = Math.floor(Math.random() * trendingData.length);
    buildBanner(trendingData[randomIndex]);
}


// Fetches each genre and builds sections for it
function fetchAndBuildAllSections(data, genreData) {
    const genres = genreData["genre"];
  
    if (Array.isArray(genres) && genres.length) {
        fetchAndBuildTrending(tmdb_example);
        genres.forEach(genre => {
            fetchMovie(data, genre);
        });
    }
}  

// Returns results array that have genre id
function getMoviesByGenreId(data, genreId) {
    return data.results.filter(movie => movie.genre_ids.includes(genreId));
}

// Fetches each movie with different genre ids
function fetchMovie(data, genreItem) {
    const genre_id = genreItem["id"];
    const genre_name = genreItem["name"];

    const movies = getMoviesByGenreId(data, genre_id);
    if (Array.isArray(movies) && movies.length) {
        buildMovieSection(movies, genre_name);
    }
}

//Builds movie section
function buildMovieSection(dataList, category_name) {
    console.log(dataList, category_name);

    const movieListHTML = dataList.map(item => {
        const genres = item.genre_ids.map(id => genre_data.genre.find(genre => genre.id === id)?.name);
        const filteredGenres = genres.filter(genreName => genreName);
        const genreList = filteredGenres.join(', ');

        return `
        <div class="movie-item" onmouseover="searchMovieTrailer('${item.title}', 'yt${item.id}')">
            <img class="movie-item-img" src="${item.backdrop_path}" alt="${item.title}">
            <div class="yt-iframe" id="yt${item.id}"></div>
            
            <div class="access">
                <ul class="first">
                    <li class="access-item"><img src="./images/icons/play-circle.png"></li>
                    <li class="access-item"><img src="./images/icons/add.png"></li>
                    <li class="access-item"><img src="./images/icons/play.png"></li>
                    <li class="access-item"><img src="./images/icons/play.png"></li>
                    <li class="access-item last"><img src="./images/icons/play.png"></li>
                </ul>
                <ul class="second">
                    <li class="access-item"><p class="green">93% Match</p></li>
                    <li class="access-item"><p class="box">13+</p></li>
                <li class="access-item"><p>1 Season</p></li>
                <li class="access-item"><span class="box hd">HD</span></li>
                </ul>
                <ul class="third">
                    <li class="access-item">${genreList}</li>
                </ul>
            </div>
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
      if (window.scrollY > 5) {
        $("#header").addClass("black-bg");
      } 
      else {
        $("#header").removeClass("black-bg");
      }
    });
});
  

//For transitiom of movie-item
function noHover() {
    $(this).find(".access").addClass("on-hover");
}

function Hover() {
    $(".access").addClass("on-hover");
    $(".movie-item").hover(function() {
        $(this).find(".access").removeClass("on-hover");
    }, noHover);
}
  
  


// Navigation
function getMoviesByCategory(data, catName) {
    return data.results.filter(movie => movie.category.includes(catName));
}

function setActiveNavItem(activeItem) {
    $('.nav-items').removeClass('active');
    $(activeItem).addClass('active');
}

function setupNavigationFiltering() {
    const navItems = $('.nav-items');

    navItems.each(function(index) {
        if (index < 4) { // Only consider the first 4 nav items
            $(this).click(() => {
                const navItemCat = $(this).attr('data-category');
                filterContent(navItemCat);
                setActiveNavItem(this);
            });
        }
    });
}

function filterContent(category) {
    let data;

    if(category === "home"){
        data = tmdb_example.results;
        renderMovieSections(data, "Home");
    }
    else if(category === "tv-shows") {
        data = getMoviesByCategory(tmdb_example, "TV Show");
        renderMovieSections(data, "TV Shows");
    }
    else if(category === "movies") {
        data = getMoviesByCategory(tmdb_example, "Film");
        renderMovieSections(data, "Movies");
    }
    else if(category === "news-popular") {
        data = getMoviesByCategory(tmdb_example, "News");
        renderMovieSections(data, "News");
    }
}

function renderMovieSections(data, cat) {
    const movieSection = $('#movie-section');
    movieSection.empty(); // Clear existing sections

    if (Array.isArray(data) && data.length) {
        buildMovieSection(data, cat);
        Hover();
    }
}

// function updateMoviesByGenreId(genreId) {
//     const filteredResults = tmdb_example.results.filter(movie => movie.genre_ids.includes(genreId));
//     const updated_tmdb_example = { ...tmdb_example, results: filteredResults };
//     return updated_tmdb_example;
// }