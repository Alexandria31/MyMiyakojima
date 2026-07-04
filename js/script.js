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

// =============================
// RECOMMENDATIONS CATEGORY STATE
// =============================
const categoryLinks = document.querySelectorAll('.category-nav a[href^="#"]');
const categorySections = Array.from(categoryLinks)
  .map(link => {
    const id = link.getAttribute('href');
    return id && id !== '#recommendations-top' ? document.querySelector(id) : null;
  })
  .filter(Boolean);

function updateCategoryActiveState() {
  if (!categoryLinks.length) return;

  let activeId = '#recommendations-top';
  const checkpoint = window.scrollY + Math.min(window.innerHeight * 0.38, 260);

  categorySections.forEach(section => {
    if (section.offsetTop <= checkpoint) {
      activeId = `#${section.id}`;
    }
  });

  categoryLinks.forEach(link => {
    link.classList.toggle('is-active', link.getAttribute('href') === activeId);
  });
}

window.addEventListener('load', updateCategoryActiveState);
window.addEventListener('scroll', updateCategoryActiveState);

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

// =============================
// SELF-UPDATING ISLAND CALENDAR
// =============================
function updateIslandCalendar() {
  const eventCards = Array.from(document.querySelectorAll(".island-event[data-event-date]"));
  if (!eventCards.length) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let firstUpcomingCard = null;

  eventCards.forEach(card => {
    const dateText = card.dataset.eventDate;
    const eventDate = new Date(`${dateText}T00:00:00`);

    if (Number.isNaN(eventDate.getTime())) return;

    const dayDifference = Math.round((eventDate - today) / 86400000);
    const status = card.querySelector(".island-event-status");

    if (dayDifference < 0) {
      card.hidden = true;
      card.setAttribute("aria-hidden", "true");
      return;
    }

    card.hidden = false;
    card.removeAttribute("aria-hidden");

    if (!firstUpcomingCard) firstUpcomingCard = card;

    if (status) {
      let english = "Coming Up";
      let japanese = "開催予定";

      if (dayDifference === 0) {
        english = "Today";
        japanese = "本日開催";
      } else if (dayDifference === 1) {
        english = "Tomorrow";
        japanese = "明日開催";
      } else if (dayDifference <= 7) {
        english = "This Week";
        japanese = "今週開催";
      }

      status.innerHTML = `${english}<span>${japanese}</span>`;
    }
  });

  eventCards.forEach(card => card.classList.remove("island-event-now"));
  if (firstUpcomingCard) firstUpcomingCard.classList.add("island-event-now");

  const calendarGrid = document.querySelector(".island-calendar-grid");
  if (calendarGrid && !firstUpcomingCard) {
    calendarGrid.innerHTML = `
      <p class="island-calendar-empty">
        New island dates are being curated.
        <span>新しい島の予定を準備中です。</span>
      </p>
    `;
  }
}

updateIslandCalendar();

// =============================
// WEEKLY HOMEPAGE UPDATE SIGNAL
// =============================
function updateWeeklySignal() {
  const signal = document.getElementById("weeklyUpdateCount");
  if (!signal) return;

  const count = document.querySelectorAll(".weekly-edit-grid .weekly-note").length;
  signal.innerHTML = `
    <strong>${count}</strong> fresh ${count === 1 ? "update" : "updates"} this week
    <span class="jp">今週の新着情報 ${count}件</span>
  `;
}

updateWeeklySignal();

function readStoredJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStoredJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // The site remains fully usable when private browsing blocks storage.
  }
}

// =============================
// REMEMBER PROFILE LANGUAGE
// =============================
const languagePreferenceKey = "mymiyakojima-language";

function getLanguageFromHash(hash) {
  return /(?:-ja|-jp)$/i.test(hash) ? "ja" : "en";
}

