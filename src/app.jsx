import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const weatherMap = {
  0: { label: "Clear Sky", icon: "☀️", mood: "sunny" },
  1: { label: "Mainly Clear", icon: "🌤️", mood: "sunny" },
  2: { label: "Partly Cloudy", icon: "⛅", mood: "cloudy" },
  3: { label: "Overcast", icon: "☁️", mood: "cloudy" },
  45: { label: "Fog", icon: "🌫️", mood: "cloudy" },
  48: { label: "Rime Fog", icon: "🌫️", mood: "cloudy" },
  51: { label: "Light Drizzle", icon: "🌦️", mood: "rainy" },
  53: { label: "Drizzle", icon: "🌦️", mood: "rainy" },
  55: { label: "Heavy Drizzle", icon: "🌧️", mood: "rainy" },
  61: { label: "Light Rain", icon: "🌧️", mood: "rainy" },
  63: { label: "Rain", icon: "🌧️", mood: "rainy" },
  65: { label: "Heavy Rain", icon: "⛈️", mood: "rainy" },
  71: { label: "Light Snow", icon: "🌨️", mood: "cloudy" },
  73: { label: "Snow", icon: "🌨️", mood: "cloudy" },
  75: { label: "Heavy Snow", icon: "❄️", mood: "cloudy" },
  80: { label: "Rain Showers", icon: "🌦️", mood: "rainy" },
  81: { label: "Rain Showers", icon: "🌧️", mood: "rainy" },
  82: { label: "Violent Showers", icon: "⛈️", mood: "thunder" },
  95: { label: "Thunderstorm", icon: "⛈️", mood: "thunder" },
  96: { label: "Thunder + Hail", icon: "⛈️", mood: "thunder" },
  99: { label: "Severe Thunder", icon: "⛈️", mood: "thunder" },
};

const cx = (...classes) => classes.filter(Boolean).join(" ");
const getWeather = (code) => weatherMap[code] || { label: "Unknown", icon: "🌡️", mood: "cloudy" };
const hourLabel = (iso) => new Date(iso).toLocaleTimeString([], { hour: "numeric" });
const dayLabel = (iso) => new Date(iso).toLocaleDateString([], { weekday: "short" });

