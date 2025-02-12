const searchInput = document.querySelector('.search-input');
const searchButton = document.querySelector('.search-button');
const weatherInfo = document.querySelector('.weather-info');
const errorMessage = document.querySelector('.error-message');
const weatherIcon = document.querySelector('.weather-icon');
const temperatureElement = document.querySelector('.temperature');
const descriptionElement = document.querySelector('.description');
const locationElement = document.querySelector('.location');
const loadingSpinner = document.querySelector('.loading-spinner');
const apiKey = '82005d27a116c2880c8f0fcb866998a0';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Variable to store the last searched city and its data
let lastSearchedCity = '';
let lastSearchedData = null;
function weatherInformation() {
    const weatherDetailsContainer = document.querySelector('.weather-details');
    const details = [
        { icon: 'fa-solid fa-wind', label: 'Wind Speed', value: '--' },
        { icon: './humidity.png', label: 'Humidity', value: '--', isImage: true },
        { icon: './feels-like.jpg', label: 'Feels Like', value: '--', isImage: true },
        { icon: './pres-icons.png', label: 'Pressure', value: '--', isImage: true },
    ];
    const valueContainers = {};
    details.forEach(detail => {
        const detailContainer = document.createElement('div');
        detailContainer.classList.add('weather-detail');
        const iconContainer = document.createElement('div');
        iconContainer.classList.add('detail-icon');
        if (detail.isImage) {
            const iconImage = document.createElement('img');
            iconImage.src = detail.icon;
            iconImage.alt = detail.label;
            iconContainer.appendChild(iconImage);
        } else {
            const iconElement = document.createElement('i');
            iconElement.className = detail.icon;
            iconContainer.appendChild(iconElement);
        }
        const valueContainer = document.createElement('div');
        valueContainer.classList.add('detail-value');
        valueContainer.textContent = detail.value;

        const labelContainer = document.createElement('div');
        labelContainer.classList.add('detail-label');
        labelContainer.textContent = detail.label;

        detailContainer.appendChild(iconContainer);
        detailContainer.appendChild(valueContainer);
        detailContainer.appendChild(labelContainer);
        weatherDetailsContainer.appendChild(detailContainer);
        valueContainers[detail.label.toLowerCase().replace(' ', '')] = valueContainer;
    });
    return valueContainers;
}
const detailValueElements = weatherInformation();
function displayWeatherData(data) {
    errorMessage.style.display = 'none';
    weatherInfo.style.display = 'block';
    if (data.main && data.weather && data.weather[0]) {
        temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
        descriptionElement.textContent = data.weather[0].description;
        locationElement.textContent = `${data.name}, ${data.sys.country}`;
        detailValueElements.windspeed.textContent = `${data.wind.speed} m/s`;
        detailValueElements.humidity.textContent = `${data.main.humidity}%`;
        detailValueElements.feelslike.textContent = `${Math.round(data.main.feels_like)}°C`;
        detailValueElements.pressure.textContent = `${data.main.pressure} hPa`;
        const iconFilename = `./${data.weather[0].icon}.png`;
        const fallbackIcon = './default.png';
        const iconImage = new Image();
        iconImage.src = iconFilename;
        iconImage.onload = () => weatherIcon.src = iconFilename;
        iconImage.onerror = () => weatherIcon.src = fallbackIcon;
        weatherIcon.alt = data.weather[0].icon;
        const sunrise = new Date(data.sys.sunrise * 1000);
        const sunset = new Date(data.sys.sunset * 1000);
        const now = new Date();

        const isDaytime = now >= sunrise && now <= sunset;
        const backgroundImage = isDaytime ? './sun-rise.jpg' : './moon.jpg';

        // Set background image
        document.body.style.backgroundImage = `url('${backgroundImage}')`;
        document.body.style.backgroundSize = 'cover';
    } else {
        console.error('Incomplete weather data:', data);
        errorMessage.textContent = 'Weather data is missing or incomplete.';
        errorMessage.style.display = 'block';
        loadingSpinner.style.display = 'none';
    }
}
// Function to fetch data from the weather API
function fetchData(endPoint, city) {
    fetch(`${BASE_URL}/${endPoint}?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            lastSearchedCity = city; // Update the last searched city
            lastSearchedData = data; // Store the fetched data
            displayWeatherData(data);
            loadingSpinner.style.display = 'none';
        })
        .catch((error) => {
            console.error('Error fetching weather data:', error);
            errorMessage.textContent = 'City not found';
            errorMessage.style.display = 'block';
            loadingSpinner.style.display = 'none';
        });
}
// Event listener for the search button click
searchButton.addEventListener('click', function (event) {
    event.preventDefault(); // Prevents form from submitting and page from refreshing
    const city = searchInput.value.trim();
    weatherInfo.style.display = 'none';
    errorMessage.style.display = 'none';
    loadingSpinner.style.display = 'block';

    if (city === '') {
        errorMessage.textContent = 'Enter a city name.';
        errorMessage.style.display = 'block';
        loadingSpinner.style.display = 'none';
        return;
    }
    const normalizedCity = city.toLowerCase();

    if (normalizedCity === lastSearchedCity.toLowerCase()) {
        weatherInfo.style.display = 'block';
        displayWeatherData(lastSearchedData);
        loadingSpinner.style.display = 'none';
        console.log('City is already searched. Using cached data.');
    } else {
        loadingSpinner.style.display = 'block';
        fetchData('weather', city);
    }
    searchInput.value = '';  // Clear the input field
});
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchButton.click();
    }
});
// Function to fetch weather data by coordinates
function fetchWeatherByCoordinates(lat, lon) {
    fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Location not found');
            }
            return response.json();
        })
        .then(data => {
            if (data.main && data.weather && data.weather[0]) {
                displayWeatherData(data);
            } else {
                console.error('Weather data is missing or incomplete:', data);
                errorMessage.textContent = 'Weather data is missing or incomplete.';
                errorMessage.style.display = 'block';
                loadingSpinner.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching weather data by coordinates:', error);
            errorMessage.textContent = 'Unable to fetch weather data. Please try again later.';
            errorMessage.style.display = 'block';
            loadingSpinner.style.display = 'none';
        });
}
// Function to get coordinates using the browser's geolocation API
function getCoordinates() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    resolve({ lat, lon });
                },
                error => {
                    reject(new Error('Unable to retrieve your location. Please try again.'));
                }
            );
        } else {
            reject(new Error('Geolocation is not supported by this browser.'));
        }
    });
}
// Function to fetch weather data for the current location
function getCurrentLocationWeather() {
    loadingSpinner.style.display = 'block';
    getCoordinates()
        .then(({ lat, lon }) => {
            fetchWeatherByCoordinates(lat, lon);
        })
        .catch(error => {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        })
        .finally(() => {
            loadingSpinner.style.display = 'none';
        });
}
window.onload = function () {
    getCurrentLocationWeather();
};