function updateLanguageNavigation() {
  const languageNav = document.querySelector(".language-jump");
  if (!languageNav) return;

  const languageLinks = Array.from(languageNav.querySelectorAll('a[href^="#"]'));
  if (!languageLinks.length) return;

  languageLinks.forEach(link => {
    link.addEventListener("click", () => {
      const language = getLanguageFromHash(link.getAttribute("href") || "");
      writeStoredJson(languagePreferenceKey, language);
      languageLinks.forEach(item => item.classList.toggle("is-active", item === link));
    });
  });

  const preferredLanguage = readStoredJson(languagePreferenceKey, null);
  if (!preferredLanguage || window.location.hash) return;

  const preferredLink = languageLinks.find(link => {
    const language = getLanguageFromHash(link.getAttribute("href") || "");
    return language === preferredLanguage;
  });

  if (!preferredLink) return;

  preferredLink.classList.add("is-active");
  const target = document.querySelector(preferredLink.getAttribute("href"));

  if (target) {
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "auto", block: "start" });
    });
  }
}

updateLanguageNavigation();

// =============================
// REUSABLE PHOTO LIGHTBOX
// =============================
function initializePhotoLightbox() {
  const gallerySelector = [
    ".gallery-image",
    ".spotlight-gallery img",
    ".masa-gallery img",
    ".ran-gallery img",
    ".toppuri-gallery-strip img",
    ".discover-gallery img",
    ".mm-gallery img"
  ].join(",");

  const images = Array.from(document.querySelectorAll(gallerySelector))
    .filter(image => !image.closest("a"));

  if (!images.length) return;

  const dialog = document.createElement("div");
  dialog.className = "photo-lightbox";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-label", "Photo viewer");
  dialog.hidden = true;
  dialog.innerHTML = `
    <button class="photo-lightbox-close" type="button" aria-label="Close photo viewer">×</button>
    <button class="photo-lightbox-arrow photo-lightbox-prev" type="button" aria-label="Previous photo">‹</button>
    <figure>
      <img src="" alt="">
      <figcaption></figcaption>
    </figure>
    <p class="photo-lightbox-count" aria-live="polite"></p>
    <button class="photo-lightbox-arrow photo-lightbox-next" type="button" aria-label="Next photo">›</button>
  `;
  document.body.appendChild(dialog);

  const lightboxImage = dialog.querySelector("img");
  const caption = dialog.querySelector("figcaption");
  const count = dialog.querySelector(".photo-lightbox-count");
  const closeButton = dialog.querySelector(".photo-lightbox-close");
  const previousButton = dialog.querySelector(".photo-lightbox-prev");
  const nextButton = dialog.querySelector(".photo-lightbox-next");
  let currentIndex = 0;
  let touchStartX = 0;

  function renderPhoto(index) {
    currentIndex = (index + images.length) % images.length;
    const source = images[currentIndex];
    const alt = source.getAttribute("alt") || "My Miyakojima photo";

    lightboxImage.src = source.currentSrc || source.src;
    lightboxImage.alt = alt;
    caption.textContent = alt;
    caption.hidden = !source.getAttribute("alt");
    count.textContent = `${currentIndex + 1} / ${images.length}`;
    previousButton.hidden = images.length < 2;
    nextButton.hidden = images.length < 2;
  }

  function openLightbox(index) {
    renderPhoto(index);
    dialog.hidden = false;
    document.body.classList.add("lightbox-open");
    closeButton.focus();
  }

  function closeLightbox() {
    dialog.hidden = true;
    document.body.classList.remove("lightbox-open");
    images[currentIndex].focus();
  }

  images.forEach((image, index) => {
    image.classList.add("lightbox-ready");
    image.setAttribute("tabindex", "0");
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `Open photo ${index + 1} of ${images.length}`);
    image.addEventListener("click", () => openLightbox(index));
    image.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(index);
      }
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  previousButton.addEventListener("click", () => renderPhoto(currentIndex - 1));
  nextButton.addEventListener("click", () => renderPhoto(currentIndex + 1));

  dialog.addEventListener("click", event => {
    if (event.target === dialog) closeLightbox();
  });

  dialog.addEventListener("touchstart", event => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  dialog.addEventListener("touchend", event => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) < 45) return;
    renderPhoto(distance > 0 ? currentIndex - 1 : currentIndex + 1);
  }, { passive: true });

  document.addEventListener("keydown", event => {
    if (dialog.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") renderPhoto(currentIndex - 1);
    if (event.key === "ArrowRight") renderPhoto(currentIndex + 1);
  });
}

initializePhotoLightbox();

