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
const languageSelect = document.querySelector('#language');
const deepCards = new Map((window.TAROT_DEEP || []).map(card => [card.id, card]));
const deepToggle = document.querySelector('#deepToggle');
const deepDive = document.querySelector('#deepDive');
const deepDescription = document.querySelector('#deepDescription');
const deepTraditional = document.querySelector('#deepTraditional');
const deepDescriptionEn = document.querySelector('#deepDescriptionEn');
const deepTraditionalEn = document.querySelector('#deepTraditionalEn');
const traditionalHeading = document.querySelector('#traditionalHeading');
const correspondences = document.querySelector('#correspondences');
const briefHistoricalNote = document.querySelector('#briefHistoricalNote');

const copy = {
  es: {
    eyebrow: 'Guía de consulta · 78 cartas', languageLabel: 'Idioma',
    search: 'Busca El Loco, The Fool, Queen of Cups…', searchLabel: 'Buscar una carta', all: 'Todas', major: 'Arcanos mayores', wands: 'Bastos', cups: 'Copas', swords: 'Espadas', pentacles: 'Oros',
    empty: 'No encuentro esa carta. Prueba el nombre en español o inglés.', source: 'Interpretaciones basadas en el dataset abierto de <a href="https://github.com/Tarotoo-com/tarotoo-tarot-dataset" target="_blank" rel="noreferrer">Tarotoo</a> (MIT), documentado a partir de A. E. Waite y otras fuentes históricas de la tradición Rider–Waite–Smith.',
    disclaimer: 'Las cartas sirven como herramienta simbólica de reflexión; no sustituyen asesoramiento profesional.', upright: 'Al derecho', reversed: 'Invertida', general: 'General', love: 'Amor', career: 'Trabajo',
    card: 'carta', cards: 'cartas', open: 'Abrir', majorMeta: 'Arcano mayor', minorMeta: 'Arcano menor', inner: 'En el plano interior o de crecimiento personal:', core: 'La clave general de la carta en esta posición es:',
    deepButton: 'Profundizar en esta carta', deepHide: 'Ocultar explicación', historicalSource: 'Fuente histórica · A. E. Waite', deepTitle: 'Historia y simbolismo', deepClose: 'Cerrar', deepIntro: 'Una traducción del texto que acompañó originalmente al mazo, separada de la interpretación moderna.', symbolismTitle: 'Lo que muestra la imagen', briefHistoricalNote: 'En esta carta Waite fue especialmente breve. Conservamos esa limitación en lugar de añadir simbolismo sin una fuente clara.', originalText: 'Consultar el texto original en inglés', originalDescription: 'Descripción original', originalMeaning: 'Significado tradicional original', deepSource: 'Fuente: <a href="https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot" target="_blank" rel="noreferrer"><cite>The Pictorial Key to the Tarot</cite></a>, A. E. Waite (1910/1911), con ilustraciones de Pamela Colman Smith. Traducción automática revisable frente al original incluido arriba.', traditionalUpright: 'Significado tradicional de Waite · Al derecho', traditionalReversed: 'Significado tradicional de Waite · Invertida', numberLabel: 'Número', elementLabel: 'Elemento', planetLabel: 'Planeta', zodiacLabel: 'Signo',
  },
  en: {
    eyebrow: 'Reference guide · 78 cards', languageLabel: 'Language',
    search: 'Search The Fool, El Loco, Queen of Cups…', searchLabel: 'Search for a card', all: 'All', major: 'Major Arcana', wands: 'Wands', cups: 'Cups', swords: 'Swords', pentacles: 'Pentacles',
    empty: 'No card found. Try its English or Spanish name.', source: 'Interpretations are based on the open <a href="https://github.com/Tarotoo-com/tarotoo-tarot-dataset" target="_blank" rel="noreferrer">Tarotoo</a> dataset (MIT), documented from A. E. Waite and other historical Rider–Waite–Smith sources.',
    disclaimer: 'Tarot cards are a symbolic tool for reflection; they are not a substitute for professional advice.', upright: 'Upright', reversed: 'Reversed', general: 'General', love: 'Love', career: 'Career',
    card: 'card', cards: 'cards', open: 'Open', majorMeta: 'Major Arcana', minorMeta: 'Minor Arcana', inner: 'For inner or personal growth:', core: 'The card’s general theme in this position is:',
    deepButton: 'Go deeper into this card', deepHide: 'Hide full explanation', historicalSource: 'Historical source · A. E. Waite', deepTitle: 'History and symbolism', deepClose: 'Close', deepIntro: 'The text that originally accompanied the deck, kept separate from the modern interpretation.', symbolismTitle: 'What the image shows', briefHistoricalNote: 'Waite documented this card very briefly. We preserve that limitation instead of adding symbolism without a clear source.', originalText: 'View the original English text', originalDescription: 'Original description', originalMeaning: 'Original traditional meaning', deepSource: 'Source: <a href="https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot" target="_blank" rel="noreferrer"><cite>The Pictorial Key to the Tarot</cite></a>, A. E. Waite (1910/1911), with illustrations by Pamela Colman Smith. The Spanish version is an automatic translation that can be checked against the original above.', traditionalUpright: 'Waite’s traditional meaning · Upright', traditionalReversed: 'Waite’s traditional meaning · Reversed', numberLabel: 'Number', elementLabel: 'Element', planetLabel: 'Planet', zodiacLabel: 'Sign',
  }
};

