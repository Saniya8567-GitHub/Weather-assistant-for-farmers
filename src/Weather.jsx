import { WiThermometer, WiHumidity, WiCloud, WiStrongWind } from "react-icons/wi";
import { GiFarmer } from "react-icons/gi";
import { useState } from "react";

export default function Weather() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [forecastInfo, setForecastInfo] = useState(null);
  const [forecastList, setForecastList] = useState([]); // 🌤️ for 5-day forecast
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_KEY = "78ed0eeee94a2de54804f3e574f7d36c";

  // ---------- Helper to analyze rain ----------
  function analyzeForecastList(list) {
    const now = Math.floor(Date.now() / 1000);
    const next24 = now + 24 * 3600;
    const next48 = now + 48 * 3600;
    let total24 = 0,
      total24to48 = 0;

    for (const item of list) {
      const t = item.dt;
      const rain3 = (item.rain && (item.rain["3h"] || 0)) || 0;
      const isThunder =
        item.weather?.[0]?.main?.toLowerCase().includes("thunder") || false;
      if (t > now && t <= next24) {
        total24 += rain3;
        if (isThunder) total24 += 5;
      } else if (t > next24 && t <= next48) {
        total24to48 += rain3;
        if (isThunder) total24to48 += 5;
      }
    }

    total24 = Math.round(total24 * 10) / 10;
    total24to48 = Math.round(total24to48 * 10) / 10;

    function classify(mm) {
      if (mm >= 20) return { level: "heavy", text: "Heavy rain" };
      if (mm >= 2) return { level: "moderate", text: "Light/Moderate rain" };
      return { level: "none", text: "No significant rain" };
    }

    const c24 = classify(total24);
    const c48 = classify(total24to48);

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
      message24: msg24,
      message48: msg48,
    };
  }

  // ---------- Forecast fetch (by coordinates) ----------
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

      // 🌤️ Extract 5-day simplified forecast
      const daily = [];
      const seen = new Set();
      for (const item of json.list) {
        const date = item.dt_txt.split(" ")[0];
        if (!seen.has(date)) {
          seen.add(date);
          daily.push(item);
        }
      }
      setForecastList(daily.slice(1, 6));
    } catch (err) {
      console.error("Forecast error:", err);
      setForecastInfo(null);
      setForecastList([]);
    }
  }

  // ---------- Current weather ----------
  const fetchWeatherByCity = async () => {
    if (!city) {
      setError("Please enter a city name");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    setForecastInfo(null);
    setForecastList([]);
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("City not found");
      const json = await res.json();
      setData(json);
      if (json.coord) await getForecastByCoords(json.coord.lat, json.coord.lon);
    } catch (err) {
      setError(err.message);
      setData(null);
      setForecastInfo(null);
      setForecastList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    setData(null);
    setForecastInfo(null);
    setForecastList([]);
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Location not found");
      const json = await res.json();
      setData(json);
      await getForecastByCoords(lat, lon);
    } catch (err) {
      setError(err.message);
      setData(null);
      setForecastInfo(null);
      setForecastList([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Handlers ----------
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
      () => setError("Location access denied or unavailable")
    );
  };

  const getCropSuggestions = (temp) => {
    if (temp >= 10 && temp <= 25) return "Wheat, Mustard, Barley, Potato";
    if (temp >= 18 && temp <= 27) return "Maize, Tomato, Soybean";
    if (temp >= 20 && temp <= 35) return "Rice, Sugarcane, Cotton, Millets";
    if (temp > 35) return "Too hot 🌡️ — consider heat-tolerant crops like Millets";
    if (temp < 10) return "Too cold ❄️ — limited crops grow well";
    return "No specific crop data available";
  };

  // ---------- Render ----------
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
        <button type="submit" disabled={loading}>🔍 Get Weather</button>
      </form>

      <div style={{ marginBottom: "12px" }}>
        <button onClick={handleLocation} disabled={loading}>📍 Use My Location</button>
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
          <h3 style={{ marginTop: 0 }}>
            📍 {data.name}
            {data.sys?.country ? `, ${data.sys.country}` : ""}
          </h3>

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

          <p style={{ color: "#bde0a8" }}>
            <GiFarmer /> <strong>Best crops for {Math.round(data.main.temp)}°C:</strong>{" "}
            {getCropSuggestions(data.main.temp)}
          </p>

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

          {/* 🌤️ Extended 5-Day Forecast */}
          {forecastList.length > 0 && (
            <div
              style={{
                marginTop: 18,
                background: "#1b2437",
                borderRadius: 10,
                padding: 12,
                color: "#fff",
                boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
              }}
            >
              <h4 style={{ textAlign: "center", marginBottom: 10 }}>📅 5-Day Forecast</h4>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                {forecastList.map((day, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#22314d",
                      borderRadius: 8,
                      padding: 10,
                      width: 100,
                      textAlign: "center",
                      color: "#e0f2fe",
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: "bold" }}>
                      {new Date(day.dt_txt).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                      })}
                    </p>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                      alt="icon"
                      style={{ width: 45, height: 45 }}
                    />
                    <p style={{ margin: 0, fontWeight: "bold" }}>
                      {Math.round(day.main.temp)}°C
                    </p>
                    <p style={{ fontSize: 13, margin: 0 }}>
                      {day.weather[0].main}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