// =============================
// AUTOMATIC SEASONAL ROTATION
// =============================
const seasonalNotes = [
  {
    month: "JAN",
    symbol: "島",
    title: "Sugarcane Harvest",
    titleJp: "サトウキビの収穫",
    copy: "Winter brings the steady rhythm of sugarcane harvest across the island.",
    copyJp: "冬の宮古島では、島のあちこちでサトウキビ収穫の季節を迎えます。"
  },
  {
    month: "FEB",
    symbol: "風",
    title: "Gentle Winter Days",
    titleJp: "島のやさしい冬",
    copy: "A quieter season for slow drives, warm local meals, and softer island light.",
    copyJp: "ゆっくりしたドライブや温かい島の味、やわらかな光を楽しむ季節です。"
  },
  {
    month: "MAR",
    symbol: "花",
    title: "Island Blooms",
    titleJp: "島の花々",
    copy: "Early spring color begins returning to Miyakojima's roads and gardens.",
    copyJp: "宮古島の道沿いや庭に、ひと足早い春の彩りが戻ってきます。"
  },
  {
    month: "APR",
    symbol: "海",
    title: "Beach Season Begins",
    titleJp: "海の季節の始まり",
    copy: "Warmer days bring the island's beaches and ocean rhythm back into focus.",
    copyJp: "暖かな日が増え、宮古島らしい海の季節が少しずつ始まります。"
  },
  {
    month: "MAY",
    symbol: "緑",
    title: "Early Summer Green",
    titleJp: "初夏の島の緑",
    copy: "Lush greens and humid island air signal the gentle turn toward summer.",
    copyJp: "深まる緑と島の空気が、夏へ向かう季節の変化を知らせます。"
  },
  {
    month: "JUN",
    symbol: "雨",
    title: "Rain and Island Green",
    titleJp: "雨と島の緑",
    copy: "Passing rain gives the island a deeper green and a slower daily rhythm.",
    copyJp: "通り雨が島の緑を濃くし、いつもよりゆっくりした時間が流れます。"
  },
  {
    month: "JUL",
    symbol: "旬",
    title: "Miyakojima Mango",
    titleJp: "宮古島マンゴー",
    copy: "July brings one of the island's sweetest signs of summer.",
    copyJp: "7月、島はマンゴーがいちばん輝く季節を迎えます。",
    link: "https://www.city.miyakojima.lg.jp/kanko/tokusanhin/kudamono.html",
    linkLabel: "Island Fruits",
    linkLabelJp: "宮古島のフルーツ",
    external: true
  },
  {
    month: "AUG",
    symbol: "星",
    title: "Summer Night Skies",
    titleJp: "夏の夜空",
    copy: "After bright beach days, clear island nights invite a slower look upward.",
    copyJp: "明るい海の日のあとには、島の夜空をゆっくり見上げたくなる季節です。"
  },
  {
    month: "SEP",
    symbol: "海",
    title: "Late Summer Sea",
    titleJp: "晩夏の海",
    copy: "Summer lingers in the water while the island begins to soften toward autumn.",
    copyJp: "海にはまだ夏が残り、島の空気は少しずつ秋へとやわらぎます。"
  },
  {
    month: "OCT",
    symbol: "風",
    title: "Island Autumn",
    titleJp: "島の秋",
    copy: "Gentler heat makes room for outdoor stops, local walks, and longer drives.",
    copyJp: "暑さがやわらぎ、島歩きやローカル巡り、ドライブが心地よい季節です。"
  },
  {
    month: "NOV",
    symbol: "島",
    title: "Slow Island Days",
    titleJp: "ゆっくり流れる島時間",
    copy: "A quieter Miyakojima invites unhurried meals, conversations, and discoveries.",
    copyJp: "静かな宮古島で、食事や会話、小さな発見をゆっくり楽しめます。"
  },
  {
    month: "DEC",
    symbol: "光",
    title: "Warm Winter Light",
    titleJp: "冬のやわらかな光",
    copy: "Soft winter light brings a calm close to another year on the island.",
    copyJp: "やわらかな冬の光とともに、島の一年が穏やかに締めくくられます。"
  }
];

