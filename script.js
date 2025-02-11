
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
const weatherIcons = {
    '01d': '01d.png',
    '02d': '02d.png',
    '03d': '03d.png',
    '04d': '04d.png',
    '09d': '09d.png',
    '10d': '10d.png',
    '11d': '11d.png',
    '13d': '13d.png',
    '50d': '50d.png',
    '01n': '01n.png',
    '02n': '02n.png',
    '03n': '03n.png',
    '04n': '04n.png',
    '09n': '09n.png',
    '10n': '10n.png',
    '11n': '11n.png',
    '13n': '13n.png',
    '50n': '50n.png',
};



const BASE_URL = `https://api.openweathermap.org/data/2.5`;

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


    function setupForecastModal() {
        const forecastButton = document.createElement('button');
        forecastButton.textContent = 'Forecast';
        forecastButton.classList.add('forecast-button');
        weatherDetailsContainer.appendChild(forecastButton);
        const forecastModal = document.querySelector('.forecast-modal');
        const modalBackdrop = document.querySelector('#modalBackdrop');

        if (forecastButton && forecastModal && modalBackdrop) {
            forecastButton.addEventListener('click', function () {
                errorMessage.style.display = 'none';
                loadingSpinner.style.display = 'block';

                const city = searchInput.value.trim();
                if (city) {
                    fetchHourlyForecast(city);
                } else {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(function (position) {
                            const lat = position.coords.latitude;
                            const lon = position.coords.longitude;
                            console.log('Current position:', lat, lon);

                            fetchHourlyForecastByCoordinates(lat, lon);
                        }, function (error) {
                            console.error('Error getting geolocation:', error);
                            errorMessage.textContent = 'Unable to retrieve your location. Please try again.';
                            errorMessage.style.display = 'block';
                        });
                    } else {
                        errorMessage.textContent = 'Geolocation is not supported by this browser.';
                        errorMessage.style.display = 'block';
                    }
                }

                loadingSpinner.style.display = 'none';  
                forecastModal.style.display = 'block';  
                modalBackdrop.style.display = 'block';  
            });

            modalBackdrop.addEventListener('click', function () {
                forecastModal.style.display = 'none';
                modalBackdrop.style.display = 'none';
            });
        }
    }
    setupForecastModal();
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

        const weatherIconCode = data.weather[0].icon;  

        const iconFilename = weatherIcons[weatherIconCode] || 'default.png';  
        weatherIcon.src = iconFilename;  
        weatherIcon.alt = weatherIconCode; 

        const sunrise = new Date(data.sys.sunrise * 1000);
        const sunset = new Date(data.sys.sunset * 1000);
        const now = new Date();

        if (now >= sunrise && now <= sunset) {
            document.body.style.backgroundImage = "url('./sun-rise.jpg')";
        } else {
            document.body.style.backgroundImage = "url('./moon.jpg')";
        }

        document.body.style.backgroundSize = "cover";
    } else {
        console.error('Incomplete weather data:', data);
        errorMessage.textContent = 'Weather data is missing or incomplete.';
        errorMessage.style.display = 'block';
      loadingSpinner.style.display = 'none';
  }
}

