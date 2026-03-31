// =========================
// MOBILE MENU TOGGLE
// =========================
function toggleMenu() {
  const menu = document.getElementById("mobileMenu");
  if (!menu) {
    console.log("Menu not found");
  } else {
    menu.classList.toggle("show");
  }
}





// =========================
// FADE-UP ANIMATION (FIXED)
// =========================
const elements = document.querySelectorAll(".fade-up");

function revealElements() {
  elements.forEach(el => {
    const top = el.getBoundingClientRect().top;

    if (top < window.innerHeight * 0.9) {
      el.classList.add("show");
    }
  });
}

// RUN ON LOAD (IMPORTANT)
window.addEventListener("load", revealElements);

// RUN ON SCROLL
window.addEventListener("scroll", revealElements);

window.addEventListener("scroll", function () {
  const header = document.querySelector(".site-header");

  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

const nav = document.querySelector(".main-nav");
const overlay = document.querySelector(".menu-overlay");

nav.classList.toggle("open");
overlay.classList.toggle("show");