function updateSeasonalNote() {
  const seasonalSection = document.getElementById("seasonNow");
  if (!seasonalSection) return;

  const note = seasonalNotes[new Date().getMonth()];
  const title = document.getElementById("season-now-title");
  const link = document.getElementById("seasonNowLink");

  document.getElementById("seasonNowMonth").textContent = note.month;
  document.getElementById("seasonNowSymbol").textContent = note.symbol;
  title.innerHTML = `${note.title}<span class="jp-title">${note.titleJp}</span>`;
  document.getElementById("seasonNowCopy").textContent = note.copy;
  document.getElementById("seasonNowCopyJp").textContent = note.copyJp;

  const destination = note.link || "discover-miyakojima.html";
  link.href = destination;
  link.querySelector(".season-link-en").textContent = note.linkLabel || "Discover the Season";
  link.querySelector(".season-link-jp").textContent = note.linkLabelJp || "季節の宮古島へ";

  if (note.external) {
    link.target = "_blank";
    link.rel = "noopener";
  } else {
    link.removeAttribute("target");
    link.removeAttribute("rel");
  }
}

updateSeasonalNote();

// =============================
// CURATED LISTING DATA
// =============================
const curatedListings = [
  { href: "pizza-doraku.html", name: "Pizza Doraku", nameJp: "ピザ道楽", category: "food", moods: ["easy", "local"], image: "images/doraku-pizza.jpeg" },
  { href: "captain-marian.html", name: "Captain Marian", nameJp: "キャプテンメリアン", category: "food", moods: ["local", "special"], image: "https://captain-marians.com/serviceimg/gourmet/315092/menu/297793/img1-1748226855669-5367.jpg" },
  { href: "tonkatsu-ichiban-miyakojima.html", name: "Tonkatsu Ichiban", nameJp: "とんかつ一番", category: "food", moods: ["easy", "local"], image: "images/ichiban6.jpg" },
  { href: "para-jiro.html", name: "Pa-ra-jiro", nameJp: "ぱーら二郎", category: "food", moods: ["easy", "local"], image: "images/parajiro-500-yen-bento.jpeg" },
  { href: "burwood-donuts.html", name: "Burwood Donuts", nameJp: "バーウッドドーナツ", category: "food", moods: ["easy", "local"], image: "images/burwood6.jpg" },
  { href: "nii-marine.html", name: "NII Marine", nameJp: "NIIマリン", category: "marine", moods: ["active", "special"], image: "images/nii4.jpeg" },
  { href: "toppuri.html", name: "TOPPURI", nameJp: "トップリ", category: "stays", moods: ["easy", "special"], image: "images/toppuri-live-1.png" },
  { href: "umioto-log.html", name: "UMIOTO log", nameJp: "ウミオトログ", category: "stays", moods: ["easy", "special"], image: "images/umioto7.jpg" },
  { href: "maho-terraces.html", name: "MAHHO TERRACE", nameJp: "マホーテラス", category: "stays", moods: ["easy", "special"], image: "images/maho3.jpg" },
  { href: "coral-rent.html", name: "Coral Rent a Car", nameJp: "コーラルレンタカー", category: "transport", moods: ["easy", "active"], image: "images/rentacar3.jpg" },
  { href: "pine-rentacar.html", name: "Pine Rent a Car", nameJp: "パインレンタカー", category: "transport", moods: ["easy", "active"], image: "images/pine6.jpg" },
  { href: "lomilomi-pono.html", name: "Hawaiian Lomi Lomi Pono", nameJp: "ハワイアンロミロミ＆リラクゼーション ポノ", category: "wellness", moods: ["easy", "special"], image: "images/lomilomi-pono-recommend.jpg" },
  { href: "laso-laso.html", name: "Laso Laso", nameJp: "ラソラソ", category: "lifestyle", moods: ["easy", "local"], image: "images/laso6.jpg" },
  { href: "ggs.html", name: "GGS GAKUGAKU", nameJp: "ジージーエス ガクガク", category: "lifestyle", moods: ["local", "special"], image: "images/ggs-recommend.jpg" }
];

const savedPlacesKey = "mymiyakojima-saved-places";
const recentPlacesKey = "mymiyakojima-recent-places";

function getCurrentPageName() {
  const path = window.location.pathname.split("/").pop();
  return path || "index.html";
}

function getListingByHref(href) {
  return curatedListings.find(listing => listing.href === href);
}

function getSavedPlaces() {
  return readStoredJson(savedPlacesKey, []);
}

function isPlaceSaved(href) {
  return getSavedPlaces().includes(href);
}

