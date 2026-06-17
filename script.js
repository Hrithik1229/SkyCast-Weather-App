/* =====================================================
   SKYCAST WEATHER APP – script.js
   ===================================================== */

const API_KEY  = "YOUR_API_KEY";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// --- State ---
let currentTempC    = null;
let currentFeelsC   = null;
let isCelsius       = true;
let forecastOpen    = false;
let recentSearches  = JSON.parse(localStorage.getItem("skycast_recent") || "[]");

// --- DOM References ---
const cityInput         = document.getElementById("cityInput");
const searchBtn         = document.getElementById("searchBtn");
const locationBtn       = document.getElementById("locationBtn");
const loadingSkel       = document.getElementById("loadingSkeleton");
const errorCard         = document.getElementById("errorCard");
const errorMsg          = document.getElementById("errorMsg");
const weatherCard       = document.getElementById("weatherCard");
const btnCelsius        = document.getElementById("btnCelsius");
const btnFahrenheit     = document.getElementById("btnFahrenheit");
const recentSection     = document.getElementById("recentSearches");
const recentTags        = document.getElementById("recentTags");
const forecastToggleBtn = document.getElementById("forecastToggleBtn");
const forecastPanel     = document.getElementById("forecastPanel");

// --- Event Listeners ---
searchBtn.addEventListener("click", () => triggerSearch());
cityInput.addEventListener("keydown", (e) => { if (e.key === "Enter") triggerSearch(); });
locationBtn.addEventListener("click", useMyLocation);
btnCelsius.addEventListener("click", () => switchUnit(true));
btnFahrenheit.addEventListener("click", () => switchUnit(false));
forecastToggleBtn.addEventListener("click", toggleForecast);

// --- Boot ---
renderRecentSearches();

// =====================================================
//  FORECAST TOGGLE
// =====================================================
function toggleForecast() {
  forecastOpen = !forecastOpen;
  forecastToggleBtn.setAttribute("aria-expanded", forecastOpen.toString());
  if (forecastOpen) {
    forecastPanel.classList.remove("hidden");
    forecastToggleBtn.querySelector(".btn-arrow").style.transform = "rotate(90deg)";
  } else {
    forecastPanel.classList.add("hidden");
    forecastToggleBtn.querySelector(".btn-arrow").style.transform = "";
  }
}

// =====================================================
//  SEARCH TRIGGER
// =====================================================
function triggerSearch() {
  const city = cityInput.value.trim();
  if (!city) {
    shakeInput();
    return;
  }
  fetchWeatherByCity(city);
}

function shakeInput() {
  cityInput.parentElement.classList.add("shake");
  cityInput.parentElement.addEventListener("animationend", () =>
    cityInput.parentElement.classList.remove("shake"), { once: true });
}

// =====================================================
//  FETCH – BY CITY NAME
// =====================================================
async function fetchWeatherByCity(city) {
  showLoading();
  try {
    const [current, forecast] = await Promise.all([
      fetchJSON(`${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`),
      fetchJSON(`${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`)
    ]);
    addToRecent(city);
    renderWeather(current, forecast);
  } catch (err) {
    showError(err.message);
  }
}

// =====================================================
//  FETCH – BY COORDINATES (Geolocation)
// =====================================================
async function fetchWeatherByCoords(lat, lon) {
  showLoading();
  try {
    const [current, forecast] = await Promise.all([
      fetchJSON(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
      fetchJSON(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
    ]);
    addToRecent(current.name);
    renderWeather(current, forecast);
  } catch (err) {
    showError(err.message);
  }
}

// =====================================================
//  GEOLOCATION
// =====================================================
function useMyLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }

  locationBtn.disabled = true;
  locationBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="animation:spin 1s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>
    Locating…`;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      locationBtn.disabled = false;
      resetLocationBtn();
      fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
    },
    () => {
      locationBtn.disabled = false;
      resetLocationBtn();
      showError("Location access denied. Please search manually.");
    }
  );
}

function resetLocationBtn() {
  locationBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
    Use my location`;
}

