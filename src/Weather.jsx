import { useState } from "react";
import "./Weather.css";

export default function Weather() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    try {
      setError("");
      setData(null);

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&units=metric&appid=${import.meta.env.VITE_WEATHER_KEY}`
      );

      if (!res.ok) {
        throw new Error("City not found");
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    }
    console.log("API KEY:", import.meta.env.VITE_WEATHER_KEY);
console.log("CITY:", city);

  };
return (
  <div>
    <h2>Weather for Farmers</h2>
    <form onSubmit={handleSubmit}>
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter village/city"
      />
      <button type="submit">Get Weather</button>
    </form>

    {data && (
      <div>
        <p>Temperature: {data.main.temp} °C</p>
        <p>Humidity: {data.main.humidity}%</p>
        <p>Condition: {data.weather[0].description}</p>
        <p>Wind Speed: {data.wind.speed} m/s</p>
      </div>
    )}
  </div>
);

}
