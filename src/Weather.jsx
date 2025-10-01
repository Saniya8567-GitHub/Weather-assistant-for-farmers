import { WiThermometer, WiHumidity, WiCloud, WiStrongWind } from "react-icons/wi";
import { GiFarmer } from "react-icons/gi"; // crop/farmer symbol
import { useState } from "react";

export default function Weather() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const API_KEY = "78ed0eeee94a2de54804f3e574f7d36c"; // 🔑 Replace with your OpenWeatherMap key

  // Function to fetch weather by city name
  const fetchWeatherByCity = async () => {
    if (!city) return;
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      if (!res.ok) throw new Error("City not found");
      const result = await res.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
      setData(null);
    }
  };

  // Function to fetch weather by coordinates
  const fetchWeatherByCoords = async (lat, lon) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    console.log("🌍 Fetching weather from:", url); // debug
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    const result = await res.json();
    console.log("✅ Weather Data:", result); // debug
    setData(result);
    setError(null);
  } catch (err) {
    console.error("❌ Fetch error:", err);
    setError("Could not fetch weather for your location ❌");
    setData(null);
  }
};


  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetchWeatherByCity();
  };

  // Handle "Use My Location"
  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (err) => {
          setError("Location access denied ❌");
        }
      );
    } else {
      setError("Geolocation not supported on this browser");
    }
  };

  // 🌾 Crop suggestions based on temperature
  const getCropSuggestions = (temp) => {
    if (temp >= 10 && temp <= 25) return "Wheat, Mustard, Barley, Potato";
    if (temp >= 18 && temp <= 27) return "Maize, Tomato, Soybean";
    if (temp >= 20 && temp <= 35) return "Rice, Sugarcane, Cotton, Millets";
    if (temp > 35) return "Too hot 🌡️ — consider heat-tolerant crops like Millets";
    if (temp < 10) return "Too cold ❄️ — limited crops grow well";
    return "No specific crop data available";
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>🌾 Farmer Weather App</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter village/city"
          style={{ padding: "10px", marginRight: "10px" }}
        />
        <button type="submit">Get Weather</button>
      </form>

      <button onClick={handleLocation} style={{ marginBottom: "20px" }}>
        📍 Use My Location
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <div
          style={{
            background: "#ffffff22",
            padding: "20px",
            borderRadius: "10px",
            maxWidth: "400px",
            margin: "0 auto",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          <p><WiThermometer size={24}/>Temperature: {data.main.temp} °C</p>
          <p><WiHumidity size={24}/>Humidity: {data.main.humidity}%</p>
          <p><WiCloud size={24}/>Condition: {data.weather[0].description}</p>
          <p><WiStrongWind size={24}/>Wind Speed: {data.wind.speed} m/s</p>
          <h3><GiFarmer size={24}/>Farmer Advice:</h3>
          <hr />
          <p>
            🌱 <strong>Best crops for {data.main.temp}°C:</strong>{" "}
            {getCropSuggestions(data.main.temp)}
          </p>
        </div>
      )}
    </div>
  );
}
