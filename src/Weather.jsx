import { useState } from "react";

export default function Weather() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // API call will go here
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
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
