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

async function loadMiyakoWeather() {
  if (!weatherTemp && !weatherPageTemp && !weatherForecastGrid) return;

  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=24.8056&longitude=125.2811&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&forecast_days=7&timezone=Asia%2FTokyo"
    );

    if (!response.ok) throw new Error("Weather unavailable");

    const data = await response.json();
    const current = data.current;
    const temp = Math.round(current.temperature_2m);
    const label = weatherDescriptions[current.weather_code] || "Island weather";
    const labelJp = weatherDescriptionsJp[current.weather_code] || "島の天気";
    const wind = Math.round(current.wind_speed_10m || 0);

    if (weatherTemp) weatherTemp.textContent = `${temp}C`;
    if (weatherLabel) weatherLabel.textContent = label;

    if (weatherPageTemp) weatherPageTemp.textContent = `${temp}C`;
    if (weatherPageLabel) weatherPageLabel.textContent = label;
    if (weatherPageLabelJp) weatherPageLabelJp.textContent = labelJp;
    if (weatherPageWind) weatherPageWind.textContent = `Wind: ${wind} km/h`;
    if (weatherUpdated) weatherUpdated.textContent = "Updated with live Open-Meteo data.";

    const daily = data.daily;
    const firstRainChance = daily.precipitation_probability_max?.[0] || 0;
    const firstWindSpeed = daily.wind_speed_10m_max?.[0] || wind;
    const note = getWeatherNote(current.weather_code, firstRainChance, firstWindSpeed);

    if (weatherSummaryNote) weatherSummaryNote.textContent = note.en;
    if (weatherSummaryNoteJp) weatherSummaryNoteJp.textContent = note.jp;

    if (weatherForecastGrid && daily?.time?.length) {
      weatherForecastGrid.innerHTML = daily.time.map((day, index) => {
        const code = daily.weather_code[index];
        const dayLabel = weatherDescriptions[code] || "Island weather";
        const dayLabelJp = weatherDescriptionsJp[code] || "島の天気";
        const high = Math.round(daily.temperature_2m_max[index]);
        const low = Math.round(daily.temperature_2m_min[index]);
        const rainValue = daily.precipitation_probability_max[index];
        const rain = rainValue === null || rainValue === undefined ? 0 : rainValue;
        const dayWind = Math.round(daily.wind_speed_10m_max[index] || 0);

        return `
          <article class="forecast-card">
            <p class="forecast-date">${formatForecastDate(day)}</p>
            <h3>${high}C / ${low}C</h3>
            <p>${dayLabel}</p>
            <p class="jp">${dayLabelJp}</p>
            <div class="forecast-details">
              <span>Rain ${rain}%</span>
              <span>Wind ${dayWind} km/h</span>
            </div>
          </article>
        `;
      }).join("");
    }
  } catch (error) {
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
