// ==========================================
// 🔥 FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyC1KHsAf3XEUPrA2QznZxXkeMZ6D7e6Y2c",
  authDomain: "my-pinterest-84ff6.firebaseapp.com",
  projectId: "my-pinterest-84ff6",
  storageBucket: "my-pinterest-84ff6.firebasestorage.app",
  messagingSenderId: "934283222631",
  appId: "1:934283222631:web:cbfd2c70a1ee54b8373ec2",
  measurementId: "G-YBMMQ4X065"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ==========================================
// Элементы
// ==========================================
const pinsGrid = document.getElementById('pinsGrid');
const searchInput = document.getElementById('searchInput');
const addPinBtn = document.getElementById('addPinBtn');
const modalOverlay = document.getElementById('modalOverlay');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const filterBtns = document.querySelectorAll('.filters__btn');

let currentCategory = 'all';
let allPins = [];

const categoryNames = {
  refs: 'Рефы',
  model: 'Модель',
  sketches: 'Скетчи',
  artifacts: 'Артефакты'
};

// ==========================================
// Загрузка пинов (реальное время!)
// ==========================================
db.collection('pins')
  .orderBy('createdAt', 'desc')
  .onSnapshot((snapshot) => {
    allPins = [];
    snapshot.forEach((doc) => {
      allPins.push({ id: doc.id, ...doc.data() });
    });
    renderPins();
  });

// ==========================================
// Отрисовка
// ==========================================
function renderPins() {
  const searchTerm = searchInput.value.toLowerCase();

  const filtered = allPins.filter(pin => {
    const matchCat = currentCategory === 'all' || pin.category === currentCategory;
    const matchSearch = (pin.title || '').toLowerCase().includes(searchTerm);
    return matchCat && matchSearch;
  });

  pinsGrid.innerHTML = '';

  if (filtered.length === 0) {
    pinsGrid.innerHTML = '<p style="text-align:center;color:#999;padding:60px 20px;font-size:18px;">Пинов пока нет 🙁<br>Нажми ＋ чтобы добавить!</p>';
    return;
  }

  filtered.forEach(pin => {
    const card = document.createElement('div');
    card.className = 'pin-card';
    card.innerHTML = `
      <img src="${pin.image}" alt="${pin.title}" class="pin-card__img"
           onerror="this.src='https://via.placeholder.com/300x400?text=Ошибка'">
      <div class="pin-card__info">
        <span class="pin-card__category">${categoryNames[pin.category] || pin.category}</span>
        <span class="pin-card__title">${pin.title}</span>
      </div>
      <button class="pin-card__delete" data-id="${pin.id}">✕</button>
    `;
    pinsGrid.appendChild(card);
  });

  document.querySelectorAll('.pin-card__delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Удалить пин?')) {
        db.collection('pins').doc(btn.dataset.id).delete();
      }
    });
  });
}

// ==========================================
// Добавление пина
// ==========================================
saveBtn.addEventListener('click', async () => {
  const title = document.getElementById('pinTitle').value.trim();
  const image = document.getElementById('pinImage').value.trim();
  const category = document.getElementById('pinCategory').value;

  if (!image) {
    alert('Вставь ссылку на картинку!');
    return;
  }

  await db.collection('pins').add({
    title: title || 'Без названия',
    image: image,
    category: category,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById('pinTitle').value = '';
  document.getElementById('pinImage').value = '';
  modalOverlay.classList.remove('active');
});

// ==========================================
// События
// ==========================================
addPinBtn.addEventListener('click', () => modalOverlay.classList.add('active'));
cancelBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.remove('active');
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    renderPins();
  });
});

searchInput.addEventListener('input', renderPins);