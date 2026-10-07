let games = [];
let filteredGames = [];

const grid = document.getElementById("gameGrid");
const search = document.getElementById("gameSearch");
const filter = document.getElementById("gameFilter");
const sort = document.getElementById("gameSort");
const count = document.getElementById("gameCount");
const empty = document.getElementById("gameEmpty");
const modal = document.getElementById("gameModal");

function parseCSV(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (c === '"' && quoted && n === '"') { cell += '"'; i++; }
    else if (c === '"') quoted = !quoted;
    else if (c === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && n === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  const headers = rows.shift();
  return rows.filter(r => r.some(Boolean)).map(r => {
    const o = {};
    headers.forEach((h,i) => o[h] = (r[i] ?? "").trim());
    return o;
  });
}

const num = v => Number(v) || 0;

function players(g) {
  return g.min_players === g.max_players ? `${g.min_players}` : `${g.min_players}–${g.max_players}`;
}
function time(g) {
  return g.min_time === g.max_time ? `${g.min_time} min` : `${g.min_time}–${g.max_time} min`;
}
function weightLabel(v) {
  const n = num(v);
  if (!n) return "N/A";
  if (n < 2) return "Light";
  if (n < 3) return "Medium";
  if (n < 4) return "Heavy";
  return "Very heavy";
}
function initials(name) {
  return name.split(/[\s:–-]+/).filter(Boolean).slice(0,2).map(x => x[0]).join("").toUpperCase();
}

function applyGames() {
  const q = search.value.toLowerCase().trim();
  const f = filter.value;
  filteredGames = games.filter(g => {
    const nameMatch = g.name.toLowerCase().includes(q);
    const p = num(g.max_players), min = num(g.min_players);
    const w = num(g.weight), maxTime = num(g.max_time);
    let filterMatch = true;
    if (f === "1-2") filterMatch = min <= 2 && p >= 2 && p <= 2;
    if (f === "3-4") filterMatch = min <= 4 && p >= 3 && p <= 4;
    if (f === "5+") filterMatch = p >= 5;
    if (f === "quick") filterMatch = maxTime <= 45;
    if (f === "heavy") filterMatch = w >= 3.5;
    return nameMatch && filterMatch;
  });

  filteredGames.sort((a,b) => {
    if (sort.value === "rating") return num(b.rating) - num(a.rating);
    if (sort.value === "rank") return num(a.rank) - num(b.rank);
    if (sort.value === "weight") return num(a.weight) - num(b.weight);
    return a.name.localeCompare(b.name);
  });
  count.textContent = filteredGames.length;
  renderGames();
}

function renderGames() {
  if (!filteredGames.length) {
    grid.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  grid.innerHTML = filteredGames.map((g,i) => `
    <article class="csv-game-card" data-index="${i}" tabindex="0">
      <div class="csv-game-mark">${initials(g.name)}</div>
      <div class="csv-game-body">
        <h3>${escapeHTML(g.name)}</h3>
        <p class="csv-game-sub">${players(g)} players · ${time(g)}</p>
        <div class="csv-game-data">
          <span><b>${num(g.rating).toFixed(2)}</b> rating</span>
          <span><b>${num(g.weight).toFixed(1)}</b> weight</span>
          <span><b>#${num(g.rank).toLocaleString()}</b> rank</span>
        </div>
      </div>
      <span class="csv-game-arrow">↗</span>
    </article>
  `).join("");

  grid.querySelectorAll(".csv-game-card").forEach(card => {
    card.addEventListener("click", () => openGame(filteredGames[Number(card.dataset.index)]));
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") openGame(filteredGames[Number(card.dataset.index)]);
    });
  });
}

function openGame(g) {
  document.getElementById("modalGameName").textContent = g.name;
  document.getElementById("modalGameMeta").innerHTML =
    `<span>${players(g)} players</span><span>${time(g)}</span><span>${g.year || "Year N/A"}</span>`;
  document.getElementById("modalGameStats").innerHTML = `
    <div><small>BGG RATING</small><strong>${num(g.rating).toFixed(2)}</strong></div>
    <div><small>COMPLEXITY</small><strong>${num(g.weight).toFixed(1)} / 5</strong><em>${weightLabel(g.weight)}</em></div>
    <div><small>BGG RANK</small><strong>#${num(g.rank).toLocaleString()}</strong></div>
    <div><small>RECOMMENDED</small><strong>${g.recommended_players || "N/A"}</strong></div>
    <div><small>BEST AT</small><strong>${g.best_players || "N/A"}</strong></div>
    <div><small>AGE</small><strong>${g.age || "N/A"}</strong></div>
  `;
  modal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeGame() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}
document.querySelectorAll("[data-close-game]").forEach(el => el.addEventListener("click", closeGame));
document.addEventListener("keydown", e => { if (e.key === "Escape") closeGame(); });

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c]));
}

fetch("games.csv")
  .then(r => { if (!r.ok) throw new Error("Could not load games.csv"); return r.text(); })
  .then(text => {
    games = parseCSV(text);
    applyGames();
  })
  .catch(err => {
    grid.innerHTML = `<div class="library-loading">Couldn't load the game collection. Make sure <b>games.csv</b> is in the same GitHub repository.</div>`;
    console.error(err);
  });

[search, filter, sort].forEach(el => el.addEventListener("input", applyGames));
[filter, sort].forEach(el => el.addEventListener("change", applyGames));

document.getElementById("randomGame").addEventListener("click", () => {
  if (!filteredGames.length) return;
  const chosen = filteredGames[Math.floor(Math.random() * filteredGames.length)];
  openGame(chosen);
});

const menu = document.querySelector(".menu");
if (menu) {
  menu.addEventListener("click", () => {
    const nav = document.querySelector("nav");
    nav.classList.toggle("mobile-open");
  });
}
