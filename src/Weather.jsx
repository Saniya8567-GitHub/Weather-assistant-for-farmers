// src/Weather.jsx
import { useEffect, useState } from "react";
import "./Weather.css";

export default function Weather() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favCities") || "[]");
    } catch {
      return [];
    }
  });

  const API_KEY = import.meta.env.VITE_WEATHER_KEY;

  useEffect(() => {
    // Try to detect location once on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (err) => {
          // silent fail — user can enter city manually
          console.log("Geolocation error:", err.message);
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWeatherByCity = async (cityName) => {
    const q = cityName.trim();
    if (!q) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        q
      )}&units=metric&appid=${API_KEY}`;

      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) {
        // OpenWeather returns helpful message in json.message
        throw new Error(json.message || "Unable to find city");
      }
      setData(json);
    } catch (err) {
      setError(err.message || "Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Unable to fetch by coords");
      setData(json);
    } catch (err) {
      setError(err.message || "Failed to fetch weather by location");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeatherByCity(city);
  };

  const addFavorite = () => {
    if (!data || !data.name) return;
    const cityName = data.name;
    if (favorites.includes(cityName)) return;
    const updated = [...favorites, cityName];
    setFavorites(updated);
    localStorage.setItem("favCities", JSON.stringify(updated));
  };

  const removeFavorite = (cityName) => {
    const updated = favorites.filter((c) => c !== cityName);
    setFavorites(updated);
    localStorage.setItem("favCities", JSON.stringify(updated));
  };

  const loadFavorite = (cityName) => {
    setCity(cityName);
    fetchWeatherByCity(cityName);
  };

  return (
    <div className="weather-box">
      <h2 className="title">Weather for Farmers</h2>

      <form className="form-row" onSubmit={handleSubmit}>
        <input
          className="city-input"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter village / city (e.g. Delhi)"
        />
        <button className="btn" type="submit" disabled={loading}>
          Get Weather
        </button>
        <button
          type="button"
          className="btn alt"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
                (err) => setError("Unable to access location: " + err.message)
              );
            } else {
              setError("Geolocation not supported in your browser.");
            }
          }}
        >
          Use My Location
        </button>
      </form>

      {loading && (
        <div className="loader-row">
          <div className="spinner" aria-hidden="true"></div>
          <span>Loading...</span>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {data && data.main && (
        <div className="weather-card">
          <div className="card-top">
            <div className="city-name">
              {data.name}
              {data.sys && data.sys.country ? `, ${data.sys.country}` : ""}
            </div>
            {data.weather && data.weather[0] && (
              <img
                className="weather-icon"
                src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
                alt={data.weather[0].description}
              />
            )}
          </div>

          <div className="card-body">
            <div className="temp">{Math.round(data.main.temp)}°C</div>
            <div className="desc">{data.weather?.[0]?.description}</div>

            <div className="metrics">
              <div>Humidity: {data.main.humidity}%</div>
              <div>Wind: {data.wind?.speed ?? "-"} m/s</div>
              <div>Pressure: {data.main.pressure} hPa</div>
            </div>

            <div className="card-actions">
              <button className="btn" onClick={addFavorite} disabled={favorites.includes(data.name)}>
                {favorites.includes(data.name) ? "Saved" : "Save to Favorites"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fav-section">
        <h3>Favorites</h3>
        {favorites.length === 0 ? (
          <p className="muted">No saved places yet — save the current city to see it here.</p>
        ) : (
          <ul className="fav-list">
            {favorites.map((c) => (
              <li key={c} className="fav-item">
                <button className="link-btn" onClick={() => loadFavorite(c)}>
                  {c}
                </button>
                <button className="btn small" onClick={() => removeFavorite(c)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