function Icon({ name, className = "" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    search: (
      <svg {...common}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    pin: (
      <svg {...common}>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    wind: (
      <svg {...common}>
        <path d="M3 8h12a3 3 0 1 0-3-3" />
        <path d="M4 12h16" />
        <path d="M3 16h10a3 3 0 1 1-3 3" />
      </svg>
    ),
    droplets: (
      <svg {...common}>
        <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.31-3.2C8.94 8.1 8 7 7 5.3 6 7 5.06 8.1 4.31 9.05 3.57 10 3 11.09 3 12.25c0 2.22 1.8 4.05 4 4.05Z" />
        <path d="M17 20c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.31-3.2C18.94 11.8 18 10.7 17 9c-1 1.7-1.94 2.8-2.69 3.75-.74.94-1.31 2.04-1.31 3.2C13 18.17 14.8 20 17 20Z" />
      </svg>
    ),
    rain: (
      <svg {...common}>
        <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.1A7 7 0 1 0 4 14.9" />
        <path d="M8 19v1" />
        <path d="M8 14v1" />
        <path d="M16 19v1" />
        <path d="M16 14v1" />
        <path d="M12 21v1" />
        <path d="M12 16v1" />
      </svg>
    ),
    temp: (
      <svg {...common}>
        <path d="M14 14.76V5a2 2 0 1 0-4 0v9.76a4 4 0 1 0 4 0Z" />
      </svg>
    ),
    alert: (
      <svg {...common}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    ),
    navigation: (
      <svg {...common}>
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    ),
    loader: (
      <svg {...common}>
        <path d="M21 12a9 9 0 1 1-6.2-8.56" />
      </svg>
    ),
  };

  return icons[name] || null;
}

function runSelfTests() {
  console.assert(getWeather(0).label === "Clear Sky", "Weather code 0 should map to Clear Sky");
  console.assert(getWeather(95).mood === "thunder", "Weather code 95 should map to thunder mood");
  console.assert(getWeather(999).label === "Unknown", "Unknown weather codes should be handled safely");
  console.assert(typeof hourLabel("2026-04-29T16:00") === "string", "hourLabel should return a readable string");
  console.assert(dayLabel("2026-04-29").length > 0, "dayLabel should return a weekday string");
}

if (typeof window !== "undefined" && !window.__WEATHER_TRACKER_TESTED__) {
  window.__WEATHER_TRACKER_TESTED__ = true;
  runSelfTests();
}

function GlassCard({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={cx(
        "rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

function WeatherAmbience({ mood }) {
  const bg = {
    sunny: "from-slate-950 via-sky-950 to-amber-900",
    cloudy: "from-slate-950 via-slate-800 to-blue-950",
    rainy: "from-slate-950 via-blue-950 to-cyan-950",
    thunder: "from-black via-slate-950 to-violet-950",
    night: "from-slate-950 via-indigo-950 to-black",
  }[mood] || "from-slate-950 via-blue-950 to-slate-900";

  const rainDrops = useMemo(
    () =>
      Array.from({ length: 70 }).map((_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        delay: `${(i % 20) / 10}s`,
        duration: `${0.65 + (i % 10) / 15}s`,
      })),
    []
  );

  return (
    <div className={cx("fixed inset-0 -z-10 bg-gradient-to-br", bg)}>
      <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute right-0 top-32 h-[30rem] w-[30rem] rounded-full bg-fuchsia-400/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />
      {(mood === "rainy" || mood === "thunder") && (
        <div className="absolute inset-0 overflow-hidden opacity-40">
          {rainDrops.map((drop) => (
            <span
              key={drop.id}
              className="absolute h-14 w-px animate-rain rounded-full bg-cyan-100/40"
              style={{ left: drop.left, animationDelay: drop.delay, animationDuration: drop.duration }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchBar({ onSearch, onLocation, loading }) {
  const [query, setQuery] = useState("Dhaka");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (query.trim()) onSearch(query.trim());
      }}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <div className="relative flex-1">
        <Icon name="search" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city..."
          className="h-14 w-full rounded-2xl border border-white/15 bg-white/10 pl-12 pr-4 text-white outline-none backdrop-blur-xl placeholder:text-white/45 focus:border-cyan-300/60"
        />
      </div>
      <button
        className="h-14 rounded-2xl bg-white px-6 font-semibold text-slate-950 transition hover:scale-[1.02]"
        disabled={loading}
      >
        {loading ? <Icon name="loader" className="mx-auto h-5 w-5 animate-spin" /> : "Track Weather"}
      </button>
      <button
        type="button"
        onClick={onLocation}
        className="h-14 rounded-2xl border border-white/15 bg-white/10 px-5 text-white backdrop-blur-xl transition hover:bg-white/20"
        aria-label="Use my current location"
      >
        <Icon name="navigation" className="mx-auto h-5 w-5" />
      </button>
    </form>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
      <Icon name={icon} className="mb-3 h-5 w-5 text-cyan-200" />
      <p className="text-sm text-white/55">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function App() {
  const [place, setPlace] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchWeather(lat, lon, name = "Current Location", country = "") {
    setLoading(true);
    setError("");
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Weather API failed");
      const data = await res.json();
      setPlace({ name, country, lat, lon });
      setWeather(data);
    } catch (err) {
      setError("Could not load weather data. Try another city or check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function searchCity(city) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
      if (!res.ok) throw new Error("Geocoding API failed");
      const data = await res.json();
      const found = data.results?.[0];
      if (!found) throw new Error("City not found");
      await fetchWeather(found.latitude, found.longitude, found.name, found.country);
    } catch (err) {
      setError("City not found. Please search another location.");
      setLoading(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => {
        setError("Location permission denied. Search a city instead.");
        setLoading(false);
      }
    );
  }

  useEffect(() => {
    searchCity("Dhaka");
  }, []);

  const parsed = useMemo(() => {
    if (!weather?.current || !weather?.hourly || !weather?.daily) return null;

    const current = weather.current;
    const hourly = weather.hourly.time.map((time, i) => ({
      time,
      temp: Math.round(weather.hourly.temperature_2m?.[i] ?? 0),
      feels: Math.round(weather.hourly.apparent_temperature?.[i] ?? weather.hourly.temperature_2m?.[i] ?? 0),
      rain: weather.hourly.precipitation_probability?.[i] ?? 0,
      precipitation: weather.hourly.precipitation?.[i] ?? 0,
      code: weather.hourly.weather_code?.[i] ?? 3,
      wind: Math.round(weather.hourly.wind_speed_10m?.[i] ?? 0),
      humidity: weather.hourly.relative_humidity_2m?.[i] ?? 0,
    }));

    const now = new Date();
    const next24 = hourly.filter((h) => new Date(h.time) >= now).slice(0, 24);
    const rainyHour = next24.find((h) => h.rain >= 45 || h.precipitation > 0);
    const highestRain = [...next24].sort((a, b) => b.rain - a.rain)[0];
    const daily = weather.daily.time.map((time, i) => ({
      time,
      code: weather.daily.weather_code?.[i] ?? 3,
      max: Math.round(weather.daily.temperature_2m_max?.[i] ?? 0),
      min: Math.round(weather.daily.temperature_2m_min?.[i] ?? 0),
      rain: weather.daily.precipitation_probability_max?.[i] ?? 0,
    }));

    return { current, next24, daily, rainyHour, highestRain };
  }, [weather]);

  const currentWeather = parsed ? getWeather(parsed.current.weather_code) : getWeather(2);
  const mood = currentWeather.mood;
  const alerts = parsed
    ? [
        parsed.highestRain?.rain > 60 && {
          title: "Rain warning",
          text: `${parsed.highestRain.rain}% chance around ${hourLabel(parsed.highestRain.time)}`,
          icon: "rain",
        },
        parsed.current.wind_speed_10m > 35 && {
          title: "Wind warning",
          text: `${Math.round(parsed.current.wind_speed_10m)} km/h wind right now`,
          icon: "wind",
        },
        parsed.current.temperature_2m > 34 && {
          title: "Heat warning",
          text: `${Math.round(parsed.current.temperature_2m)}°C temperature now`,
          icon: "temp",
        },
      ].filter(Boolean)
    : [];

  return (
    <main className="min-h-screen overflow-hidden px-4 sm:px-6 lg:px-8 text-white">
      <style>{`@keyframes rain{0%{transform:translateY(-120px)}100%{transform:translateY(110vh)}}.animate-rain{animation:rain linear infinite}`}</style>
      <WeatherAmbience mood={mood} />

      <div className="mx-auto w-full max-w-[1160px] py-6">
        <header className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/70 backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-300" /> Live Weather Intelligence
            </div>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Advanced Weather Tracker</h1>
            <p className="mt-3 max-w-2xl text-white/60">
              Search any city, track live weather, hourly rain chance, and the next 7-day forecast with real API data.
            </p>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-sm text-white/45">Powered by</p>
            <p className="text-lg font-semibold">Open-Meteo API · No API key</p>
          </div>
        </header>

        <GlassCard className="mb-6">
          <SearchBar onSearch={searchCity} onLocation={useMyLocation} loading={loading} />
          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-rose-200">
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </GlassCard>

        {loading && !parsed ? (
          <GlassCard className="flex h-80 items-center justify-center">
            <Icon name="loader" className="h-10 w-10 animate-spin text-cyan-200" />
          </GlassCard>
        ) : parsed ? (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
            <section className="space-y-6">
              <GlassCard className="relative overflow-hidden p-7">
                <div className="absolute right-8 top-8 text-8xl opacity-80">{currentWeather.icon}</div>
                <div className="relative">
                  <div className="mb-4 flex items-center gap-2 text-white/60">
                    <Icon name="pin" className="h-4 w-4" /> {place?.name}
                    {place?.country ? `, ${place.country}` : ""}
                  </div>
                  <div className="text-8xl font-black tracking-tighter sm:text-9xl">{Math.round(parsed.current.temperature_2m)}°</div>
                  <h2 className="mt-2 text-2xl font-bold">{currentWeather.label}</h2>
                  <p className="mt-1 text-white/55">Feels like {Math.round(parsed.current.apparent_temperature)}°C</p>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-4">
                  <Stat icon="droplets" label="Humidity" value={`${parsed.current.relative_humidity_2m}%`} />
                  <Stat icon="wind" label="Wind" value={`${Math.round(parsed.current.wind_speed_10m)} km/h`} />
                  <Stat icon="rain" label="Rain now" value={`${parsed.current.precipitation} mm`} />
                  <Stat icon="temp" label="Feels like" value={`${Math.round(parsed.current.apparent_temperature)}°C`} />
                </div>
              </GlassCard>

              <GlassCard>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-bold">Rain Prediction</h3>
                    <p className="text-sm text-white/50">Next 24-hour precipitation intelligence</p>
                  </div>
                  <Icon name="rain" className="h-8 w-8 text-cyan-200" />
                </div>
                <div className="rounded-3xl bg-black/20 p-5">
                  <p className="text-xl font-semibold">
                    {parsed.rainyHour ? `Rain may start around ${hourLabel(parsed.rainyHour.time)}` : "No rain expected in the next 24 hours"}
                  </p>
                  <p className="mt-2 text-white/60">
                    Highest rain chance: {parsed.highestRain?.rain ?? 0}% at {parsed.highestRain ? hourLabel(parsed.highestRain.time) : "N/A"}
                  </p>
                </div>
                <div className="mt-5 grid grid-cols-6 gap-2 sm:grid-cols-12">
                  {parsed.next24.slice(0, 12).map((h) => (
                    <div key={h.time} className="text-center">
                      <div className="mb-2 text-xs text-white/45">{hourLabel(h.time)}</div>
                      <div className="relative mx-auto h-24 w-3 overflow-hidden rounded-full bg-white/10">
                        <div className="absolute bottom-0 w-full rounded-full bg-cyan-200" style={{ height: `${Math.min(100, Math.max(0, h.rain))}%` }} />
                      </div>
                      <div className="mt-2 text-xs font-semibold">{h.rain}%</div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="mb-5 text-2xl font-bold">Next 24 Hours</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {parsed.next24.map((h) => {
                    const wh = getWeather(h.code);
                    return (
                      <div key={h.time} className="min-w-28 rounded-3xl border border-white/10 bg-white/10 p-4 text-center">
                        <p className="text-sm text-white/50">{hourLabel(h.time)}</p>
                        <p className="my-3 text-3xl">{wh.icon}</p>
                        <p className="text-xl font-bold">{h.temp}°</p>
                        <p className="mt-1 text-xs text-cyan-100">{h.rain}% rain</p>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </section>

            <aside className="space-y-6">
              <GlassCard>
                <h3 className="mb-5 text-2xl font-bold">7-Day Forecast</h3>
                <div className="space-y-3">
                  {parsed.daily.map((d) => {
                    const wh = getWeather(d.code);
                    return (
                      <div key={d.time} className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{wh.icon}</span>
                          <div>
                            <p className="font-semibold">{dayLabel(d.time)}</p>
                            <p className="text-xs text-white/45">{wh.label}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {d.max}° / {d.min}°
                          </p>
                          <p className="text-xs text-cyan-100">{d.rain}% rain</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              <GlassCard>
                <div className="mb-5 flex items-center gap-2">
                  <Icon name="alert" className="h-5 w-5 text-amber-200" />
                  <h3 className="text-2xl font-bold">Smart Alerts</h3>
                </div>
                {alerts.length ? (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.title} className="rounded-2xl border border-amber-200/20 bg-amber-300/10 p-4">
                        <Icon name={alert.icon} className="mb-2 h-5 w-5 text-amber-100" />
                        <p className="font-semibold">{alert.title}</p>
                        <p className="text-sm text-white/55">{alert.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-emerald-300/10 p-4 text-emerald-100">No major weather alerts right now.</div>
                )}
              </GlassCard>

              <GlassCard>
                <h3 className="mb-3 text-2xl font-bold">API Setup</h3>
                <p className="text-sm leading-6 text-white/60">
                  This build uses Open-Meteo Forecast + Geocoding APIs. No signup, no API key, and no .env file required for non-commercial projects.
                </p>
              </GlassCard>
            </aside>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default App;
