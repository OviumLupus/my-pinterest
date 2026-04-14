// === Элементы ===
const grid = document.getElementById('grid');
const search = document.getElementById('search');
const filters = document.getElementById('filters');
const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');

let pins = [];
let currentCategory = 'all';
let currentSearch = '';

// === Загрузка данных ===
async function loadPins() {
  try {
    const response = await fetch('data.json');
    pins = await response.json();
    renderPins();
  } catch (error) {
    grid.innerHTML = '<p style="padding:24px;">Ошибка загрузки данных 😔</p>';
    console.error(error);
  }
}

// === Отрисовка карточек ===
function renderPins() {
  const filtered = pins.filter(pin => {
    const matchCategory = currentCategory === 'all' || pin.category === currentCategory;
    const matchSearch = pin.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
                        pin.description.toLowerCase().includes(currentSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="padding:24px;text-align:center;">Ничего не найдено 🔍</p>';
    return;
  }

  filtered.forEach(pin => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img class="card__image" src="${pin.image}" alt="${pin.title}" loading="lazy">
      <div class="card__body">
        <div class="card__title">${pin.title}</div>
        <div class="card__category">${getCategoryName(pin.category)}</div>
      </div>
    `;
    card.addEventListener('click', () => openModal(pin));
    grid.appendChild(card);
  });
}

function getCategoryName(cat) {
  const names = {
    nature: '🌿 Природа',
    food: '🍕 Еда',
    design: '🎨 Дизайн',
    lifestyle: '☕ Лайфстайл'
  };
  return names[cat] || cat;
}

// === Фильтрация по категории ===
filters.addEventListener('click', (e) => {
  if (!e.target.classList.contains('filters__btn')) return;

  document.querySelectorAll('.filters__btn').forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');

  currentCategory = e.target.dataset.category;
  renderPins();
});

// === Поиск ===
search.addEventListener('input', (e) => {
  currentSearch = e.target.value;
  renderPins();
});

// === Модальное окно ===
function openModal(pin) {
  modalImage.src = pin.image;
  modalTitle.textContent = pin.title;
  modalDescription.textContent = pin.description;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

modalOverlay.addEventListener('click', closeModal);
modalClose.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// === Старт ===
loadPins();