searchButton.addEventListener('click', function () {
    const city = searchInput.value;
    weatherInfo.style.display = 'none';
    errorMessage.style.display = 'none';
    loadingSpinner.style.display = 'block';
    if (city.trim() === '') {
        errorMessage.textContent = ' Enter a city name.';
        errorMessage.style.display = 'block';
        loadingSpinner.style.display = 'none';
        return;
    }
    loadingSpinner.style.display = 'block';
    fetchData('weather', city);
    // Clear the search input field after the search button is clicked
    searchInput.value = '';  
});
function fetchData(endPoint, city) {
    fetch(`${BASE_URL}/${endPoint}?q=${city}&appid=${apiKey}&units=metric`)

        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            displayWeatherData(data);
            console.log(data);
            loadingSpinner.style.display = 'none';
        })

        .catch((error) => {
            console.error('Error fetching weather data:', error);
            errorMessage.textContent = 'city not found.';
            errorMessage.style.display = 'block';
            loadingSpinner.style.display = 'none';
       });
}
function fetchHourlyForecast(city) {
    const url = `${BASE_URL}/forecast?q=${city}&appid=${apiKey}&units=metric`
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            displayHourlyForecast(data);
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            errorMessage.textContent = 'Unable to fetch forecast data. Please try again later.';
            errorMessage.style.display = 'block';
        });
}
function fetchHourlyForecastByCoordinates(lat, lon) {
    const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Location not found');
            }
            return response.json();
        })
        .then(data => {
            displayHourlyForecast(data);
        })
        .catch(error => {
            console.error('Error fetching forecast data by coordinates:', error);
            errorMessage.textContent = 'Unable to fetch forecast data. Please try again later.';
            errorMessage.style.display = 'block';
                });
}
function displayHourlyForecast(data) {
    const forecastModal = document.getElementById('forecastModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const chartCanvas = document.getElementById('hourlyForecastChart');
    const tableBody = document.getElementById('forecastTableBody');

    tableBody.innerHTML = ''; // Clear existing forecast table
     // Check if the canvas element exists
    if (!chartCanvas) {
        console.error("Chart canvas element not found.");
        return;
    }
    const ctx = chartCanvas.getContext('2d');
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);  // Clear the canvas

    // Get the hourly data (next 8 hours)
    const hourlyData = data.list.slice(0, 8);
    const hourlyWindSpeeds = hourlyData.map(item => Math.round(item.wind.speed));
    const hourlyLabels = hourlyData.map(item => {
        const date = new Date(item.dt * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit' });
    });

    const hourlyTemps = hourlyData.map(item => Math.round(item.main.temp));

    window.hourlyForecastChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hourlyWindSpeeds,
            datasets: [{
                label: 'Temperature (°C)',
                data: hourlyTemps,
                borderColor: 'red',
                borderWidth: 1,
                fill: false,
                tension: 0.4,
                pointRadius: 1,
                yAxisID: 'y',
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
            },
            scales: {
                x: {
                    position: 'bottom',
                    grid: {
                        drawOnChartArea: false,
                        drawTicks: true,
                    },
                    ticks: {
                        callback: function (index) {
                            return hourlyWindSpeeds[index] + ' m/s';
                        }
                    }
                },
                x1: {
                    position: 'top',
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        callback: function (value, index, values) {
                            return hourlyLabels[index];
                        }
                    }
                },
                y: {
                    beginAtZero: false,
                    min: 10,
                    max: 30,
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        stepSize: 5,
                        callback: function (value) {
                            return value + ' °C';
                        },
                        color: 'red'
                    }
                },
            },
        },
    });

    hourlyData.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayString = date.toLocaleTimeString([], { hour: '2-digit' });

        const weatherIconCode = item.weather[0].icon;
        const iconFilename = weatherIcons[weatherIconCode] || 'default.png';  

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dayString}</td>
            <td class="forecast-icon"><img src="${iconFilename}" alt="Weather icon">${Math.round(item.main.temp)}°C</td>
            <td>${item.weather[0].description}</td>
        `;
        tableBody.appendChild(row);
    });
    if (forecastModal && modalBackdrop) {
        forecastModal.style.display = 'block';
        modalBackdrop.style.display = 'block';
    } else {
        console.error("Modal or backdrop not found.");
    }

    modalBackdrop.addEventListener('click', () => {
        forecastModal.style.display = 'none';
        modalBackdrop.style.display = 'none';
    });
}
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchButton.click();
    }
})
function fetchWeatherByCoordinates(lat, lon) {
    fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Location not found');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
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

function getCoordinates() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    console.log('Current position:', lat, lon);
                    resolve({ lat, lon });
                },
                error => {
                    console.error('Error getting geolocation:', error);
                    reject(new Error('Unable to retrieve your location. Please try again or enter a city name.'));
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
            fetchWeatherByCoordinates(lat, lon);
        })
        .catch(error => {
            console.error(error.message);
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