import { WiThermometer, WiHumidity, WiCloud, WiStrongWind } from "react-icons/wi";
import { GiFarmer } from "react-icons/gi";
import React, { useState } from "react";
import "./Weather.css"; 

const VITE_WEATHER_KEY = "78ed0eeee94a2de54804f3e574f7d36c"; // ✅ Replace with your API key

export default function Weather() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastInfo, setForecastInfo] = useState(null);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState("");
  const [locationText, setLocationText] = useState("");
  const [language, setLanguage] = useState("en"); // 🌐 Language state

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

  // ---------------- Farmer Advice -----------------
  function generateAdvice(data) {
    if (!data) return;
    const temp = data.main.temp;
    const condition = data.weather[0].main.toLowerCase();

    if (condition.includes("rain")) {
      setAdvice("☔ Heavy rainfall expected — cover stored grains & delay irrigation.");
    } else if (condition.includes("cloud")) {
      setAdvice("🌥️ Cloudy day — suitable for fertilizer application.");
    } else if (condition.includes("clear")) {
      if (temp > 32) {
        setAdvice("☀️ Hot & dry — good day for harvesting wheat, maize, or cotton.");
      } else {
        setAdvice("🌾 Clear skies — suitable for sowing or harvesting pulses & cereals.");
      }
    } else if (condition.includes("storm")) {
      setAdvice("⚠️ Thunderstorm warning — secure loose items & avoid spraying pesticides.");
    } else {
      setAdvice("🪴 Normal weather — continue regular farm activities.");
    }
  }

  // ---------------- Language Translations -----------------
  const translations = {
    en: {
      title: "🌾 Smart Weather Assistant",
      search: "Search",
      useLocation: "📍 Use My Location",
      rainfallAlerts: "☔ Rainfall Alerts",
      next24: "Next 24 hrs:",
      forecast: "📅 5-Day Forecast",
      advice: "🌿 Farmer Advice",
      loading: "Loading...",
      noRain: "☀️ No rain expected",
      rainExpected: "🌧️ Expected",
    },
    hi: {
      title: "🌾 स्मार्ट मौसम सहायक",
      search: "खोजें",
      useLocation: "📍 मेरा स्थान उपयोग करें",
      rainfallAlerts: "☔ वर्षा अलर्ट",
      next24: "अगले 24 घंटे:",
      forecast: "📅 5-दिवसीय पूर्वानुमान",
      advice: "🌿 किसान सलाह",
      loading: "लोड हो रहा है...",
      noRain: "☀️ बारिश की संभावना नहीं",
      rainExpected: "🌧️ बारिश की संभावना",
    },
    mr: {
      title: "🌾 स्मार्ट हवामान सहाय्यक",
      search: "शोधा",
      useLocation: "📍 माझे स्थान वापरा",
      rainfallAlerts: "☔ पावसाचा इशारा",
      next24: "पुढील 24 तास:",
      forecast: "📅 5 दिवसांचा अंदाज",
      advice: "🌿 शेतकरी सल्ला",
      loading: "लोड होत आहे...",
      noRain: "☀️ पाऊस अपेक्षित नाही",
      rainExpected: "🌧️ पाऊस अपेक्षित",
    },
  };

  const t = translations[language];

  return (
    <div className="weather-container">
      <h2 className="title">{t.title}</h2>

      <div className="lang-select">
        🌐 <span>Select Language:</span>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
        </select>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={getWeatherByCity} disabled={loading}>
          {loading ? t.loading : t.search}
        </button>
        <button className="gps-btn" onClick={getWeatherByLocation}>
          {t.useLocation}
        </button>
      </div>

      {locationText && <p className="location-text">{locationText}</p>}

      {weatherData && (
        <div className="weather-box">
          <h3>{weatherData.name}</h3>
          <p>
            <WiThermometer size={24} /> {weatherData.main.temp}°C
          </p>
          <p>
            <WiCloud size={24} /> {weatherData.weather[0].description}
          </p>
          <p>
            <WiStrongWind size={24} /> {weatherData.wind.speed} m/s
          </p>
          <p>
            <WiHumidity size={24} /> {weatherData.main.humidity}%
          </p>
        </div>
      )}

      {forecastInfo && (
        <div className="forecast-alert">
          <h4><strong>{t.rainfallAlerts}</strong></h4>
          <p>
            {t.next24}{" "}
            {forecastInfo.rain24
              ? `${t.rainExpected} (${forecastInfo.total24} mm)`
              : t.noRain}
          </p>
        </div>
      )}

      {dailyForecast.length > 0 && (
        <div className="forecast-section">
          <h4>{t.forecast}</h4>
          <div className="forecast-grid">
            {dailyForecast.map((day, i) => (
              <div key={i} className="forecast-card">
                <p>
                  <strong>{day.day}</strong>
                </p>
                <p>{day.temp}°C</p>
                <p>{day.condition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {advice && (
        <div className="farmer-advice">
          <h4>{t.advice}</h4>
          <p>
            <GiFarmer size={22} /> {advice}
          </p>
        </div>
      )}
    </div>
  );
}
