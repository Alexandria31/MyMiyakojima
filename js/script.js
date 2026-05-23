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
    const toggle = document.getElementById("menuToggle");
    if (menu) {
      menu.classList.remove("show");
    }
    document.body.classList.remove("menu-open");
    if (toggle) {
      toggle.classList.remove("active");
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
    button.innerHTML = "矧";
  } else {
    video.muted = true;
    button.innerHTML = "這";
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

async function loadMiyakoWeather() {
  if (!weatherTemp || !weatherLabel) return;

  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=24.8056&longitude=125.2811&current=temperature_2m,weather_code&timezone=Asia%2FTokyo"
    );

    if (!response.ok) throw new Error("Weather unavailable");

    const data = await response.json();
    const current = data.current;
    const temp = Math.round(current.temperature_2m);
    const label = weatherDescriptions[current.weather_code] || "Island weather";

    weatherTemp.textContent = `${temp}C`;
    weatherLabel.textContent = label;
  } catch (error) {
    weatherTemp.textContent = "Fresh picks";
    weatherLabel.textContent = "Updated monthly";
  }
}

loadMiyakoWeather();