function toggleSavedPlace(href) {
  const saved = getSavedPlaces();
  const nextSaved = saved.includes(href)
    ? saved.filter(item => item !== href)
    : [href, ...saved];

  writeStoredJson(savedPlacesKey, nextSaved);
  updateSavedPlaceUi();
}

function createSaveButton(listing, extraClass = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `save-place-button ${extraClass}`.trim();
  button.dataset.saveHref = listing.href;
  button.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    toggleSavedPlace(listing.href);
  });
  return button;
}

function renderSaveButton(button) {
  const saved = isPlaceSaved(button.dataset.saveHref);
  button.classList.toggle("is-saved", saved);
  button.setAttribute("aria-pressed", String(saved));
  button.setAttribute("aria-label", saved ? "Remove from saved island list" : "Save to island list");
  button.innerHTML = `${saved ? "♥" : "♡"}<span>${saved ? "Saved" : "Save"}<small>${saved ? "保存済み" : "保存する"}</small></span>`;
}

function createSavedDrawer() {
  if (document.getElementById("savedPlacesDrawer")) return;

  const drawer = document.createElement("aside");
  drawer.className = "saved-places-drawer";
  drawer.id = "savedPlacesDrawer";
  drawer.setAttribute("aria-labelledby", "savedPlacesTitle");
  drawer.hidden = true;
  drawer.innerHTML = `
    <div class="saved-drawer-header">
      <div>
        <p>My Island List<span>保存した場所</span></p>
        <h2 id="savedPlacesTitle">Saved Places<span>お気に入り</span></h2>
      </div>
      <button type="button" class="saved-drawer-close" aria-label="Close saved places">×</button>
    </div>
    <div class="saved-drawer-list"></div>
  `;
  document.body.appendChild(drawer);

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "saved-places-trigger";
  trigger.innerHTML = `♡<span>Saved<small>保存</small></span><strong>0</strong>`;
  trigger.setAttribute("aria-controls", "savedPlacesDrawer");
  trigger.setAttribute("aria-expanded", "false");
  document.body.appendChild(trigger);

  function closeDrawer() {
    drawer.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("saved-drawer-open");
    trigger.focus();
  }

  trigger.addEventListener("click", () => {
    drawer.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    document.body.classList.add("saved-drawer-open");
    drawer.querySelector(".saved-drawer-close").focus();
  });
  drawer.querySelector(".saved-drawer-close").addEventListener("click", closeDrawer);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !drawer.hidden) closeDrawer();
  });
}

function renderSavedDrawer() {
  const drawer = document.getElementById("savedPlacesDrawer");
  const trigger = document.querySelector(".saved-places-trigger");
  if (!drawer || !trigger) return;

  const saved = getSavedPlaces();
  const savedListings = saved.map(getListingByHref).filter(Boolean);
  const list = drawer.querySelector(".saved-drawer-list");
  trigger.querySelector("strong").textContent = savedListings.length;

  if (!savedListings.length) {
    list.innerHTML = `
      <p class="saved-empty">
        Save places from the Recommended guide to build a personal island list.
        <span>おすすめページから気になる場所を保存すると、自分だけの島リストを作れます。</span>
      </p>
    `;
    return;
  }

  list.innerHTML = savedListings.map(listing => `
    <article class="saved-place-item">
      <img src="${listing.image}" alt="">
      <a href="${listing.href}">
        <strong>${listing.name}</strong>
        <span>${listing.nameJp}</span>
      </a>
      <button type="button" data-remove-saved="${listing.href}" aria-label="Remove ${listing.name}">×</button>
    </article>
  `).join("");

  list.querySelectorAll("[data-remove-saved]").forEach(button => {
    button.addEventListener("click", () => toggleSavedPlace(button.dataset.removeSaved));
  });
}

function updateSavedPlaceUi() {
  document.querySelectorAll("[data-save-href]").forEach(renderSaveButton);
  renderSavedDrawer();
}

