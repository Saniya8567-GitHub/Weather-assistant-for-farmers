import { WiThermometer, WiHumidity, WiCloud, WiStrongWind } from "react-icons/wi";
import { GiFarmer } from "react-icons/gi";
import { useState } from "react";

export default function Weather() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null); // current weather
  const [forecastInfo, setForecastInfo] = useState(null); // computed rain alerts
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_KEY = "78ed0eeee94a2de54804f3e574f7d36c"; // ← replace this with your OpenWeather key

  // ----------------- Helpers -----------------
  // Compute rain totals & generate human-friendly alert messages
  function analyzeForecastList(list) {
    const now = Math.floor(Date.now() / 1000);
    const next24 = now + 24 * 3600;
    const next48 = now + 48 * 3600;

    let total24 = 0;
    let total24to48 = 0;

    for (const item of list) {
      const t = item.dt; // unix timestamp
      const rain3 = (item.rain && (item.rain["3h"] || 0)) || 0;
      // treat thunderstorm as heavy even if rain field absent
      const isThunder = item.weather?.[0]?.main?.toLowerCase().includes("thunder") || false;

      if (t > now && t <= next24) {
        total24 += rain3;
        if (isThunder) total24 += 5; // bias thunder to represent heavy risk
      } else if (t > next24 && t <= next48) {
        total24to48 += rain3;
        if (isThunder) total24to48 += 5;
      }
    }

    // round to 1 decimal
    total24 = Math.round(total24 * 10) / 10;
    total24to48 = Math.round(total24to48 * 10) / 10;

    function classify(mm) {
      if (mm >= 20) return { level: "heavy", text: "Heavy rain" };
      if (mm >= 2) return { level: "moderate", text: "Light/Moderate rain" };
      return { level: "none", text: "No significant rain" };
    }

    const c24 = classify(total24);
    const c48 = classify(total24to48);

    // Build messages
    const msg24 =
      c24.level === "heavy"
        ? `⚠️ Heavy rain expected in next 24 hours (~${total24} mm). Protect stored grain & avoid harvesting.`
        : c24.level === "moderate"
        ? `☔ Rain expected in next 24 hours (~${total24} mm). Consider postponing harvest if wet.`
        : `☀️ No significant rain in next 24 hours (~${total24} mm). Good for field work/harvest.`;

    const msg48 =
      c48.level === "heavy"
        ? `⚠️ Heavy rain expected tomorrow (~${total24to48} mm). Plan accordingly.`
        : c48.level === "moderate"
        ? `☔ Rain likely tomorrow (~${total24to48} mm). Monitor before harvesting.`
        : `☀️ No major rain expected tomorrow (~${total24to48} mm).`;

    return {
      total24,
      total48: total24to48,
      classification24: c24,
      classification48: c48,
      message24: msg24,
      message48: msg48,
    };
  }

  // ----------------- Forecast fetch (by coordinates) -----------------
  async function getForecastByCoords(lat, lon) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      console.log("Fetching forecast:", url);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Forecast fetch failed: ${res.status}`);
      const json = await res.json();
      if (!json.list) throw new Error("Forecast format unexpected");
      const info = analyzeForecastList(json.list);
      setForecastInfo(info);
    } catch (err) {
      console.error("Forecast error:", err);
      setForecastInfo(null);
      // do not overwrite main error if current weather succeeded
    }
  }

  // ----------------- Current weather fetches -----------------
  // by city name
  const fetchWeatherByCity = async () => {
    if (!city) {
      setError("Please enter a city name");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    setForecastInfo(null);
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric`;
      console.log("Fetching current weather:", url);
      const res = await fetch(url);
      if (!res.ok) throw new Error("City not found");
      const json = await res.json();
      setData(json);
      // use returned coords to fetch forecast
      if (json.coord) {
        await getForecastByCoords(json.coord.lat, json.coord.lon);
      }
    } catch (err) {
      setError(err.message);
      setData(null);
      setForecastInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // by coordinates (GPS)
  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    setData(null);
    setForecastInfo(null);
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      console.log("Fetching current weather by coords:", url);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Location not found");
      const json = await res.json();
      setData(json);
      // get forecast as well
      await getForecastByCoords(lat, lon);
    } catch (err) {
      setError(err.message);
      setData(null);
      setForecastInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // ----------------- Handlers -----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetchWeatherByCity();
  };

  const handleLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Location access denied or unavailable");
      }
    );
  };

  // simple crop suggestions (you already have this)
  const getCropSuggestions = (temp) => {
    if (temp >= 10 && temp <= 25) return "Wheat, Mustard, Barley, Potato";
    if (temp >= 18 && temp <= 27) return "Maize, Tomato, Soybean";
    if (temp >= 20 && temp <= 35) return "Rice, Sugarcane, Cotton, Millets";
    if (temp > 35) return "Too hot 🌡️ — consider heat-tolerant crops like Millets";
    if (temp < 10) return "Too cold ❄️ — limited crops grow well";
    return "No specific crop data available";
  };

  // ----------------- Render -----------------
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>🌾 Farmer Weather App</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "12px" }}>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter village/city"
          style={{ padding: "8px", marginRight: "8px" }}
        />
        <button type="submit" disabled={loading}>
          🔍 Get Weather
        </button>
      </form>

      <div style={{ marginBottom: "12px" }}>
        <button onClick={handleLocation} disabled={loading}>
          📍 Use My Location
        </button>
      </div>

      {loading && <p>Loading weather & forecast…</p>}
      {error && <p style={{ color: "salmon" }}>{error}</p>}

      {data && (
        <div
          style={{
            background: "#0b1220cc",
            color: "#fff",
            padding: "18px",
            borderRadius: "12px",
            maxWidth: 480,
            margin: "0 auto",
            boxShadow: "0 6px 20px rgba(2,6,23,0.6)",
            textAlign: "left",
          }}
        >
          <h3 style={{ marginTop: 0 }}>📍 {data.name}{data.sys?.country ? `, ${data.sys.country}` : ""}</h3>

          <p style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <WiThermometer size={22} /> <strong>{Math.round(data.main.temp)}°C</strong>
            <span style={{ marginLeft: 12 }}>Feels: {Math.round(data.main.feels_like)}°C</span>
          </p>

          <p style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <WiHumidity size={20} /> Humidity: {data.main.humidity}% 
          </p>

          <p style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <WiCloud size={20} /> Condition: {data.weather[0].description}
          </p>

          <p style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <WiStrongWind size={20} /> Wind: {data.wind.speed} m/s
          </p>

          <hr style={{ border: "none", height: 1, background: "#203040", margin: "12px 0" }} />

          {/* Crop suggestion */}
          <p style={{ color: "#bde0a8" }}>
            <GiFarmer /> <strong>Best crops for {Math.round(data.main.temp)}°C:</strong> {getCropSuggestions(data.main.temp)}
          </p>

          {/* Rainfall alerts (from forecastInfo) */}
          {forecastInfo ? (
            <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: "#fff8", color: "#111" }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{forecastInfo.message24}</p>
              <p style={{ margin: "6px 0 0" }}>{forecastInfo.message48}</p>
              <p style={{ marginTop: 8, fontSize: 12, color: "#222" }}>
                (Forecast totals: next 24h ≈ {forecastInfo.total24} mm · next 24–48h ≈ {forecastInfo.total48} mm)
              </p>
            </div>
          ) : (
            <p style={{ marginTop: 10, color: "#dbeafe" }}>Forecast not available.</p>
          )}
        </div>
      )}
    </div>
  );
}