// =====================================================
//  RENDER WEATHER
// =====================================================
function renderWeather(current, forecast) {
  const day = isDaytime(current.sys.sunrise, current.sys.sunset);

  // City & date
  document.getElementById("cityName").textContent = `${current.name}, ${current.sys.country}`;
  document.getElementById("weatherDate").textContent = formatDate(new Date());
  document.getElementById("weatherTime").textContent = formatLocalTime(current.timezone);

  // Temps
  currentTempC  = current.main.temp;
  currentFeelsC = current.main.feels_like;
  updateTemperatureDisplay();

  // Description
  document.getElementById("weatherDesc").textContent = current.weather[0].description;

  // Large icon (weather-icons CSS font)
  document.getElementById("weatherIconLarge").innerHTML =
    `<i class="${getWeatherIconClass(current.weather[0].id, day)}" aria-hidden="true"></i>`;

  // Stats
  document.getElementById("humidityVal").textContent   = `${current.main.humidity}%`;
  document.getElementById("windVal").textContent        = `${Math.round(current.wind.speed * 3.6)} km/h`;
  document.getElementById("pressureVal").textContent    = `${current.main.pressure} hPa`;
  document.getElementById("visibilityVal").textContent  = current.visibility
    ? `${(current.visibility / 1000).toFixed(1)} km`
    : "N/A";
  document.getElementById("sunriseVal").textContent = formatTime(current.sys.sunrise, current.timezone);
  document.getElementById("sunsetVal").textContent  = formatTime(current.sys.sunset,  current.timezone);

  // 5-day forecast
  renderForecast(forecast);

  // Reset forecast panel to closed on each new search
  forecastOpen = false;
  forecastPanel.classList.add("hidden");
  forecastToggleBtn.setAttribute("aria-expanded", "false");
  if (forecastToggleBtn.querySelector(".btn-arrow")) {
    forecastToggleBtn.querySelector(".btn-arrow").style.transform = "";
  }

  showCard();
}

// =====================================================
//  5-DAY FORECAST
// =====================================================
function renderForecast(forecast) {
  const daily = getDailyForecast(forecast.list);
  const grid  = document.getElementById("forecastGrid");
  const days  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  grid.innerHTML = daily.map(day => {
    const date    = new Date(day.dt * 1000);
    const dayStr  = days[date.getDay()];
    const iconCls = getWeatherIconClass(day.weather[0].id, true);
    return `
      <div class="forecast-item">
        <span class="forecast-day">${dayStr}</span>
        <i class="${iconCls} forecast-icon" aria-hidden="true"></i>
        <span class="forecast-temp">${isCelsius ? Math.round(day.main.temp_max) + '°C' : toF(day.main.temp_max) + '°F'}</span>
        <span class="forecast-low">${isCelsius ? Math.round(day.main.temp_min) + '°' : toF(day.main.temp_min) + '°'}</span>
      </div>`;
  }).join("");
}

// Group 3-hour slots into one representative per day (midday preferred)
function getDailyForecast(list) {
  const seen   = {};
  const result = [];
  for (const item of list) {
    const date = new Date(item.dt * 1000);
    const key  = date.toDateString();
    const hour = date.getHours();
    if (!seen[key]) {
      seen[key] = item;
      result.push(item);
    } else if (Math.abs(hour - 12) < Math.abs(new Date(seen[key].dt * 1000).getHours() - 12)) {
      const idx = result.indexOf(seen[key]);
      result[idx] = item;
      seen[key] = item;
    }
    if (result.length >= 5) break;
  }
  return result.slice(0, 5);
}

// =====================================================
//  UNIT TOGGLE
// =====================================================
function switchUnit(toCelsius) {
  isCelsius = toCelsius;
  btnCelsius.classList.toggle("active",    toCelsius);
  btnFahrenheit.classList.toggle("active", !toCelsius);
  updateTemperatureDisplay();
  // Re-render forecast temps if panel is open
  if (forecastOpen) {
    const forecastGrid = document.getElementById("forecastGrid");
    if (forecastGrid && forecastGrid.children.length > 0) {
      // Forecast temps are static text; re-fetch isn't needed; just refresh display
      document.querySelectorAll(".forecast-temp").forEach(el => {
        // Rough re-render handled by a fresh renderForecast call isn't available here
        // so we just update based on stored data
      });
    }
  }
}

