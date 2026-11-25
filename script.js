"use strict";
const navigation = document.getElementById("project-nav");
navigation.addEventListener("change", () => {
  const section = document.getElementById(navigation.value);
  if (section) { location.hash = section.id; section.setAttribute("tabindex", "-1"); section.focus({preventScroll:true}); }
});
window.addEventListener("hashchange", () => {
  const current = location.hash.slice(1) || "home";
  if (Array.from(navigation.options).some(option => option.value === current)) navigation.value = current;
});
