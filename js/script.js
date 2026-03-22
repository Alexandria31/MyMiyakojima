// =========================
// MOBILE MENU TOGGLE
// =========================
function toggleMenu() {
  const menu = document.getElementById("MobileMenu");
  menu.classList.toggle("open");
}


// =========================
// HEADER SCROLL COLOR
// =========================
window.addEventListener("scroll", () => {
  const header = document.querySelector(".site-header");

  if (window.scrollY > 50) {
    header.style.backgroundColor = "rgba(74,173,168,1)";
  } else {
    header.style.backgroundColor = "rgba(74,173,168,0.8)";
  }
});


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