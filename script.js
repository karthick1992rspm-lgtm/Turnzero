const filters = document.querySelectorAll(".filter");
const games = document.querySelectorAll(".game");

filters.forEach(btn => {
  btn.addEventListener("click", () => {
    filters.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const type = btn.dataset.filter;
    games.forEach(game => {
      game.style.display = type === "all" || game.dataset.type === type ? "" : "none";
    });
  });
});

document.querySelector(".menu").addEventListener("click", () => {
  const nav = document.querySelector("nav");
  const open = nav.style.display === "flex";
  nav.style.display = open ? "" : "flex";
  nav.style.position = "absolute";
  nav.style.top = "76px";
  nav.style.right = "6vw";
  nav.style.flexDirection = "column";
  nav.style.padding = "18px";
  nav.style.background = "var(--paper)";
  nav.style.border = "1px solid var(--line)";
});
