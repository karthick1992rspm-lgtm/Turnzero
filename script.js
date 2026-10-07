const filters=document.querySelectorAll('.filter');
const games=[...document.querySelectorAll('.game')];

filters.forEach(btn=>{
  btn.addEventListener('click',()=>{
    filters.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const type=btn.dataset.filter;
    games.forEach(game=>game.style.display=(type==='all'||game.dataset.type===type)?'':'none');
  });
});

document.getElementById('randomGame').addEventListener('click',()=>{
  const visible=games.filter(g=>g.style.display!=='none');
  const chosen=visible[Math.floor(Math.random()*visible.length)];
  chosen.scrollIntoView({behavior:'smooth',block:'center'});
  chosen.animate([{transform:'scale(1)'},{transform:'scale(1.03)'},{transform:'scale(1)'}],{duration:600});
});

document.querySelector('.menu').addEventListener('click',()=>{
  document.querySelector('.mobile-nav').classList.toggle('open');
});
document.querySelectorAll('.mobile-nav a').forEach(a=>a.addEventListener('click',()=>{
  document.querySelector('.mobile-nav').classList.remove('open');
}));