function initializeSavedPlaces() {
  const recommendationCards = document.querySelectorAll(".recommend-card");
  const currentListing = getListingByHref(getCurrentPageName());

  if (!recommendationCards.length && !currentListing && !getSavedPlaces().length) return;

  createSavedDrawer();

  recommendationCards.forEach(card => {
    const link = card.querySelector("a.learn-more");
    const listing = link ? getListingByHref(link.getAttribute("href")) : null;
    if (!listing || card.querySelector(".save-place-button")) return;
    card.appendChild(createSaveButton(listing, "save-place-card"));
  });

  if (currentListing) {
    const main = document.querySelector("main");
    if (main) {
      const bar = document.createElement("div");
      bar.className = "listing-save-bar";
      bar.innerHTML = `
        <p>Keep this place for later<span>この場所を島リストに保存</span></p>
      `;
      bar.appendChild(createSaveButton(currentListing, "save-place-detail"));
      const openingSection = main.querySelector(":scope > section");
      if (openingSection) {
        openingSection.insertAdjacentElement("afterend", bar);
      } else {
        main.insertAdjacentElement("afterbegin", bar);
      }
    }
  }

  updateSavedPlaceUi();
}

initializeSavedPlaces();

// =============================
// RECOMMENDATION FINDER
// =============================
function initializeRecommendationFinder() {
  const form = document.getElementById("finderForm");
  const results = document.getElementById("finderResults");
  if (!form || !results) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const category = data.get("finderCategory");
    const mood = data.get("finderMood");

    if (!category && !mood) {
      results.innerHTML = `
        <p class="finder-message">Choose at least one option so My Miyakojima can narrow the guide.<span>ひとつ以上選ぶと、おすすめをご提案できます。</span></p>
      `;
      return;
    }

    const matches = curatedListings
      .filter(listing => !category || listing.category === category)
      .map(listing => ({
        ...listing,
        score: (category && listing.category === category ? 2 : 0) + (mood && listing.moods.includes(mood) ? 2 : 0)
      }))
      .filter(listing => !mood || listing.moods.includes(mood))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (!matches.length) {
      results.innerHTML = `
        <p class="finder-message">No exact match yet. Try another mood or browse all curated picks below.<span>条件に合う場所がまだありません。別の気分を選ぶか、下の厳選ガイドをご覧ください。</span></p>
      `;
      return;
    }

    results.innerHTML = `
      <div class="finder-result-heading">
        <h2>Your Matches<span>あなたへのおすすめ</span></h2>
        <p>Chosen from the My Miyakojima guide.<span>My Miyakojimaの厳選ガイドから選びました。</span></p>
      </div>
      <div class="finder-result-grid">
        ${matches.map(listing => `
          <a href="${listing.href}" class="finder-result-card">
            <img src="${listing.image}" alt="${listing.name}">
            <span>
              <strong>${listing.name}</strong>
              <small>${listing.nameJp}</small>
              View place <em>詳しく見る</em>
            </span>
          </a>
        `).join("")}
      </div>
    `;
    results.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      results.innerHTML = "";
    }, 0);
  });
}

initializeRecommendationFinder();

// =============================
// RECENTLY VIEWED PLACES
// =============================
function recordRecentlyViewed() {
  const currentListing = getListingByHref(getCurrentPageName());
  if (!currentListing) return;

  const existing = readStoredJson(recentPlacesKey, []);
  const next = [
    currentListing.href,
    ...existing.filter(href => href !== currentListing.href)
  ].slice(0, 5);
  writeStoredJson(recentPlacesKey, next);
}

function renderRecentlyViewed() {
  const homepageAnchor = document.querySelector(".island-calendar");
  if (!homepageAnchor || getCurrentPageName() !== "index.html") return;

  const recent = readStoredJson(recentPlacesKey, [])
    .map(getListingByHref)
    .filter(Boolean)
    .slice(0, 4);
  if (!recent.length) return;

  const section = document.createElement("section");
  section.className = "recently-viewed fade-up active show";
  section.innerHTML = `
    <div class="recently-viewed-heading">
      <p class="freshness-kicker">Continue Exploring<span class="jp">島めぐりの続きを</span></p>
      <h2>Recently Viewed<span>最近見た場所</span></h2>
    </div>
    <div class="recently-viewed-grid">
      ${recent.map(listing => `
        <a href="${listing.href}" class="recent-place">
          <img src="${listing.image}" alt="${listing.name}">
          <span><strong>${listing.name}</strong><small>${listing.nameJp}</small></span>
        </a>
      `).join("")}
    </div>
  `;
  homepageAnchor.insertAdjacentElement("beforebegin", section);
}

recordRecentlyViewed();
renderRecentlyViewed();