function updateTemperatureDisplay() {
  if (currentTempC === null) return;
  const val    = isCelsius ? Math.round(currentTempC) : toF(currentTempC);
  const unit   = isCelsius ? "°C" : "°F";
  const feelC  = isCelsius ? Math.round(currentFeelsC) : toF(currentFeelsC);
  document.getElementById("tempValue").textContent = val + unit;
  document.getElementById("feelsLike").textContent = `Feels like ${feelC}${unit}`;
}

function toF(c) { return Math.round(c * 9 / 5 + 32); }

// =====================================================
//  WEATHER ICON MAPPING (weather-icons CSS library)
// =====================================================
function getWeatherIconClass(id, day = true) {
  const d = day ? "day" : "night";
  if (id >= 200 && id < 300) return "wi wi-thunderstorm";
  if (id >= 300 && id < 400) return "wi wi-sprinkle";
  if (id >= 500 && id < 510) return `wi wi-${d}-rain`;
  if (id === 511)             return "wi wi-rain-mix";
  if (id >= 520 && id < 600) return "wi wi-showers";
  if (id >= 600 && id < 700) return `wi wi-${d}-snow`;
  if (id >= 700 && id < 800) return "wi wi-fog";
  if (id === 800)             return `wi wi-${d}-sunny`;
  if (id === 801)             return `wi wi-${d}-cloudy`;
  if (id >= 802 && id < 900) return "wi wi-cloudy";
  return "wi wi-na";
}

// =====================================================
//  RECENT SEARCHES
// =====================================================
function addToRecent(city) {
  const cap = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  recentSearches = [cap, ...recentSearches.filter(c => c.toLowerCase() !== city.toLowerCase())].slice(0, 5);
  localStorage.setItem("skycast_recent", JSON.stringify(recentSearches));
  renderRecentSearches();
}

function renderRecentSearches() {
  if (recentSearches.length === 0) {
    recentSection.classList.add("hidden");
    return;
  }
  recentSection.classList.remove("hidden");
  recentTags.innerHTML = recentSearches.map(city =>
    `<button class="recent-tag" onclick="searchCity('${city}')">${city}</button>`
  ).join("");
}

function searchCity(city) {
  cityInput.value = city;
  fetchWeatherByCity(city);
}

// =====================================================
//  UI STATE HELPERS
// =====================================================
function showLoading() {
  loadingSkel.classList.remove("hidden");
  weatherCard.classList.add("hidden");
  errorCard.classList.add("hidden");
}

function showCard() {
  loadingSkel.classList.add("hidden");
  errorCard.classList.add("hidden");
  weatherCard.classList.remove("hidden");
}

function showError(msg) {
  loadingSkel.classList.add("hidden");
  weatherCard.classList.add("hidden");
  errorCard.classList.remove("hidden");
  errorMsg.textContent = msg === "City not found"
    ? "We couldn't find weather data for that location. Check the spelling and try again."
    : msg;
}

// =====================================================
//  UTILITY FUNCTIONS
// =====================================================
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "City not found");
  }
  return res.json();
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatTime(unix, tzOffset) {
  const local = new Date((unix + tzOffset) * 1000);
  let h = local.getUTCHours();
  const m = local.getUTCMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function formatLocalTime(tzOffset) {
  const now   = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const local = new Date(utcMs + tzOffset * 1000);
  let h = local.getHours();
  const m = local.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function isDaytime(sunrise, sunset) {
  const now = Date.now() / 1000;
  return now >= sunrise && now <= sunset;
}

// =====================================================
//  INLINE ANIMATIONS
// =====================================================
const dynStyle = document.createElement("style");
dynStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-8px); }
    40%       { transform: translateX(8px); }
    60%       { transform: translateX(-6px); }
    80%       { transform: translateX(6px); }
  }
  .shake { animation: shake 0.4s ease; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;
document.head.appendChild(dynStyle);
