document.addEventListener("DOMContentLoaded", function () {

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

if (menuToggle && nav) {
menuToggle.addEventListener("click", function () {
nav.classList.toggle("active");
});
}

});