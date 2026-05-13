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