const params = new URLSearchParams(location.search);
const requestedLanguage = params.get('lang');
const rememberedLanguage = localStorage.getItem('tarot-language');
let language = ['es', 'en'].includes(requestedLanguage) ? requestedLanguage : (['es', 'en'].includes(rememberedLanguage) ? rememberedLanguage : (navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en'));
let filter = 'all';
let current = null;
let orientation = 'upright';
let context = 'general';
let deepOpen = false;

const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const localized = (card, field) => language === 'es' ? card[field] : card[`${field}_en`];
const primaryName = card => language === 'es' ? card.name_es : card.name_en;
const secondaryName = card => language === 'es' ? card.name_en : card.name_es;
const suitName = suit => copy[language][suit];

const associationTranslations = {
  Air: 'Aire', Fire: 'Fuego', Water: 'Agua', Earth: 'Tierra',
  Sun: 'Sol', Moon: 'Luna', Mercury: 'Mercurio', Venus: 'Venus', Mars: 'Marte', Jupiter: 'Júpiter', Saturn: 'Saturno', Uranus: 'Urano', Neptune: 'Neptuno', Pluto: 'Plutón',
  Aries: 'Aries', Taurus: 'Tauro', Gemini: 'Géminis', Cancer: 'Cáncer', Leo: 'Leo', Virgo: 'Virgo', Libra: 'Libra', Scorpio: 'Escorpio', Sagittarius: 'Sagitario', Capricorn: 'Capricornio', Aquarius: 'Acuario', Pisces: 'Piscis'
};

function translateAssociation(value) {
  if (!value || language === 'en') return value;
  return value.split(',').map(part => associationTranslations[part.trim()] || part.trim()).join(', ');
}

function visibleCards() {
  const query = normalize(search.value.trim());
  return cards.filter(card => {
    const group = filter === 'all' || (filter === 'major' ? card.arcana === 'major' : card.suit === filter);
    return group && (!query || normalize(`${card.name_es} ${card.name_en}`).includes(query));
  });
}

function applyLanguage() {
  document.documentElement.lang = language;
  document.title = language === 'es' ? 'Tarot Smith-Waite' : 'Smith-Waite Tarot';
  languageSelect.value = language;
  document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = copy[language][element.dataset.i18n]; });
  document.querySelectorAll('[data-i18n-html]').forEach(element => { element.innerHTML = copy[language][element.dataset.i18nHtml]; });
  search.placeholder = copy[language].search;
  search.setAttribute('aria-label', copy[language].searchLabel);
  languageSelect.setAttribute('aria-label', copy[language].languageLabel);
  document.querySelector('.filters').setAttribute('aria-label', language === 'es' ? 'Filtrar por palo' : 'Filter by suit');
  grid.setAttribute('aria-label', language === 'es' ? 'Cartas del tarot' : 'Tarot cards');
  document.querySelector('#close').setAttribute('aria-label', language === 'es' ? 'Cerrar' : 'Close');
  document.querySelector('.switch').setAttribute('aria-label', language === 'es' ? 'Orientación de la carta' : 'Card orientation');
  document.querySelector('.tabs').setAttribute('aria-label', language === 'es' ? 'Tipo de interpretación' : 'Interpretation context');
  render();
  if (current) { fillCardHeader(); updateReading(); updateDeepDive(); }
}

function setLanguage(next) {
  language = next;
  localStorage.setItem('tarot-language', language);
  const url = new URL(location.href);
  url.searchParams.set('lang', language);
  history.replaceState({}, '', url);
  applyLanguage();
}

function render() {
  const list = visibleCards();
  count.textContent = `${list.length} ${list.length === 1 ? copy[language].card : copy[language].cards}`;
  empty.hidden = list.length !== 0;
  grid.innerHTML = list.map(card => `
    <button class="card" data-id="${card.id}" aria-label="${copy[language].open} ${primaryName(card)}">
      <div class="card__image"><img src="${card.image}" alt="${primaryName(card)}" loading="lazy" decoding="async"></div>
      <div class="card__label"><strong>${primaryName(card)}</strong><span>${secondaryName(card)}</span></div>
    </button>`).join('');
}

