// =============================
// MOBILE MENU TOGGLE (CLEAN)
// =============================
function toggleMenu() {
  const menu = document.getElementById("mobileMenu");
  if (!menu) return;

  menu.classList.toggle("show");

document.body.classList.toggle("menu-open");


document
  .getElementById("menuToggle")
  .classList.toggle("active");
}



// =============================
// CLOSE MENU WHEN LINK CLICKED
// (IMPORTANT FOR MOBILE)
// =============================
document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    const menu = document.getElementById("mobileMenu");
    if (menu) {
      menu.classList.remove("show");
    }
  });
});

// =============================
// FADE-UP ANIMATION
// =============================
const elements = document.querySelectorAll('.fade-up');

function revealElements() {
  elements.forEach(el => {
    const top = el.getBoundingClientRect().top;

    if (top < window.innerHeight * 0.9) {
      el.classList.add('show');
      el.classList.add('active');
    }
  });
}

// Run on load
window.addEventListener('load', revealElements);

// Run on scroll
window.addEventListener('scroll', revealElements);

// =============================
// HEADER SCROLL EFFECT
// =============================
window.addEventListener('scroll', function () {
  const header = document.querySelector('.site-header');
  if (!header) return;

  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

window.addEventListener('scroll', function () {
  const nav = document.querySelector('.category-nav');
  if (!nav) return;

  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

function toggleSound() {
  const video = document.getElementById("umiotoVideo");
  const button = document.querySelector(".sound-toggle");

  if (video.muted) {
    video.muted = false;
    video.play();
    button.innerHTML = "🔊";
  } else {
    video.muted = true;
    button.innerHTML = "🔇";
  }
}

const fadeElements = document.querySelectorAll('.fade-up');

const observer = new IntersectionObserver((entries) => {

  entries.forEach(entry => {

    if(entry.isIntersecting){

      entry.target.classList.add('active');
      entry.target.classList.add('show');

    }

  });

}, {
  threshold:0.12
});

fadeElements.forEach(el => {
  observer.observe(el);
});

// =============================
// MIYAKOJIMA WEATHER PEARL
// =============================
const weatherTemp = document.getElementById("miyakoWeatherTemp");
const weatherLabel = document.getElementById("miyakoWeatherLabel");
const weatherPageTemp = document.getElementById("weatherPageTemp");
const weatherPageLabel = document.getElementById("weatherPageLabel");
const weatherPageLabelJp = document.getElementById("weatherPageLabelJp");
const weatherPageWind = document.getElementById("weatherPageWind");
const weatherUpdated = document.getElementById("weatherUpdated");
const weatherForecastGrid = document.getElementById("weatherForecastGrid");
const weatherSummaryNote = document.getElementById("weatherSummaryNote");
const weatherSummaryNoteJp = document.getElementById("weatherSummaryNoteJp");

const weatherDescriptions = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Cloudy",
  45: "Misty",
  48: "Misty",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy showers",
  95: "Thunder nearby"
};

const weatherDescriptionsJp = {
  0: "晴れ",
  1: "おおむね晴れ",
  2: "一部くもり",
  3: "くもり",
  45: "霧",
  48: "霧",
  51: "弱い霧雨",
  53: "霧雨",
  55: "霧雨",
  61: "弱い雨",
  63: "雨",
  65: "強い雨",
  80: "にわか雨",
  81: "にわか雨",
  82: "強いにわか雨",
  95: "雷の可能性"
};

function getWeatherNote(code, rainChance, windSpeed) {
  if (code >= 61 || rainChance >= 60) {
    return {
      en: "Rain may shape the day, so keep plans flexible and bring a light rain layer.",
      jp: "雨の可能性があるため、予定に余裕を持って、軽い雨具があると安心です。"
    };
  }

  if (windSpeed >= 30) {
    return {
      en: "It may be windy near the water, so check ocean conditions before marine activities.",
      jp: "海沿いは風が強くなることがあります。マリンアクティビティ前に海況もご確認ください。"
    };
  }

  if (code <= 2 && rainChance <= 30) {
    return {
      en: "A gentle island day for beaches, bridge drives, and slow local stops.",
      jp: "ビーチや橋のドライブ、ローカルスポット巡りに心地よい一日になりそうです。"
    };
  }

  return {
    en: "A good day to keep plans relaxed and move with the island weather.",
    jp: "天気に合わせて、ゆったり予定を組むのに良い日です。"
  };
}

function formatForecastDate(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

const miyakoWeatherRequests = [
  "https://api.open-meteo.com/v1/forecast?latitude=24.8056&longitude=125.2811&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&forecast_days=7&timezone=Asia%2FTokyo",
  "https://api.open-meteo.com/v1/forecast?latitude=24.8056&longitude=125.2811&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&forecast_days=7&timezone=Asia%2FTokyo"
];

const jmaMiyakoForecastUrl = "https://www.jma.go.jp/bosai/forecast/data/forecast/473000.json";

async function fetchWeatherJson(url) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Weather request failed: ${response.status}`);
    }

    return await response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

function normalizeWeatherData(data) {
  const currentSource = data.current || data.current_weather;
  const daily = data.daily || {};

  if (!currentSource || !daily.time?.length) {
    throw new Error("Weather response is missing current or daily data");
  }

  const current = data.current
    ? {
        temperature: currentSource.temperature_2m,
        weatherCode: currentSource.weather_code,
        windSpeed: currentSource.wind_speed_10m
      }
    : {
        temperature: currentSource.temperature,
        weatherCode: currentSource.weathercode,
        windSpeed: currentSource.windspeed
      };

  return {
    current,
    daily: {
      time: daily.time || [],
      weatherCode: daily.weather_code || daily.weathercode || [],
      high: daily.temperature_2m_max || [],
      low: daily.temperature_2m_min || [],
      rain: daily.precipitation_probability_max || [],
      wind: daily.wind_speed_10m_max || daily.windspeed_10m_max || []
    }
  };
}

const jmaWeatherDescriptions = {
  1: { en: "Mostly sunny", jp: "晴れ" },
  2: { en: "Cloudy", jp: "くもり" },
  3: { en: "Rain", jp: "雨" },
  4: { en: "Snow", jp: "雪" }
};

function describeJmaWeather(code) {
  const firstDigit = Number(String(code || "").charAt(0));
  return jmaWeatherDescriptions[firstDigit] || { en: "Official forecast", jp: "天気予報" };
}

function getJmaSeries(data, predicate) {
  const blocks = Array.isArray(data) ? data : [];

  for (const block of blocks) {
    for (const series of block.timeSeries || []) {
      if (predicate(series)) return series;
    }
  }

  return null;
}

function getJmaArea(series, field) {
  return series?.areas?.find(area => {
    const name = area.area?.name || "";
    return name.includes("宮古") && Array.isArray(area[field]);
  }) || series?.areas?.find(area => Array.isArray(area[field])) || null;
}

function normalizeJmaForecast(data) {
  const shortSeries = getJmaSeries(data, series => getJmaArea(series, "weatherCodes")?.weatherCodes?.length);
  const weeklySeries = getJmaSeries(data, series => getJmaArea(series, "weatherCodes")?.weatherCodes?.length >= 5) || shortSeries;
  const tempSeries = getJmaSeries(data, series => getJmaArea(series, "tempsMax") || getJmaArea(series, "temps"));

  const weatherArea = getJmaArea(weeklySeries, "weatherCodes") || getJmaArea(shortSeries, "weatherCodes");
  const tempAreaMax = getJmaArea(tempSeries, "tempsMax");
  const tempAreaMin = getJmaArea(tempSeries, "tempsMin");
  const tempArea = getJmaArea(tempSeries, "temps");
  const times = weeklySeries?.timeDefines || shortSeries?.timeDefines || [];
  const codes = weatherArea?.weatherCodes || [];

  if (!times.length || !codes.length) {
    throw new Error("JMA response is missing forecast data");
  }

  const firstDescription = describeJmaWeather(codes[0]);
  const temps = tempArea?.temps || [];
  const firstTemp = Number(temps.find(value => value !== "" && value !== null));
  const maxTemps = tempAreaMax?.tempsMax || [];
  const minTemps = tempAreaMin?.tempsMin || [];

  return {
    source: "JMA",
    current: {
      temperature: Number.isFinite(firstTemp) ? firstTemp : null,
      weatherCode: codes[0],
      weatherLabel: firstDescription.en,
      weatherLabelJp: firstDescription.jp,
      windSpeed: null
    },
    daily: {
      time: times.slice(0, 7).map(value => value.slice(0, 10)),
      weatherCode: codes.slice(0, 7),
      high: maxTemps.slice(0, 7).map(value => Number(value)),
      low: minTemps.slice(0, 7).map(value => Number(value)),
      rain: new Array(Math.min(7, times.length)).fill(null),
      wind: new Array(Math.min(7, times.length)).fill(null)
    }
  };
}

async function loadMiyakoWeather() {
  if (!weatherTemp && !weatherPageTemp && !weatherForecastGrid) return;

  try {
    let normalized;
    let lastError;

    for (const url of miyakoWeatherRequests) {
      try {
        normalized = normalizeWeatherData(await fetchWeatherJson(url));
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!normalized) {
      try {
        normalized = normalizeJmaForecast(await fetchWeatherJson(jmaMiyakoForecastUrl));
      } catch (error) {
        lastError = error;
      }
    }

    if (!normalized) {
      throw lastError || new Error("Weather unavailable");
    }

    const { current, daily } = normalized;
    const temp = Number.isFinite(current.temperature) ? Math.round(current.temperature) : null;
    const label = current.weatherLabel || weatherDescriptions[current.weatherCode] || "Island weather";
    const labelJp = current.weatherLabelJp || weatherDescriptionsJp[current.weatherCode] || "島の天気";
    const wind = Math.round(current.windSpeed || 0);

    if (weatherTemp) weatherTemp.textContent = temp === null ? "Forecast" : `${temp}°C`;
    if (weatherLabel) weatherLabel.textContent = label;

    if (weatherPageTemp) weatherPageTemp.textContent = temp === null ? "Forecast" : `${temp}°C`;
    if (weatherPageLabel) weatherPageLabel.textContent = label;
    if (weatherPageLabelJp) weatherPageLabelJp.textContent = labelJp;
    if (weatherPageWind) weatherPageWind.textContent = current.windSpeed === null ? "Wind: see local conditions" : `Wind: ${wind} km/h`;
    if (weatherUpdated) weatherUpdated.textContent = normalized.source === "JMA" ? "Updated with official JMA forecast data." : "Updated with live Open-Meteo data.";

    const firstRainChance = daily.rain?.[0] || 0;
    const firstWindSpeed = daily.wind?.[0] || wind;
    const note = getWeatherNote(current.weatherCode, firstRainChance, firstWindSpeed);

    if (weatherSummaryNote) weatherSummaryNote.textContent = note.en;
    if (weatherSummaryNoteJp) weatherSummaryNoteJp.textContent = note.jp;

    if (weatherForecastGrid && daily.time.length) {
      weatherForecastGrid.innerHTML = daily.time.map((day, index) => {
        const code = daily.weatherCode[index];
        const jmaDescription = normalized.source === "JMA" ? describeJmaWeather(code) : null;
        const dayLabel = jmaDescription?.en || weatherDescriptions[code] || "Island weather";
        const dayLabelJp = jmaDescription?.jp || weatherDescriptionsJp[code] || "島の天気";
        const high = Number.isFinite(daily.high[index]) ? Math.round(daily.high[index]) : null;
        const low = Number.isFinite(daily.low[index]) ? Math.round(daily.low[index]) : null;
        const rainValue = daily.rain[index];
        const rain = rainValue === null || rainValue === undefined ? null : rainValue;
        const dayWind = daily.wind[index] === null || daily.wind[index] === undefined ? null : Math.round(daily.wind[index] || 0);
        const temperatureText = high === null || low === null ? "See details" : `${high}°C / ${low}°C`;
        const detailText = normalized.source === "JMA"
          ? '<span>Official JMA</span>'
          : `<span>Rain ${rain}%</span><span>Wind ${dayWind} km/h</span>`;

        return `
          <article class="forecast-card">
            <p class="forecast-date">${formatForecastDate(day)}</p>
            <h3>${temperatureText}</h3>
            <p>${dayLabel}</p>
            <p class="jp">${dayLabelJp}</p>
            <div class="forecast-details">
              ${detailText}
            </div>
          </article>
        `;
      }).join("");
    }
  } catch (error) {
    console.warn("Miyakojima weather could not load:", error);

    if (weatherTemp) weatherTemp.textContent = "Weather";
    if (weatherLabel) weatherLabel.textContent = "Tap for forecast";
    if (weatherPageTemp) weatherPageTemp.textContent = "Weather unavailable";
    if (weatherPageLabel) weatherPageLabel.textContent = "Please check again soon.";
    if (weatherPageLabelJp) weatherPageLabelJp.textContent = "時間をおいて再度ご確認ください。";
    if (weatherForecastGrid) {
      weatherForecastGrid.innerHTML = '<p class="weather-loading">Forecast is temporarily unavailable.</p>';
    }
  }
}

loadMiyakoWeather();
