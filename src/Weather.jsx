import { useState } from "react";

export default function Weather() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  // ===== Step 1: Fetch weather =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setData(null);

    try {
      const apiKey = "YOUR_API_KEY"; // <-- put your OpenWeatherMap API key
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      if (!res.ok) throw new Error("City not found");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    }
  };

  // ===== Step 2: Simple crop advice based on temperature =====
  const getAdvice = (temp) => {
    if (temp >= 25) return "Great time for rice, sugarcane, or maize.";
    if (temp >= 15) return "Good for wheat, barley, and vegetables.";
    if (temp >= 5)  return "Suitable for mustard and some pulses.";
    return "Too cold—protect crops with covers or greenhouses.";
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Farmer Weather & Crop Tips</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter village/city"
          style={{ padding: "0.5rem", width: "70%" }}
        />
        <button type="submit" style={{ padding: "0.5rem", marginLeft: "0.5rem" }}>
          Get Weather
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <div style={{ textAlign: "left", background: "#f2f2f2", padding: "1rem", borderRadius: "8px" }}>
          <h3>{data.name}</h3>
          <p>Temperature: {data.main.temp} °C</p>
          <p>Humidity: {data.main.humidity}%</p>
          <p>Condition: {data.weather[0].description}</p>
          <p>Wind Speed: {data.wind.speed} m/s</p>

          <hr />
          <strong>Crop Advice:</strong>
          <p>{getAdvice(data.main.temp)}</p>
        </div>
      )}
    </div>
  );
}
