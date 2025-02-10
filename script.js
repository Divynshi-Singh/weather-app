const inputBox = document.querySelector(".input-box");
const searchBtn = document.getElementById("searchBtn");
const weather_img = document.querySelector(".weather-img");
const temperature = document.querySelector(".temperature");
const description = document.querySelector(".description");
const humidity = document.getElementById("humidity");
const wind_speed = document.getElementById("wind-speed");
const location_not_found = document.querySelector(".location-not-found");
const weather_body = document.querySelector(".weather-body");
const forecast_btn = document.querySelector(".forecast-btn");
const cityNameDisplay = document.getElementById("cityName");

const api_key = "82005d27a116c2880c8f0fcb866998a0";

// Common function to update the weather UI
function updateWeatherUI(weather_data) {
    location_not_found.style.display = "none";
    weather_body.style.display = 'flex';
    forecast_btn.style.display = "flex";

    // Update UI with weather data
    temperature.textContent = `${Math.round(weather_data.main.temp - 273.15)}°C`;
    description.textContent = weather_data.weather[0].description;
    humidity.textContent = `${weather_data.main.humidity}%`;
    wind_speed.textContent = `${weather_data.wind.speed} m/s`;

    // Update weather image based on the condition
    switch (weather_data.weather[0].main) {
        case "Clouds":
            weather_img.src = "./04d.png";
            break;
        case "Clear":
            weather_img.src = "./01d.png";
            break;
        case "Rain":
            weather_img.src = "./09d.png";
            break;
        case "Mist":
            weather_img.src = "./13d.png";
            break;
        case "Snow":
            weather_img.src = "./04n.png";
            break;
        default:
            weather_img.src = "./default.png"; 
    }

    // Show city name below the cloud image
    cityNameDisplay.textContent = weather_data.name;
}

// Function to get weather by coordinates (latitude, longitude)
async function checkWeatherByCoordinates(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`;
    try {
        const response = await fetch(url);
        const weather_data = await response.json();

        if (weather_data.cod === "404") {
            location_not_found.style.display = "flex";
            weather_body.style.display = 'none';
            forecast_btn.style.display = "none";
            return;
        }
        updateWeatherUI(weather_data);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

// Function to get weather by city name
async function checkWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}`;
    try {
        const response = await fetch(url);
        const weather_data = await response.json();

        if (weather_data.cod === "404") {
            location_not_found.style.display = "flex";
            weather_body.style.display = 'none';
            forecast_btn.style.display = "none";
            return;
        }
        updateWeatherUI(weather_data);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}
searchBtn.addEventListener("click", () => {
    const city = inputBox.value.trim();

    if (city === "") {
        alert("Please enter a city name.");
        return;
    }
    checkWeather(city);
});

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                checkWeatherByCoordinates(lat, lon);
            },
            error => {
                console.log(error);
                location_not_found.style.display = "flex";
                weather_body.style.display = 'none';
                forecast_btn.style.display = "none";
                alert("Location access denied. Please enter a city name.");
            }
        );
    }
}
window.onload = function () {
    getUserLocation();
};