function fillCardHeader() {
  detailImage.alt = primaryName(current);
  title.textContent = primaryName(current);
  english.textContent = secondaryName(current);
  meta.textContent = current.arcana === 'major' ? copy[language].majorMeta : `${copy[language].minorMeta} · ${suitName(current.suit)}`;
}

function openCard(id) {
  current = cards.find(card => card.id === Number(id));
  orientation = 'upright';
  context = 'general';
  setDeepOpen(false);
  detailImage.src = current.image;
  fillCardHeader();
  syncControls();
  updateReading();
  updateDeepDive();
  dialog.showModal();
  document.body.style.overflow = 'hidden';
}

function syncControls() {
  document.querySelectorAll('.orientation').forEach(button => button.classList.toggle('active', button.dataset.orientation === orientation));
  document.querySelectorAll('.tab').forEach(button => {
    const active = button.dataset.context === context;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  detailImage.classList.toggle('reversed', orientation === 'reversed');
}

function updateReading() {
  if (!current) return;
  const reversed = orientation === 'reversed';
  const key = context === 'general' ? `meaning_${orientation}` : context === 'love' ? (reversed ? 'love_reversed' : 'love') : (reversed ? 'career_reversed' : 'career');
  const labels = localized(current, reversed ? 'keywords_reversed' : 'keywords_upright');
  keywords.innerHTML = labels.map(label => `<span>${label}</span>`).join('');
  const sentence = text => text ? text.charAt(0).toUpperCase() + text.slice(1).replace(/[,.]?$/, '.') : '';
  const core = localized(current, `meaning_${orientation}`);
  if (context === 'general') {
    const spiritual = localized(current, reversed ? 'spiritual_reversed' : 'spiritual');
    meaning.textContent = `${sentence(core)} ${copy[language].inner} ${sentence(spiritual)}`;
  } else {
    meaning.textContent = `${sentence(localized(current, key))} ${copy[language].core} ${sentence(core)}`;
  }
}

function setDeepOpen(open) {
  deepOpen = open;
  deepDive.hidden = !open;
  deepToggle.setAttribute('aria-expanded', String(open));
  deepToggle.querySelector('[data-i18n="deepButton"]').textContent = copy[language][open ? 'deepHide' : 'deepButton'];
}

function updateDeepDive() {
  if (!current) return;
  const deep = deepCards.get(current.id);
  deepToggle.hidden = !deep;
  if (!deep) return;
  const reversed = orientation === 'reversed';
  deepDescription.textContent = language === 'es' ? deep.description_es : deep.description_en;
  deepTraditional.textContent = language === 'es' ? deep[reversed ? 'waite_reversed_es' : 'waite_upright_es'] : deep[reversed ? 'waite_reversed_en' : 'waite_upright_en'];
  deepDescriptionEn.textContent = deep.description_en;
  deepTraditionalEn.textContent = deep[reversed ? 'waite_reversed_en' : 'waite_upright_en'];
  traditionalHeading.textContent = copy[language][reversed ? 'traditionalReversed' : 'traditionalUpright'];
  briefHistoricalNote.hidden = deep.description_en.length >= 220;
  const facts = [
    [copy[language].numberLabel, deep.number],
    [copy[language].elementLabel, translateAssociation(deep.element)],
    [copy[language].planetLabel, translateAssociation(deep.planet)],
    [copy[language].zodiacLabel, translateAssociation(deep.zodiac)]
  ].filter(([, value]) => value !== null && value !== undefined && value !== '');
  correspondences.replaceChildren(...facts.map(([label, value]) => {
    const item = document.createElement('span');
    const strong = document.createElement('strong');
    strong.textContent = `${label}:`;
    item.append(strong, ` ${value}`);
    return item;
  }));
  setDeepOpen(deepOpen);
}

grid.addEventListener('click', event => { const card = event.target.closest('.card'); if (card) openCard(card.dataset.id); });
search.addEventListener('input', render);
languageSelect.addEventListener('change', event => setLanguage(event.target.value));
document.querySelectorAll('.chip').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.chip').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  filter = button.dataset.filter;
  render();
}));
document.querySelectorAll('.orientation').forEach(button => button.addEventListener('click', () => { orientation = button.dataset.orientation; syncControls(); updateReading(); updateDeepDive(); }));
document.querySelectorAll('.tab').forEach(button => button.addEventListener('click', () => { context = button.dataset.context; syncControls(); updateReading(); }));
deepToggle.addEventListener('click', () => {
  setDeepOpen(!deepOpen);
  if (deepOpen) deepDive.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
document.querySelector('#deepClose').addEventListener('click', () => {
  setDeepOpen(false);
  deepToggle.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
document.querySelector('#close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => { document.body.style.overflow = ''; });

applyLanguage();
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js?v=5'));
