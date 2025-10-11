import React, { useState } from "react";
import { WiThermometer, WiHumidity, WiCloud, WiStrongWind } from "react-icons/wi";
import { GiFarmer } from "react-icons/gi";
import "./Weather.css";
import { useTranslation } from "react-i18next";

const VITE_WEATHER_KEY = "78ed0eeee94a2de54804f3e574f7d36c"; // Replace with your API key

export default function Weather() {
  const { t, i18n } = useTranslation();

  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastInfo, setForecastInfo] = useState(null);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState("");
  const [cropSuggestion, setCropSuggestion] = useState("");
  const [locationText, setLocationText] = useState("");
  const [language, setLanguage] = useState("en");

  // ---------------- Fetch Weather by City -----------------
  async function getWeatherByCity() {
    if (!city) return;
    setLoading(true);
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${VITE_WEATHER_KEY}&units=metric&lang=${language}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("City not found");
      const json = await res.json();
      setWeatherData(json);
      getForecastByCoords(json.coord.lat, json.coord.lon);
      generateAdvice(json);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setWeatherData(null);
      setForecastInfo(null);
      setDailyForecast([]);
      setAdvice("City not found or invalid input.");
      setCropSuggestion("");
    } finally {
      setLoading(false);
    }
  }

  // ---------------- Fetch Weather by GPS -----------------
  async function getWeatherByLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation not supported in your browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setLocationText(`📍 Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`);
        try {
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${VITE_WEATHER_KEY}&units=metric&lang=${language}`;
          const res = await fetch(url);
          const json = await res.json();
          setWeatherData(json);
          getForecastByCoords(lat, lon);
          generateAdvice(json);
        } catch (err) {
          console.error("GPS weather error:", err);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        alert("Unable to fetch location. Please allow location access.");
        setLoading(false);
      }
    );
  }

  // ---------------- Fetch Forecast -----------------
  async function getForecastByCoords(lat, lon) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${VITE_WEATHER_KEY}&units=metric&lang=${language}`;
      const res = await fetch(url);
      const json = await res.json();

      const info = analyzeForecastList(json.list);
      setForecastInfo(info);

      const grouped = {};
      json.list.forEach((entry) => {
        const date = new Date(entry.dt_txt).toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
        });
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(entry);
      });

      const daily = Object.entries(grouped)
        .slice(0, 5)
        .map(([day, values]) => {
          const temps = values.map((v) => v.main.temp);
          const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
          const condition = values[0].weather[0].description;
          return { day, temp: avgTemp.toFixed(1), condition };
        });

      setDailyForecast(daily);
    } catch (err) {
      console.error("Forecast fetch error:", err);
    }
  }

  // ---------------- Analyze Rainfall -----------------
  function analyzeForecastList(list) {
    const next24 = list.slice(0, 8);
    const total24 = next24.reduce(
      (sum, e) => sum + (e.rain ? e.rain["3h"] || 0 : 0),
      0
    );

    return {
      rain24: total24 > 0,
      total24: total24.toFixed(1),
    };
  }

  // ---------------- Farmer Advice + Crop Suggestion -----------------
  function generateAdvice(data) {
    if (!data) return;
    const temp = data.main.temp;
    const condition = data.weather[0].main.toLowerCase();
    let weatherAdvice = "";
    let crop = "";

    if (condition.includes("rain")) {
      weatherAdvice =
        "☔ Heavy rainfall expected — cover stored grains & delay irrigation.";
      crop = "🌾 Best crops: Rice, Jute, Sugarcane.";
    } else if (condition.includes("cloud")) {
      weatherAdvice = "🌥️ Cloudy day — suitable for fertilizer application.";
      crop = "🌽 Best crops: Maize, Cotton, Soybean.";
    } else if (condition.includes("clear")) {
      if (temp > 32) {
        weatherAdvice = "☀️ Hot & dry — good day for harvesting wheat or maize.";
        crop = "🌿 Suitable crops: Bajra, Groundnut, Cotton.";
      } else {
        weatherAdvice = "🌾 Clear skies — great for sowing or harvesting pulses.";
        crop = "🌱 Suitable crops: Lentil, Chickpea, Mustard.";
      }
    } else if (condition.includes("storm")) {
      weatherAdvice =
        "⚠️ Thunderstorm warning — secure loose items & avoid pesticide spraying.";
      crop = "🚫 Avoid field work until weather clears.";
    } else {
      weatherAdvice = "🪴 Normal weather — continue regular farm activities.";
      crop = "🌻 Suitable crops: Vegetables, Sugarcane, Paddy.";
    }

    setAdvice(weatherAdvice);
    setCropSuggestion(crop);
  }

  // ---------------- Language Switch -----------------
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="weather-container">
      <h2 className="title">{t("title", { defaultValue: "🌾 Smart Weather Assistant" })}</h2>

      <div className="lang-select">
        🌐 <span>{t("selectLang", { defaultValue: "Select Language:" })}</span>
        <select value={language} onChange={handleLanguageChange}>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
        </select>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder={t("enterCity", { defaultValue: "Enter city..." })}
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={getWeatherByCity} disabled={loading}>
          {loading ? t("loading", { defaultValue: "Loading..." }) : t("search", { defaultValue: "Search" })}
        </button>
        <button className="gps-btn" onClick={getWeatherByLocation}>
          {t("useLocation", { defaultValue: "📍 Use My Location" })}
        </button>
      </div>

      {locationText && <p className="location-text">{locationText}</p>}

      {weatherData && (
        <div className="weather-box">
          <h3>{weatherData.name}</h3>
          <p><WiThermometer size={24} /> {weatherData.main.temp}°C</p>
          <p><WiCloud size={24} /> {weatherData.weather[0].description}</p>
          <p><WiStrongWind size={24} /> {weatherData.wind.speed} m/s</p>
          <p><WiHumidity size={24} /> {weatherData.main.humidity}%</p>
        </div>
      )}

      {forecastInfo && (
        <div className="forecast-alert">
          <h4><strong>{t("rainfallAlerts", { defaultValue: "☔ Rainfall Alerts" })}</strong></h4>
          <p>
            {t("next24", { defaultValue: "Next 24 hrs:" })}{" "}
            {forecastInfo.rain24
              ? `🌧️ Expected (${forecastInfo.total24} mm)`
              : "☀️ No rain expected"}
          </p>
        </div>
      )}

      {dailyForecast.length > 0 && (
        <div className="forecast-section">
          <h4>{t("forecast", { defaultValue: "📅 5-Day Forecast" })}</h4>
          <div className="forecast-grid">
            {dailyForecast.map((day, i) => (
              <div key={i} className="forecast-card">
                <p><strong>{day.day}</strong></p>
                <p>{day.temp}°C</p>
                <p>{day.condition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(advice || cropSuggestion) && (
        <div className="farmer-advice">
          <h4>🌿 Farmer Advice</h4>
          <p><GiFarmer size={22} /> {advice}</p>
          <p className="crop-suggestion">{cropSuggestion}</p>
        </div>
      )}
    </div>
  );
}
