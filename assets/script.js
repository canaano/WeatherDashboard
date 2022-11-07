// API links and key
const API_URL = 'https://api.openweathermap.org/data/3.0/onecall';
const API_KEY = 'c557c62e75b66b19afd499c178c60c24';
const SEARCH_API = 'https://api.openweathermap.org/geo/1.0/direct';
const FORECAST_URL = 'https://api.openweathermap.org/data/3.0/onecall';

$(document).ready(function () {
  function getSearchHistory() {
    const searchHistory = localStorage.getItem('searchHistory')
      ? JSON.parse(localStorage.getItem('searchHistory'))
      : [];
    const dedupedSearchHistory = [...new Set(searchHistory)];
    return dedupedSearchHistory;
  }

  function setSearchHistory(cityName) {
    const searchHistory = getSearchHistory();
    searchHistory.push(cityName);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }

  async function searchForCity(cityName) {
    try {
      const request = await fetch(
        `${SEARCH_API}?q=${cityName}&appid=${API_KEY}`,);
      if (request.ok) {
        const response = await request.json();
        const { lat, lon } = response[0];
        setSearchHistory(cityName);
        return { lat, lon };
      }
    } catch (error) {
      return { error: 'City not found' };
    }
  }

  async function getForecast(lat, lon) {
    const request = await fetch(
      `${FORECAST_URL}?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly,alerts&appid=${API_KEY}`,
    );
    const response = await request.json();
    return response;
  }

  function getHeaderData(city, forecast) {
    return {
      city,
      temp: forecast?.current?.temp,
      humidity: forecast?.current?.humidity,
      windSpeed: forecast?.current?.wind_speed,
      weather: forecast?.current?.weather[0]?.main,
    };
  }

  function getBodyData(forecast) {
    return forecast.daily
      .map((day, i) => {
        return {
          temp: day?.temp.day,
          humidity: day?.humidity,
          windSpeed: day?.wind_speed,
          weather: day?.weather,
        };
      })
      .filter((_, i) => i <= 4);
  }

  function mountHeaderData(data) {
    $('#weathernow-icon').html(getWeatherIcon(data.weather[0].main));
    $('#city').text(data.city);
    $('#temp').text(data.temp);
    $('#humid').text(data.humidity);
    $('#wind').text(data.windSpeed);
  }

  function mountBodyData(data) {
    const cards = document.getElementsByClassName('forecast-card');
    $('.forecast-card').addClass('show');

    for (let i = 0; i < cards.length; i++) {
      cards[i].innerHTML = `
          <div class="content-wrapper">
          <span>
          ${getWeatherIcon(data[i].weather[0].main)}
          <span class="forecast-temp">${data[i].weather[0].main}</span>
          </span>
          <p class="temperature">Temp: ${data[i].temp}</p>
          <p class="humidity">Humidity: ${data[i].humidity}</p>
          <p class="wind-speed">Wind Speed: ${data[i].windSpeed}</p> 
          </div>
          `;
    }
  }
// add logic for icon loading based off weather
  function getWeatherIcon(weather) {
    switch (weather) {
      case 'Clear':
        return '<iconify-icon icon="wi:day-sunny"></iconify-icon>';
      case 'Clouds':
        return '<iconify-icon icon="bi:cloudy-fill"></iconify-icon>';
      case 'Rain':
      case 'Drizzle':
      case 'Mist':
        return '<iconify-icon icon="bi:cloud-rain"></iconify-icon>';
      case 'Thunderstorm':
        return '<iconify-icon icon="bi:cloud-lightning-rain"></iconify-icon>';
      case 'Snow':
        return '<iconify-icon icon="bi:cloud-snow"></iconify-icon>';
      default:
        return '<iconify-icon icon="wi:day-sunny"></iconify-icon>';
    }
  }


  function buildSearchAndMountHistory() {
    const searchHistory = getSearchHistory();
    const searchHistoryList = document.getElementById('search-history');
    searchHistoryList.innerHTML = '';
    searchHistory.forEach((city) => {
      const li = document.createElement('li');
      li.className = 'list list-group-item';
      li.innerHTML = city;
      searchHistoryList.appendChild(li);
    });
  }

  async function performSearch(cityName) {
    const { lat, lon, error } = await searchForCity(cityName);
    if (error) return alert(error);

    const forecast = await getForecast(lat, lon);
    const headerData = getHeaderData(cityName, forecast);
    const bodyData = getBodyData(forecast);

    mountHeaderData(headerData);
    mountBodyData(bodyData);
    buildSearchAndMountHistory();
  }

  // Event Listeners
  $('#search-history').on('click', async function (e) {
    const cityName = e.target.innerText;
    performSearch(cityName);
  });

  $('#search-button').on('click', async function () {
    const cityName = $('#search-input').val();
    performSearch(cityName);
  });

  // page set up
  buildSearchAndMountHistory();
});