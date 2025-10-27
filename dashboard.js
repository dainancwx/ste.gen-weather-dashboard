/* dashboard.js
   Replaces previous JS. Reads datalog.csv for current station values,
   fetches OpenWeather 5-day forecast, and renders forecast cards
   into #forecast inside #forecastContainer.
*/

const API_KEY = "f9c86aa8266a0d5c15d39ad5ca0b6c7e"; // <-- replace if needed
const LAT = 37.98110014147534;
const LON = -90.05483401703698;
const DATALOG_PATH = "datalog.csv"; // keep in same dir

// DOM refs
const elTemp = document.getElementById("tempValue");
const elHumidity = document.getElementById("humidityValue");
const elPressure = document.getElementById("pressureValue");
const elWind = document.getElementById("windSpeedValue");
const elWindDir = document.getElementById("windDirValue");
const elLastUpdated = document.getElementById("lastUpdated");
const forecastContainer = document.getElementById("forecast");
const forecastWrapper = document.getElementById("forecastContainer");

// Safety: fallback refs in case IDs differ
if (!elTemp || !elHumidity || !elPressure || !elWind || !elWindDir || !elLastUpdated || !forecastContainer || !forecastWrapper) {
  console.error("One or more required DOM elements were not found. Check element IDs in HTML.");
}

// Make forecast area scrollable vertically after wrapping
// Limit height so first row + second row are visible and then scrollbar appears
forecastWrapper.style.maxHeight = "320px";
forecastWrapper.style.overflowX = "auto";
forecastWrapper.style.overflowY = "auto";
forecastWrapper.style.padding = "8px";
forecastContainer.style.display = "flex";
forecastContainer.style.flexWrap = "wrap";
forecastContainer.style.gap = "10px";

/* -------------------- Current data from datalog.csv -------------------- */
async function fetchCurrentData() {
  try {
    const res = await fetch(DATALOG_PATH, { cache: "no-store" });
    if (!res.ok) throw new Error("datalog.csv fetch failed: " + res.status);
    const text = await res.text();
    const rows = text.trim().split("\n").filter(Boolean);
    if (rows.length === 0) throw new Error("datalog.csv is empty");

    const latest = rows[rows.length - 1].split(",").map(s => s.trim());
    // Your CSV column order from earlier: [timestamp?, windSpeed, windDir, hum, pressure, tempF]
    // Adjust indices here if your CSV layout differs.
    const windSpeed = parseFloat(latest[1]);
    const windDir = parseFloat(latest[2]);
    const hum = parseFloat(latest[3]);
    const pressure = parseFloat(latest[4]);
    const tempF = parseFloat(latest[5]);

    if (!Number.isNaN(tempF)) elTemp.textContent = `${tempF.toFixed(1)} °F`;
    if (!Number.isNaN(hum)) elHumidity.textContent = `${hum.toFixed(1)} %`;
    if (!Number.isNaN(pressure)) {
      // User originally showed hPa — but UI uses inHg sometimes. Keep hPa as earlier; convert if desired.
      elPressure.textContent = `Pressure: ${pressure.toFixed(1)} hPa`;
    }
    if (!Number.isNaN(windSpeed)) elWind.textContent = `${windSpeed.toFixed(1)} mph`;
    if (!Number.isNaN(windDir)) elWindDir.textContent = `${windDir.toFixed(1)}°`;

    // Update lastUpdated timestamp
    const now = new Date();
    elLastUpdated.textContent = `Last Updated: ${now.toLocaleString()}`;
  } catch (err) {
    console.error("fetchCurrentData error:", err);
  }
}

/* -------------------- Live time update (optional) -------------------- */
function updateLiveTimeLabel() {
  const now = new Date();
  if (elLastUpdated) {
    // keep last-updated as date/time of last CSV refresh (we update it in fetchCurrentData),
    // but we can also show a small clock elsewhere if desired. For now, do nothing here.
  }
}

/* -------------------- Forecast (OpenWeather 5-day) -------------------- */
async function fetchForecast() {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=imperial&appid=${API_KEY}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("OpenWeather fetch failed: " + res.status);
    const data = await res.json();
    if (!data.list || !Array.isArray(data.list)) throw new Error("Invalid forecast payload");

    // Clear existing cards
    forecastContainer.innerHTML = "";

    // We'll show entries in order. The container will wrap when it reaches the radar width
    // and allow vertical scrolling beyond two rows (controlled by CSS maxHeight).
    // Show at least first 7 calendar-days worth (but Forecast API provides 5 days).
    // We'll display up to a cap to avoid too many cards at once (cap = 40 entries).
    const cap = Math.min(data.list.length, 40);

    for (let i = 0; i < cap; i++) {
      const item = data.list[i];
      const date = new Date(item.dt * 1000);
      const timeLabel = date.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric" });
      const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;
      const temp = Math.round(item.main.temp);
      const wind = item.wind && typeof item.wind.speed === "number" ? item.wind.speed.toFixed(1) : "-";
      const gust = item.wind && typeof item.wind.gust === "number" ? item.wind.gust.toFixed(1) : "--";

      const card = document.createElement("div");
      card.className = "forecast-card";
      card.style.flex = "0 0 140px"; // fixed width cards, allows wrapping
      card.style.background = "#2b2b2b";
      card.style.borderRadius = "8px";
      card.style.padding = "8px";
      card.style.boxSizing = "border-box";
      card.style.color = "#e9e9e9";
      card.style.textAlign = "center";
      card.innerHTML = `
        <div style="font-size:0.85rem;color:#cfcfcf;margin-bottom:6px">${timeLabel}</div>
        <img src="${iconUrl}" alt="${item.weather[0].description}" style="width:48px;height:48px;margin:4px 0">
        <div style="font-weight:700;font-size:1rem;margin-top:6px">${temp} °F</div>
        <div style="font-size:0.85rem;margin-top:6px">💨 ${wind} mph</div>
        <div style="font-size:0.75rem;color:#aaa">Gust: ${gust} mph</div>
      `;
      forecastContainer.appendChild(card);
    }

    // If there are more entries than fit horizontally, users can scroll horizontally.
    // If it wraps to a second row and becomes tall, vertical scrollbar appears (CSS).
  } catch (err) {
    console.error("fetchForecast error:", err);
    forecastContainer.innerHTML = `<div style="padding:12px;color:#f66">Failed loading forecast</div>`;
  }
}

/* -------------------- Init & intervals -------------------- */
async function updateDashboard() {
  await fetchCurrentData();
  await fetchForecast();
  updateLiveTimeLabel();
}

updateDashboard();

// Keep CSV updated frequently (5s)
setInterval(fetchCurrentData, 5000);
// Update forecast less often (10 minutes)
setInterval(fetchForecast, 10 * 60 * 1000);
// Keep dashboard time label in sync if you decide to show a clock
setInterval(updateLiveTimeLabel, 1000);
