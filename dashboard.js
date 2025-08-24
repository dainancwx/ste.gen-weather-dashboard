// ---------------------
// OpenWeather API Fetch
// ---------------------
async function fetchWeather() {
    const apiKey = "f9c86aa8266a0d5c15d39ad5ca0b6c7e"; // replace with your OpenWeather API key
    const city = "Columbia,MO,US"; // change to your city
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}°F`;
        document.getElementById("pressure").textContent = `Pressure: ${data.main.pressure} hPa`;
        document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
        document.getElementById("wind-speed").textContent = `Wind Speed: ${data.wind.speed} mph`;
        document.getElementById("wind-direction").textContent = `Wind Direction: ${data.wind.deg}°`;
        document.getElementById("last-updated").textContent =
            `Last Updated: ${new Date().toLocaleTimeString()}`;
    } catch (err) {
        console.error("Error fetching weather:", err);
    }
}

// ---------------------
// 5-Day Forecast Fetch
// ---------------------
async function fetchForecast() {
    const apiKey = "YOUR_OPENWEATHER_API_KEY";
    const city = "Columbia,MO,US";
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const forecastContainer = document.getElementById("forecast");
        forecastContainer.innerHTML = "";

        for (let i = 0; i < data.list.length; i += 8) {
            const item = data.list[i];
            const date = new Date(item.dt * 1000).toLocaleDateString();
            const temp = Math.round(item.main.temp);
            const desc = item.weather[0].description;

            const card = document.createElement("div");
            card.className = "forecast-card";
            card.innerHTML = `
                <h3>${date}</h3>
                <p>${temp}°F</p>
                <p>${desc}</p>
            `;
            forecastContainer.appendChild(card);
        }
    } catch (err) {
        console.error("Error fetching forecast:", err);
    }
}

// ---------------------
// Weather Underground Station Data
// ---------------------
async function fetchStationData() {
    const stationId = "YOUR_STATION_ID"; // e.g. KMOCOLUMB34
    const apiKey = "YOUR_WUNDERGROUND_API_KEY"; // Weather Underground PWS API Key

    const url = `https://api.weather.com/v2/pws/observations/current?stationId=${stationId}&format=json&units=e&apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const obs = data.observations[0];

        document.getElementById("station-data").innerHTML = `
            <h3>${obs.stationID} - ${obs.neighborhood || "Local Station"}</h3>
            <p>🌡️ Temp: ${obs.imperial.temp} °F</p>
            <p>💧 Humidity: ${obs.humidity} %</p>
            <p>💨 Wind: ${obs.imperial.windSpeed} mph (${obs.winddir}°)</p>
            <p>📈 Pressure: ${obs.imperial.pressure} inHg</p>
        `;
    } catch (err) {
        console.error("Station fetch error:", err);
        document.getElementById("station-data").textContent = "Failed to load station data.";
    }
}

// ---------------------
// Live Clock
// ---------------------
function updateTime() {
    document.getElementById("live-time").textContent =
        `Time: ${new Date().toLocaleTimeString()}`;
}

// ---------------------
// Refresh intervals
// ---------------------
setInterval(fetchWeather, 300000);     // refresh every 5 min
setInterval(fetchForecast, 300000);
setInterval(fetchStationData, 300000);
setInterval(updateTime, 1000);

// Initial load
fetchWeather();
fetchForecast();
fetchStationData();
updateTime();
