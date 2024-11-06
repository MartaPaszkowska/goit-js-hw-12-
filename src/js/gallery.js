'use strict';

///////// biblioteki //////////
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

///////// zmienne globalne //////////
const searchForm = document.querySelector('.form');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const loadMoreButton = document.querySelector('.load-more');

let searchTerm = '';
let currentPage = 1;
let totalHits = 0;

/////////listener dla formularza wyszukiwania//////////
searchForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  searchTerm = event.target.querySelector('input').value.trim();
  if (!searchTerm) {
    iziToast.error({
      position: 'topRight',
      message: 'Please complete the form',
    });
    return;
  }

  currentPage = 1;
  totalHits = 0;
  gallery.innerHTML = '';
  loadMoreButton.style.display = 'none';
  loader.style.display = 'block';

  try {
    const response = await fetchImages(searchTerm, currentPage);
    totalHits = response.totalHits;

    if (totalHits === 0) {
      iziToast.error({
        position: 'topRight',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
      });
      loader.style.display = 'none';
      return;
    }

    displayImages(response.hits);
    loader.style.display = 'none';

    const lightbox = new SimpleLightbox('.gallery a');
    lightbox.refresh();

    if (totalHits > currentPage * 40) {
      loadMoreButton.style.display = 'block';
    } else {
      iziToast.info({
        position: 'topRight',
        message: "We're sorry, but you've reached the end of search results.",
      });
    }
  } catch (error) {
    iziToast.error({
      position: 'topRight',
      message:
        'Sorry, there are no images matching your search query. Please try again!',
    });
    loader.style.display = 'none';
    console.error(error);
  }
});

/////////listener dla przycisku "Load more"//////////
loadMoreButton.addEventListener('click', async function () {
  currentPage++;
  loader.style.display = 'block';

  try {
    const response = await fetchImages(searchTerm, currentPage);
    displayImages(response.hits);
    loader.style.display = 'none';

    const lightbox = new SimpleLightbox('.gallery a');
    lightbox.refresh();

    if (totalHits <= currentPage * 40) {
      loadMoreButton.style.display = 'none';
      iziToast.info({
        position: 'topRight',
        message: "We're sorry, but you've reached the end of search results.",
      });
    }

    // Płynne przewijanie strony
    const { height: cardHeight } = document
      .querySelector('.gallery-item')
      .getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  } catch (error) {
    iziToast.error({
      position: 'topRight',
      message:
        'Sorry, there are no images matching your search query. Please try again!',
    });
    loader.style.display = 'none';
    console.error(error);
  }
});

///////// Funkcja do pobierania obrazów z pixabay //////////
async function fetchImages(query, page) {
  const apiKey = '44961445-711bc8a23588390ccc23a177e';
  const perPage = 20;
  const url = `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      throw new Error('Network response was not ok');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
}

///////// Funkcja do wyświetlania obrazów //////////
function displayImages(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
      <li class="gallery-item">
        <a href="${largeImageURL}">
          <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
        </a>
        <div class="image-info">
          <div class ="info-part"><p class="info-name">Likes</p><p class="info-num">${likes}</p></div>
          <div class ="info-part"><p class="info-name">Views</p><p class="info-num">${views}</p></div>
          <div class ="info-part"><p class="info-name">Comments</p><p class="info-num">${comments}</p></div>
          <div class ="info-part"><p class="info-name">Downloads</p><p class="info-num">${downloads}</p></div>
        </div>
      </li>
    `;
      }
    )
    .join('');

  gallery.innerHTML += markup;
}
