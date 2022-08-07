const API = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
  params: {
    'api_key': API_KEY,
  }
});

// ***********************
// llamados a la API

const lazyLoader = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const url = entry.target.getAttribute('data-img');
      entry.target.setAttribute('src', url);
    }
  });
});

const createMovies = (
    movies, 
    container, 
    {
      lazyLoad = false, 
      clean = true
    } = {}
  ) => {
  if (clean) container.innerHTML = "";

  movies.forEach(movie => {
    const movieContainer = document.createElement('div');
    movieContainer.classList.add('movie-container');
    movieContainer.addEventListener('click', () => {
      location.hash=`#movie=${movie.id}`
    });

    const movieImg = document.createElement('img');
    movieImg.classList.add('movie-img');
    movieImg.setAttribute('alt',movie.title);
    movieImg.setAttribute(
      lazyLoad ? 'data-img' : 'src',
      `https://image.tmdb.org/t/p/w300${movie.poster_path}`
    );

    if (lazyLoad) {
      lazyLoader.observe(movieImg);
    }

    movieContainer.appendChild(movieImg);
    container.appendChild(movieContainer);
  });
}

const createCategories = (categories, container) => {
  categories.forEach(category => {
    const categoryContainer = document.createElement('div');
    categoryContainer.classList.add('category-container');

    const categoryTitle= document.createElement('h3');
    categoryTitle.classList.add('category-title');
    categoryTitle.setAttribute('id',`id${category.id}`);
    categoryTitle.addEventListener('click', () => {
      location.hash = `#category=${category.id}-${category.name}`;
    });

    const categoryTitleText = document.createTextNode(category.name);
    
    categoryTitle.appendChild(categoryTitleText);
    categoryContainer.appendChild(categoryTitle);
    container.appendChild(categoryContainer);
  });
}

// ***********************
// ***********************

const getTrendingMoviesPreview = async () => {
  const {data, status} = await API.get(`/trending/movie/day`);
  const movies = data.results;
  trendingMoviesPreviewList.innerHTML = "";
  createMovies(movies, trendingMoviesPreviewList, {
    lazyLoad: true, 
  });
}

const getCategoriesPreview = async () => {
  const { data } = await API.get(`/genre/movie/list`);
  const categories = data.genres;
  categoriesPreviewList.innerHTML = "";
  createCategories(categories, categoriesPreviewList);
}

const getMoviesByCategory = async (id) => {
  const {data} = await API.get(`/discover/movie`, {
    params: {
      with_genres: id,
    }
  });
  const movies = data.results;
  maxPage = data.total_pages;

  createMovies(movies, genericSection, {
    lazyLoad: true, 
  });
}

const getPaginatedMoviesByCategory = (id) => {
  return async () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
    const pageIsNotMax = page < maxPage;

    if (scrollIsBottom && pageIsNotMax) {
      page++;
      const {data} = await API.get(`/discover/movie`, {
        params: {
          with_genres: id,
          page,
        }
      });
      const movies = data.results;
      createMovies(movies, genericSection, {
        lazyLoad: true, 
        clean: false
      });
    }
  }
}

const getMoviesBySearch = async (query) => {
  const {data} = await API.get(`/search/movie`, {
    params: { query }
  });
  const movies = data.results;
  maxPage = data.total_pages;

  genericSection.innerHTML = "";
  createMovies(movies, genericSection, {
    lazyLoad: true, 
  });
}

const getPaginatedMoviesBySearch = (query) => {
  return async () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
    const pageIsNotMax = page < maxPage;

    if (scrollIsBottom && pageIsNotMax) {
      page++;
      const {data} = await API.get(`/search/movie`, {
        params: { query, page },
      });
      const movies = data.results;
      createMovies(movies, genericSection, {
        lazyLoad: true, 
        clean: false
      });
    }
  }
}

const getTrendingMovies = async () => {
  const { data } = await API.get(`/trending/movie/day`);
  const movies = data.results;
  genericSection.innerHTML = "";
  maxPage = data.total_pages;

  createMovies(movies, genericSection, {
    lazyLoad: true, 
  });
  // const btnLoadMore = document.createElement('button');
  // btnLoadMore.innerText = 'Cargar más';
  // btnLoadMore.addEventListener('click', getPaginatedTrendingMovies);
  // genericSection.appendChild(btnLoadMore);
}

const getPaginatedTrendingMovies = async () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
  const pageIsNotMax = page < maxPage;

  if (scrollIsBottom && pageIsNotMax) {
    page++;
    const { data } = await API.get(`/trending/movie/day`, {
      params: {
        page,
      }
    });
    const movies = data.results;
    createMovies(movies, genericSection, {
      lazyLoad: true, 
      clean: false
    });
  }
  // const btnLoadMore = document.createElement('button');
  // btnLoadMore.innerText = 'Cargar más';
  // btnLoadMore.addEventListener('click', getPaginatedTrendingMovies);
  // genericSection.appendChild(btnLoadMore);
}

const getMovieById = async (id) => {
  const { data: movie } = await API.get(`movie/${id}`);

  const movieImgUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  console.log('movieImgUrl: ', movieImgUrl);
  
  headerSection.style.background = `
    linear-gradient(
      180deg, 
      rgba(0, 0, 0, 0.35) 19.27%, 
      rgba(0, 0, 0, 0) 29.17%),
    url(${movieImgUrl})
  `;


  movieDetailTitle.textContent = movie.title;
  movieDetailDescription.textContent = movie.overview;
  movieDetailScore.textContent = movie.vote_average;

  createCategories(movie.genres, movieDetailCategoriesList);

  getRelatedMoviesId(id);
}

const getRelatedMoviesId = async (id) => {
  const { data } = await API.get(`movie/${id}/recommendations`);
  const relatedMovies = data.results;

  createMovies(relatedMovies, relatedMoviesContainer, {
    lazyLoad: true, 
  });
}

