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
const elWind = document.getElementById("windValue");
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
    if (!Number.isNaN(windSpeed)) elWind.textContent = `${windS
