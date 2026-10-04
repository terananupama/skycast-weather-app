const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const forecastBody = document.getElementById("forecastBody");

async function getWeather() {
    const city = cityInput.value.trim();

    if (city === "") {
        alert("Please enter a city name");
        return;
    }

    try {
        searchBtn.textContent = "Loading...";
        searchBtn.disabled = true;

        // Get city coordinates
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert("City not found");
            return;
        }

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // Get weather data
        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=5`;

        const weatherResponse = await fetch(weatherURL);
        const weatherData = await weatherResponse.json();

        displayWeather(location, weatherData);

    } catch (error) {
        console.error(error);
        alert("Unable to fetch weather data");
    } finally {
        searchBtn.textContent = "Search";
        searchBtn.disabled = false;
    }
}

// Convert weather code into description
function getWeatherDescription(code) {
    if (code === 0) return "Clear Sky";
    if (code === 1) return "Mainly Clear";
    if (code === 2) return "Partly Cloudy";
    if (code === 3) return "Overcast";
    if (code === 45 || code === 48) return "Fog";

    if ([51, 53, 55, 56, 57].includes(code)) {
        return "Drizzle";
    }

    if ([61, 63, 65, 66, 67].includes(code)) {
        return "Rain";
    }

    if ([71, 73, 75, 77].includes(code)) {
        return "Snow";
    }

    if ([80, 81, 82].includes(code)) {
        return "Rain Showers";
    }

    if ([95, 96, 99].includes(code)) {
        return "Thunderstorm";
    }

    return "Unknown";
}

// Display current weather and forecast
function displayWeather(location, data) {
    const current = data.current;

    cityName.textContent =
        `${location.name}, ${location.country}`;

    temperature.textContent =
        `${Math.round(current.temperature_2m)}°C`;

    description.textContent =
        getWeatherDescription(current.weather_code);

    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    windSpeed.textContent =
        `${current.wind_speed_10m} km/h`;

    forecastBody.innerHTML = "";

    const daily = data.daily;

    for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);

        const dayName = date.toLocaleDateString("en-US", {
            weekday: "long"
        });

        const weather = getWeatherDescription(
            daily.weather_code[i]
        );

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${dayName}</td>
            <td>${weather}</td>
            <td>${Math.round(daily.temperature_2m_max[i])}°C</td>
            <td>${Math.round(daily.temperature_2m_min[i])}°C</td>
            <td>${daily.precipitation_probability_max[i]}%</td>
        `;

        if (weather.toLowerCase().includes("rain")) {
            row.classList.add("rainy");
        }

        forecastBody.appendChild(row);
    }
}

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        getWeather();
    }
});