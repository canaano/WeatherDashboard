// API url for openweathermap
const API_URL = 'https://api.openweathermap.org/data/3.0/onecall'
// API key 
const API_KEY = 'c557c62e75b66b19afd499c178c60c24'
const SEARCH_API = 'https://api.openweathermap.org/geo/1.0/direct'
// 5day forecast url for openweathermap
// const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'
const FORECAST_URL = 'https://api.openweathermap.org/data/3.0/onecall'

async function searchForCity(cityName) {
    const request = await fetch(`${SEARCH_API}?q=${cityName}&appid=${API_KEY}`)
    const response = await request.json();
    const { lat, lon } = response[0];
    return { lat, lon };
}

async function getForecast(lat, lon) {
    const request = await fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly,alerts&appid=${API_KEY}`)
    const response = await request.json();
    return response
}

function getHeaderData(city, forecast) {
    return {
        city,
        temp: forecast?.current?.temp,
        humidity: forecast?.current?.humidity,
        windSpeed: forecast?.current?.wind_speed,
    }
}

function getBodyData(forecast) {
    return forecast.daily.map((day, i) => {
      return {
        temp: day?.temp.day,
        humidity: day?.humidity,
        windSpeed: day?.wind_speed,
        weather: day?.weather
      }
    }).filter((_, i) => i <= 4);
}

$( document ).ready(function() {
    function mountHeaderData(data) {
      $('#city').text(data.city);
      $('#temp').text(data.temp);
      $('#humid').text(data.humidity);
      $('#wind').text(data.windSpeed);
    }

    function mountBodyData(data) {
        const cards = document.getElementsByClassName('forecast-card')
        $('.forecast-card').addClass('show');

        for(let i = 0; i <= cards.length; i++) {
          cards[i].innerHTML = `
          <div class="content-wrapper">
          <img id="current-pic" alt="">
          <p class="temperature">Temp: ${data[i].temp}</p>
          <p class="humidity">Humidity: ${data[i].humidity}</p>
          <p class="wind-speed">Wind Speed: ${data[i].windSpeed}</p> 
          </div>
          `
        }
    }
    // Handler for .ready() called.
    $( "#search-button" ).on( "click", async function() {
        const cityName = $('#search-input').val()
        const  { lat, lon} = await searchForCity(cityName);
        const forecast = await getForecast(lat, lon);
        const headerData = getHeaderData(cityName, forecast)
        const bodyData = getBodyData(forecast);
        
        // mount headerData on page 
        mountHeaderData(headerData);
        mountBodyData(bodyData);

      })
  });

//   https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}