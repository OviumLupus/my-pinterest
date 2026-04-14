const grid = document.getElementById('grid');
const search = document.getElementById('search');
const filtersEl = document.getElementById('filters');

const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const deleteBtn = document.getElementById('deleteBtn');

const addBtn = document.getElementById('addBtn');
const addModal = document.getElementById('addModal');
const addModalOverlay = document.getElementById('addModalOverlay');
const addModalClose = document.getElementById('addModalClose');
const pinImage = document.getElementById('pinImage');
const pinTitle = document.getElementById('pinTitle');
const pinDescription = document.getElementById('pinDescription');
const pinCategory = document.getElementById('pinCategory');
const pinSubmit = document.getElementById('pinSubmit');
const preview = document.getElementById('preview');

let pins = [];
let currentCategory = 'all';
let currentSearch = '';
let currentPinId = null;

async function loadPins() {
  const saved = localStorage.getItem('cbtPins');
  if (saved) {
    pins = JSON.parse(saved);
    renderPins();
    return;
  }
  pins = [];
  savePins();
  renderPins();
}

function savePins() {
  localStorage.setItem('cbtPins', JSON.stringify(pins));
}

function renderPins() {
  const filtered = pins.filter(pin => {
    const matchCategory = currentCategory === 'all' || pin.category === currentCategory;
    const title = pin.title || '';
    const description = pin.description || '';
    const matchSearch = title.toLowerCase().includes(currentSearch.toLowerCase()) ||
                        description.toLowerCase().includes(currentSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">📌</div>
        <div class="empty-state__text">Пока пусто</div>
        <div class="empty-state__hint">Нажми ＋ чтобы добавить первый пин!</div>
      </div>
    `;
    return;
  }

  filtered.forEach(pin => {
    const card = document.createElement('div');
    card.className = 'card';

    const hasTitle = pin.title && pin.title !== 'Без названия';
    const bodyHTML = hasTitle
      ? `<div class="card__body">
           <div class="card__title">${pin.title}</div>
           <div class="card__category">${getCategoryName(pin.category)}</div>
         </div>`
      : `<div class="card__body card__body--minimal">
           <div class="card__category">${getCategoryName(pin.category)}</div>
         </div>`;

    card.innerHTML = `
      <img class="card__image" src="${pin.image}" alt="${pin.title || ''}" loading="lazy"
           onerror="this.src='https://via.placeholder.com/400x400/f0f0f0/ccc?text=Ошибка'">
      ${bodyHTML}
    `;
    card.addEventListener('click', () => openModal(pin));
    grid.appendChild(card);
  });
}

function getCategoryName(cat) {
  const names = {
    refs: '🎯 Рефы',
    model: '🧊 Модель',
    sketches: '✏️ Скетчи',
    artifacts: '🏺 Артефакты'
  };
  return names[cat] || cat;
}

filtersEl.addEventListener('click', (e) => {
  if (!e.target.classList.contains('filters__btn')) return;
  document.querySelectorAll('.filters__btn').forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');
  currentCategory = e.target.dataset.category;
  renderPins();
});

search.addEventListener('input', (e) => {
  currentSearch = e.target.value;
  renderPins();
});

function openModal(pin) {
  currentPinId = pin.id;
  modalImage.src = pin.image;
  modalTitle.textContent = pin.title || '';
  modalDescription.textContent = pin.description || '';
  modalTitle.style.display = pin.title && pin.title !== 'Без названия' ? 'block' : 'none';
  modalDescription.style.display = pin.description && pin.description !== 'Без описания' ? 'block' : 'none';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  currentPinId = null;
}

modalOverlay.addEventListener('click', closeModal);
modalClose.addEventListener('click', closeModal);

deleteBtn.addEventListener('click', () => {
  if (currentPinId === null) return;
  if (!confirm('Удалить этот пин?')) return;
  pins = pins.filter(p => p.id !== currentPinId);
  savePins();
  renderPins();
  closeModal();
});

addBtn.addEventListener('click', () => {
  addModal.classList.add('open');
  document.body.style.overflow = 'hidden';
});

function closeAddModal() {
  addModal.classList.remove('open');
  document.body.style.overflow = '';
  pinImage.value = '';
  pinTitle.value = '';
  pinDescription.value = '';
  preview.innerHTML = '<p>Превью появится здесь</p>';
}

addModalOverlay.addEventListener('click', closeAddModal);
addModalClose.addEventListener('click', closeAddModal);

pinImage.addEventListener('input', () => {
  const url = pinImage.value.trim();
  if (url) {
    preview.innerHTML = `<img src="${url}" onerror="this.parentElement.innerHTML='<p>❌ Картинка не загрузилась</p>'">`;
  } else {
    preview.innerHTML = '<p>Превью появится здесь</p>';
  }
});

pinSubmit.addEventListener('click', () => {
  const image = pinImage.value.trim();
  const title = pinTitle.value.trim();
  const description = pinDescription.value.trim();
  const category = pinCategory.value;

  if (!image) return alert('Вставь ссылку на картинку!');

  const newPin = {
    id: Date.now(),
    title: title || 'Без названия',
    category: category,
    image: image,
    description: description || ''
  };

  pins.unshift(newPin);
  savePins();
  renderPins();
  closeAddModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeAddModal();
  }
});

loadPins();