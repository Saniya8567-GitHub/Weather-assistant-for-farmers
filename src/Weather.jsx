import { WiThermometer, WiHumidity, WiCloud, WiStrongWind } from "react-icons/wi";
import { GiFarmer } from "react-icons/gi"; // crop/farmer symbol
import { useState } from "react";

export default function Weather() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const apiKey = "78ed0eeee94a2de54804f3e574f7d36c"; // <-- replace with your actual key

  const fetchWeather = async (url) => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Location not found");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleCitySubmit = (e) => {
    e.preventDefault();
    fetchWeather(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeather(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
        );
      },
      () => setError("Unable to retrieve your location")
    );
  };

  const getAdvice = (temp, condition) => {
    if (temp > 35) return "Too hot 🌞. Irrigate crops more frequently.";
     if (temp < 10) return "Very cold ❄️. Protect crops from frost.";
    if (condition.includes("rain")) return "Rainy 🌧️. Store harvested crops safely.";
    return "Weather looks fine 👍. Good conditions for farming.";
  };

  return (
    <div className="container">
      <h2>🌾 Farmer Weather App</h2>

      <form onSubmit={handleCitySubmit} className="form">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter village/city"
        />
        <button type="submit">Get Weather</button>
        <button type="button" onClick={handleMyLocation}>
          Use My Location
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}


      {data && (
        <div style={{ textAlign: "left", background: "#402b79ff", padding: "1rem", borderRadius: "8px" }}>
          <h3>{data.name}</h3>
          <p><WiThermometer size={24}/>Temperature: {data.main.temp} °C</p>
          <p><WiHumidity size={24}/>Humidity: {data.main.humidity}%</p>
          <p><WiCloud size={24}/>Condition: {data.weather[0].description}</p>
          <p><WiStrongWind size={24}/>Wind Speed: {data.wind.speed} m/s</p>
          <h3><GiFarmer size={24}/>Farmer Advice:</h3>
          <hr />
          <strong>Crop Advice:</strong>
          <p>{getAdvice(data.main.temp,data.weather[0].description)}</p>
        </div>
      )}
    </div>
  );
}
