const API_KEY = "f9c86aa8266a0d5c15d39ad5ca0b6c7e";
const LAT = 38.336418776106676;
const LON = -90.15364904539364;

async function fetchCurrentData() {
  try {
    const response = await fetch("datalog.csv");
    const text = await response.text();
    const rows = text.trim().split("\n");
    const latest = rows[rows.length - 1].split(",");

    const [_, windSpeed, windDir, hum, pressure, tempF] = latest;

    document.getElementById("windSpeedValue").textContent = `${parseFloat(windSpeed).toFixed(1)} mph`;
    document.getElementById("windDirValue").textContent = `${parseFloat(windDir).toFixed(1)} °`;
    document.getElementById("tempValue").textContent = `${parseFloat(tempF).toFixed(1)} °F`;
    document.getElementById("pressureValue").textContent = `Pressure: ${parseFloat(pressure).toFixed(1)} hPa`;
    document.getElementById("humidityValue").textContent = `Humidity: ${parseFloat(hum).toFixed(1)} %`;

    const now = new Date();
    const ampm = now.getHours() >= 12 ? "PM" : "AM";
    const hours = now.getHours() % 12 || 12;
    const time = `${hours.toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")} ${ampm}`;
    const date = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
    document.getElementById("lastUpdated").textContent = `Last Updated: ${date} ${time}`;
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

function updateLiveTime() {
  const now = new Date();
  const localHours = now.getHours() % 12 || 12;
  const ampm = now.getHours() >= 12 ? "PM" : "AM";

  const local = `${localHours.toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")} ${ampm}`;
  const utc = `${now.getUTCHours().toString().padStart(2, "0")}:${now.getUTCMinutes().toString().padStart(2, "0")}:${now.getUTCSeconds().toString().padStart(2, "0")} UTC`;

  document.getElementById("localTime").textContent = local;
  document.getElementById("utcTime").textContent = utc;
}

async function fetchForecast() {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=imperial&appid=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    const container = document.getElementById("forecast");
    container.innerHTML = "";

    const daily = {};
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
      if (!daily[dayKey]) daily[dayKey] = [];
      daily[dayKey].push(item);
    });

    Object.keys(daily).slice(0, 5).forEach(day => {
      const outer = document.createElement("div");
      outer.className = "forecast-day-group";

      const title = document.createElement("h3");
      title.textContent = day;
      outer.appendChild(title);

      const inner = document.createElement("div");
      inner.className = "forecast-subcontainer";

      daily[day].forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const timeLabel = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

        const icon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
        const temp = Math.round(forecast.main.temp);
        const windSpeed = forecast.wind.speed;
        const windGust = forecast.wind.gust ?? "N/A";

        const card = document.createElement("div");
        card.className = "forecast-slot";
        card.innerHTML = `
          <div>${timeLabel}</div>
          <img src="${icon}" alt="${forecast.weather[0].description}" />
          <div>${temp} °F</div>
          <div>💨 ${windSpeed.toFixed(1)} mph</div>
          <div>༄ Gust: ${windGust !== "N/A" ? windGust.toFixed(1) : "N/A"} mph</div>
        `;
        inner.appendChild(card);
      });

      outer.appendChild(inner);
      container.appendChild(outer);
    });

  } catch (err) {
    console.error("Forecast error:", err);
    document.getElementById("forecast").textContent = "Failed to load forecast.";
  }
}

async function updateDashboard() {
  await fetchCurrentData();
  updateLiveTime();
  await fetchForecast();
}

updateDashboard();
setInterval(fetchCurrentData, 5000);
setInterval(updateLiveTime, 1000);
setInterval(fetchForecast, 100000);
