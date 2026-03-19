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