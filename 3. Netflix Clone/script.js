const yt_api_key = "AIzaSyDE1-U79ej6aoXFkqJWRMw87WZX4JAr8gQ";
const yt_api_path = (query) => `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${yt_api_key}`;


function init() {
    fetchAndBuildAllSections(tmdb_example, genre_data);
    setupNavigationFiltering();
    $(".my-list").hide();
    $(".language-filter").hide();
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
        fetchAndBuildTrending(data);
        genres.forEach(genre => {
            fetchMovie(data, genre);
        });
        Hover();
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
                    <li class="access-item"><img src="./images/icons/thumbs-up.png"></li>
                    <li class="access-item"><img src="./images/icons/thumbs-down.png"></li>
                    <li class="access-item last"><img src="./images/icons/down-button.png"></li>
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
function getMoviesByCategory(dataList, categoryName) {
    filteredResult = dataList.filter(movie => {
        if (movie.category.includes(categoryName)) {
            return true;
        }
        return false;
    });
    filteredData = {results : filteredResult};
    return filteredData;
}

function setActiveNavItem(activeItem) {
    $('.nav-items').removeClass('active');
    $(activeItem).addClass('active');
}

function setupNavigationFiltering() {
    const navItems = $('.nav-items');

    navItems.each(function() {
        $(this).click(() => {
            const navItemCat = $(this).attr('data-category');
            setActiveNavItem(this);
            filterContent(navItemCat);
        });
    });
}

function filterContent(category) {
    let data;

    if(category === "all"){
        data = tmdb_example;
        clearSections();
        fetchAndBuildAllSections(data, genre_data);
    }
    else if(category === "tv-shows") {
        data = getMoviesByCategory(tmdb_example.results, "TV Show");
        clearSections();
        fetchAndBuildAllSections(data, genre_data);
    }
    else if(category === "movies") {
        data = getMoviesByCategory(tmdb_example.results, "Film");
        clearSections();
        fetchAndBuildAllSections(data, genre_data);
    }
    else if(category === "news-popular") {
        data = getMoviesByCategory(tmdb_example.results, "News");
        clearSections();
        fetchAndBuildAllSections(data, genre_data);
    }
    else if(category === "my-list") {
        $(".main").hide();
        $(".language-filter").hide();
        $(".my-list").show();
    }
    else if (category === "languages") {
        $(".main").hide();
        $(".my-list").hide();
        $(".language-filter").show();
    }
}

function clearSections() {
    $(".my-list").hide();
    $(".language-filter").hide();
    $(".main").show();
    
    $('.movie').empty();
    $("#banner-section").css("background-image", "none");
    $('.banner').empty();
}