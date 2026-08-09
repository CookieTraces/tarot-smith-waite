const cards = window.TAROT_CARDS || [];
const grid = document.querySelector('#grid');
const search = document.querySelector('#search');
const count = document.querySelector('#count');
const empty = document.querySelector('#empty');
const dialog = document.querySelector('#cardDialog');
const detailImage = document.querySelector('#detailImage');
const title = document.querySelector('#dialogTitle');
const english = document.querySelector('#dialogEnglish');
const meta = document.querySelector('#detailMeta');
const keywords = document.querySelector('#keywords');
const meaning = document.querySelector('#meaning');
const guidance = document.querySelector('#guidance');
let filter = 'all';
let current = null;
let orientation = 'upright';
let context = 'general';

const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const suitNames = {wands:'Bastos', cups:'Copas', swords:'Espadas', pentacles:'Oros'};

function visibleCards(){
  const q = normalize(search.value.trim());
  return cards.filter(card => {
    const group = filter === 'all' || (filter === 'major' ? card.arcana === 'major' : card.suit === filter);
    const text = normalize(`${card.name_es} ${card.name_en}`);
    return group && (!q || text.includes(q));
  });
}

function render(){
  const list = visibleCards();
  count.textContent = `${list.length} ${list.length === 1 ? 'carta' : 'cartas'}`;
  empty.hidden = list.length !== 0;
  grid.innerHTML = list.map(card => `
    <button class="card" data-id="${card.id}" aria-label="Abrir ${card.name_es}">
      <div class="card__image"><img src="${card.image}" alt="${card.name_es}" loading="lazy" decoding="async"></div>
      <div class="card__label"><strong>${card.name_es}</strong><span>${card.name_en}</span></div>
    </button>`).join('');
}

function openCard(id, pickedOrientation = 'upright'){
  current = cards.find(card => card.id === Number(id));
  orientation = pickedOrientation;
  context = 'general';
  detailImage.src = current.image;
  detailImage.alt = current.name_es;
  title.textContent = current.name_es;
  english.textContent = current.name_en;
  meta.textContent = current.arcana === 'major' ? 'Arcano mayor' : `Arcano menor · ${suitNames[current.suit]}`;
  syncControls();
  updateReading();
  dialog.showModal();
  document.body.style.overflow = 'hidden';
}

function syncControls(){
  document.querySelectorAll('.orientation').forEach(b => b.classList.toggle('active', b.dataset.orientation === orientation));
  document.querySelectorAll('.tab').forEach(b => {
    const active = b.dataset.context === context;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', String(active));
  });
  detailImage.classList.toggle('reversed', orientation === 'reversed');
}

function updateReading(){
  if (!current) return;
  const reversed = orientation === 'reversed';
  const key = context === 'general' ? `meaning_${orientation}` : context === 'love' ? (reversed ? 'love_reversed' : 'love') : (reversed ? 'career_reversed' : 'career');
  const labels = reversed ? current.keywords_reversed : current.keywords_upright;
  keywords.innerHTML = labels.map(k => `<span>${k}</span>`).join('');
  const sentence = text => text ? text.charAt(0).toUpperCase() + text.slice(1).replace(/[,.]?$/, '.') : '';
  const core = current[`meaning_${orientation}`];
  const spiritual = current[reversed ? 'spiritual_reversed' : 'spiritual'];
  if(context === 'general'){
    meaning.textContent = `${sentence(core)} En el plano interior o de crecimiento personal: ${sentence(spiritual)}`;
  }else{
    meaning.textContent = `${sentence(current[key])} La clave general de la carta en esta posición es: ${sentence(core)}`;
  }
  const notes = {
    general: 'Sitúa estos temas dentro de la pregunta concreta y observa qué detalles de la imagen y de las cartas vecinas los refuerzan. No la tomes como un resultado inevitable.',
    love: 'Puede hablar del vínculo, de tu disposición afectiva o de la actitud de la otra persona. Diferencia lo que existe ahora de lo que deseas que ocurra.',
    career: 'Puede señalar el clima laboral, una oportunidad, un obstáculo o la manera de actuar. Contrástala con los hechos antes de tomar una decisión profesional o económica.'
  };
  guidance.textContent = notes[context];
}

grid.addEventListener('click', e => { const card = e.target.closest('.card'); if(card) openCard(card.dataset.id); });
search.addEventListener('input', render);
document.querySelectorAll('.chip').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
  button.classList.add('active'); filter = button.dataset.filter; render();
}));
document.querySelector('#random').addEventListener('click', () => {
  const pool = visibleCards().length ? visibleCards() : cards;
  openCard(pool[Math.floor(Math.random() * pool.length)].id, Math.random() < .5 ? 'upright' : 'reversed');
});
document.querySelectorAll('.orientation').forEach(button => button.addEventListener('click', () => { orientation = button.dataset.orientation; syncControls(); updateReading(); }));
document.querySelectorAll('.tab').forEach(button => button.addEventListener('click', () => { context = button.dataset.context; syncControls(); updateReading(); }));
document.querySelector('#close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if(e.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => { document.body.style.overflow = ''; });

render();
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
