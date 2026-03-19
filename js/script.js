document.addEventListener("DOMContentLoaded", function () {

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

if (menuToggle && nav) {
menuToggle.addEventListener("click", function () {
nav.classList.toggle("active");
});
}

});

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
