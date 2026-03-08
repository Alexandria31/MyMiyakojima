const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

menuToggle.addEventListener("click", () => {
  nav.classList.toggle("active");
});