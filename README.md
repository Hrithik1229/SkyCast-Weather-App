# SkyCast 🌤️

A beautiful, responsive real-time weather application built with vanilla HTML, CSS, and JavaScript — powered by the [OpenWeatherMap API](https://openweathermap.org/api).

---

## ✨ Features

- 🔍 **City Search** — Search weather for any city in the world
- 📍 **GPS Location** — Detect your current location automatically
- 🌡️ **Unit Toggle** — Switch between Celsius and Fahrenheit
- 📊 **Live Stats** — Humidity, Wind Speed, Pressure, Visibility, Sunrise & Sunset
- 📅 **5-Day Forecast** — Toggle-able daily forecast panel
- 🕐 **Local Time** — Displays the current local time for the searched city
- 🕘 **Recent Searches** — Last 5 searches saved in `localStorage`
- 💀 **Loading Skeleton** — Animated placeholder while fetching data
- ⚠️ **Error Handling** — Friendly message for invalid city names
- 📱 **Fully Responsive** — Works seamlessly on mobile, tablet, and desktop

---

## 🖥️ Preview

> Full-screen mountain landscape background with a glassmorphic weather card showing temperature, weather icon, city name, date/time, and a 6-stat info row.

---

## 🗂️ Project Structure

```
Weather-App/
├── index.html   # App structure & markup
├── style.css    # All styling (vanilla CSS, no frameworks)
├── script.js    # App logic & OpenWeatherMap API calls
└── README.md    # Project documentation
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Weather-App.git
cd Weather-App
```

### 2. Add your API key

Open `script.js` and replace the existing key with your own from [openweathermap.org](https://openweathermap.org/api):

```js
const API_KEY = "your_api_key_here";
```

### 3. Run locally

Use any static file server. With Node.js:

```bash
npx serve .
```

Or simply open `index.html` directly in your browser.

---

## 🔌 API Reference

This app uses two endpoints from the **OpenWeatherMap** free tier:

| Endpoint | Usage |
|---|---|
| `/data/2.5/weather` | Current weather by city name or coordinates |
| `/data/2.5/forecast` | 3-hour interval forecast (used for 5-day summary) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 (semantic) |
| Styling | Vanilla CSS (custom properties, grid, flexbox) |
| Logic | Vanilla JavaScript (ES6+, async/await, Fetch API) |
| Icons | [Weather Icons](https://erikflowers.github.io/weather-icons/) CSS library |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |
| Data | [OpenWeatherMap API](https://openweathermap.org/api) |

---

## 📦 Dependencies

No build tools or npm packages required. All dependencies are loaded via CDN:

- `weather-icons` — `cdnjs.cloudflare.com`
- `Inter` font — `fonts.googleapis.com`

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout Changes |
|---|---|
| `< 900px` | Stats row → 3 columns; weather card stacks vertically |
| `< 640px` | Stats row → 2 columns; forecast → 3 items shown |
| `< 400px` | Stats row → 2 columns (compact) |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙌 Acknowledgements

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Background photo by [Unsplash](https://unsplash.com/)
- Icons by [Erik Flowers' Weather Icons](https://erikflowers.github.io/weather-icons/)
