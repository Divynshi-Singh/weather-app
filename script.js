const searchInput = document.getElementsByClassName('search-input')[0]
const searchButton = document.getElementsByClassName('search-button')[0];
const weatherInfo = document.getElementsByClassName('weather-info')[0];
const errorMessage = document.getElementsByClassName('error-message')[0];
const weatherIcon = document.getElementsByClassName('weather-icon')[0];
const temperatureElement = document.getElementsByClassName('temperature')[0];
const descriptionElement = document.getElementsByClassName('description')[0];
const locationElement = document.getElementsByClassName('location')[0];
const loadingSpinner = document.getElementsByClassName('loading-spinner')[0];

const apiKey = '82005d27a116c2880c8f0fcb866998a0';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Variable to store the last searched city and its data
let lastSearchedCity = '';
let lastSearchedData = null;

// Function to generate weather details section
function weatherInformation() {
    const weatherDetailsContainer = document.querySelector('.weather-details');
    const details = [
        { icon: 'fa-solid fa-wind', label: 'Wind Speed', value: '--' },
        { icon: './images/icons/humidity.png', label: 'Humidity', value: '--', isImage: true },
        { icon: './images/icons/feels-like.jpg', label: 'Feels Like', value: '--', isImage: true },
        { icon: './images/icons/pres-icons.png', label: 'Pressure', value: '--', isImage: true },
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

// Function to display weather data
function displayWeatherData(data) {
    errorMessage.style.display = 'none';
    weatherInfo.style.display = 'block';
    forecastButton.style.display = 'block'; // Show the forecast button
    if (data.main && data.weather && data.weather[0]) {
        temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
        descriptionElement.textContent = data.weather[0].description;
        locationElement.textContent = `${data.name}, ${data.sys.country}`;
        detailValueElements.windspeed.textContent = `${data.wind.speed} m/s`;
        detailValueElements.humidity.textContent = `${data.main.humidity}%`;
        detailValueElements.feelslike.textContent = `${Math.round(data.main.feels_like)}°C`;
        detailValueElements.pressure.textContent = `${data.main.pressure} hPa`;
        const iconFilename = `./images/icons/${data.weather[0].icon}.png`;
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
        const backgroundImage = isDaytime ? './images/bg-img/sun-rise.jpg' : './images/bg-img/moon.jpg';

        document.body.style.backgroundImage = `url('${backgroundImage}')`;
        document.body.style.backgroundSize = 'cover';
    } else {
        console.error('Incomplete weather data:', data);
        errorMessage.textContent = 'Weather data is missing or incomplete.';
        errorMessage.style.display = 'block';
        loadingSpinner.style.display = 'none';
    }
}

async function fetchData(endPoint, city) {
    try {
        
        const response = await fetch(`${BASE_URL}/${endPoint}?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        lastSearchedCity = city;
        lastSearchedData = data;
        displayWeatherData(data);
        loadingSpinner.style.display = 'none';

    } catch (error) {
        console.error('Error fetching weather data:', error);
        errorMessage.textContent = 'City not found';
        forecastButton.style.display = "none";
        errorMessage.style.display = 'block';
        loadingSpinner.style.display = 'none';
        document.body.style.backgroundImage = ''; 
    }
}
// Event listener for the search button click
searchButton.addEventListener('click', function (event) {
    event.preventDefault(); // Prevents form from submitting
    const city = searchInput.value.trim();
    weatherInfo.style.display = 'none';
    errorMessage.style.display = 'none';
    loadingSpinner.style.display = 'block';
    if (city === '') {
        errorMessage.textContent = 'Enter a city name.';
        forecastButton.style.display = "none";
        errorMessage.style.display = 'block';
        loadingSpinner.style.display = 'none';
        document.body.style.backgroundImage = ''; // Remove background image
        return;
    }
    const normalizedCity = city.toLowerCase();
    if (normalizedCity === lastSearchedCity.toLowerCase()) {
        weatherInfo.style.display = 'block';
        displayWeatherData(lastSearchedData);
        loadingSpinner.style.display = 'none';
    } else {
        loadingSpinner.style.display = 'block';
        fetchData('weather', city);
    }
    searchInput.value = ''; // Clear the input field
});
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchButton.click();
    }
});
const forecastButton = document.querySelector('.forecast-button');
const forecastModal = document.getElementById('forecastModal');
const closeModal = document.querySelector('.close');
const ctx = document.getElementById('forecastChart').getContext('2d');
forecastButton.addEventListener('click', function () {
    forecastModal.style.display = 'flex';
    fetch(`${BASE_URL}/forecast?q=${lastSearchedCity}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            const labels = [];
            const temperatures = [];

            // Fetch next 5 days data
            const dailyData = data.list.filter((item, index) => index % 8 === 0);
            dailyData.forEach(day => {
                const date = new Date(day.dt * 1000);
                labels.push(date.toLocaleDateString());
                temperatures.push(day.main.temp);
            });
            // Show modal
            forecastModal.style.display = 'flex';
            // Destroy previous chart (if exists)
            if (window.myChart) {
                window.myChart.destroy();
            }
        })
        .catch(error => console.error('Error fetching forecast data:', error));
});
// Close modal
closeModal.addEventListener('click', () => {
    forecastModal.style.display = 'none';
});
window.addEventListener("click", function (event) {
    if (event.target === forecastModal) {
        forecastModal.style.display = 'none';
    }
});
function fetchForecast(city) {
    fetch(`${BASE_URL}/forecast?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            const labels = [];
            const temperatures = [];
            // Next 5 days data
            const dailyData = data.list.filter((item, index) => index % 8 === 0);
            dailyData.forEach(day => {
                const date = new Date(day.dt * 1000);
                labels.push(date.toLocaleDateString());
                temperatures.push(day.main.temp);
            });
            // Destroy previous chart if exists
            if (window.myChart) {
                window.myChart.destroy();
            }
            // Create new chart
            window.myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `Temperature in ${city} (°C)`,
                        data: temperatures,
                        borderColor: 'blue',
                        backgroundColor: 'rgba(0, 0, 255, 0.2)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: false }
                    },
                    
                }
            });
        })
        .catch(error => console.error('Error fetching forecast:', error));
}
let currentLocationCity = '';
function fetchWeatherByCoordinates(lat, lon) {
    fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            console.log('Weather Data:', data); // Log entire data object
            displayWeatherData(data);
            lastSearchedCity = data.name; // Store current location city
            currentLocationCity = data.name;
        })
        .catch(error => {
            console.error('Error fetching weather data by coordinates:', error);
            errorMessage.textContent = 'Unable to fetch weather data.';
            errorMessage.style.display = 'block';
        });
}
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
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            reject(new Error('Geolocation is not supported by this browser.'));
        }
    });
}
function getCurrentLocationWeather() {
    loadingSpinner.style.display = 'block';
    getCoordinates()
        .then(({ lat, lon }) => {
            fetchWeatherByCoordinates(lat, lon);  // Fetch weather for the coordinates
        })
        .catch(error => {
            console.error(error);
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
            loadingSpinner.style.display = 'none';
        })
        .finally(() => {
            loadingSpinner.style.display = 'none';
        });
}
forecastButton.addEventListener("click", function () {
    const cityToUse = lastSearchedCity || currentLocationCity; 
    if (!cityToUse) {
        alert("Weather data not available. Please allow location or search for a city.");
        return;
    }
    fetchForecast(cityToUse);
    forecastModal.style.display = 'flex';
});
window.onload = function () {
    getCurrentLocationWeather();
};




