function toggleMenu() {
  const menu = document.getElementById("MobileMenu");
  menu.classList.toggle("open");
}

window.addEventListener("scroll", function () {
  const header = document.querySelector(".site-header");

  if (window.scrollY > 50) {
    header.style.backgroundColor = "rgba(74,173,168,1)";
  } else {
    header.style.backgroundColor = "rgba(74,173,168,0.8)";
  }
});

const comingSection = document.querySelector('.coming-soon');

window.addEventListener('scroll', () => {
  const trigger = window.innerHeight * 0.85;
  const top = comingSection.getBoundingClientRect().top;

  if (top < trigger) {
    comingSection.classList.add('show');
  }
});

window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

const elements = document.querySelectorAll('.fade-up');

window.addEventListener('scroll', () => {
  elements.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight * 0.85) {
      el.classList.add('show');
    } 
  });
});