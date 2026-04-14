// ==========================================
// FIREBASE
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
// Ждём загрузку DOM
// ==========================================
document.addEventListener('DOMContentLoaded', function() {

  const pinGrid = document.getElementById('pinGrid');
  const searchInput = document.getElementById('searchInput');
  const addBtn = document.getElementById('addBtn');
  const modalOverlay = document.getElementById('modalOverlay');
  const cancelBtn = document.getElementById('cancelBtn');
  const saveBtn = document.getElementById('saveBtn');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const catBtns = document.querySelectorAll('.cat-btn');

  let currentCategory = 'Все';
  let selectedCategory = 'Референсы';
  let allPins = [];

  // Проверка что всё найдено
  console.log('pinGrid:', pinGrid);
  console.log('addBtn:', addBtn);
  console.log('cancelBtn:', cancelBtn);
  console.log('saveBtn:', saveBtn);

  // ==========================================
  // Выбор категории в модалке
  // ==========================================
  catBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      catBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      selectedCategory = btn.dataset.cat;
    });
  });

  // ==========================================
  // Загрузка пинов
  // ==========================================
  db.collection('pins')
    .orderBy('createdAt', 'desc')
    .onSnapshot(function(snapshot) {
      allPins = [];
      snapshot.forEach(function(doc) {
        allPins.push({ id: doc.id, ...doc.data() });
      });
      renderPins();
    });

  // ==========================================
  // Отрисовка
  // ==========================================
  function renderPins() {
    var searchTerm = searchInput.value.toLowerCase();

    var filtered = allPins.filter(function(pin) {
      var matchCat = currentCategory === 'Все' || pin.category === currentCategory;
      var matchSearch = (pin.title || '').toLowerCase().includes(searchTerm);
      return matchCat && matchSearch;
    });

    pinGrid.innerHTML = '';

    if (filtered.length === 0) {
      pinGrid.innerHTML = '<p style="text-align:center;color:#999;padding:60px 20px;font-size:18px;">Пинов пока нет 🙁<br>Нажми ＋ чтобы добавить!</p>';
      return;
    }

    filtered.forEach(function(pin) {
      var card = document.createElement('div');
      card.className = 'pin-card';
      card.innerHTML =
        '<img src="' + pin.image + '" alt="' + (pin.title || '') + '" class="pin-card__img" onerror="this.src=\'https://via.placeholder.com/300x400?text=Error\'">' +
        '<div class="pin-card__info">' +
          '<span class="pin-card__category">' + (pin.category || '') + '</span>' +
          '<span class="pin-card__title">' + (pin.title || '') + '</span>' +
        '</div>' +
        '<button class="pin-card__delete" data-id="' + pin.id + '">✕</button>';
      pinGrid.appendChild(card);
    });

    document.querySelectorAll('.pin-card__delete').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (confirm('Удалить пин?')) {
          db.collection('pins').doc(btn.dataset.id).delete();
        }
      });
    });
  }

  // ==========================================
  // Сохранение
  // ==========================================
  saveBtn.addEventListener('click', function() {
    var title = document.getElementById('pinTitle').value.trim();
    var image = document.getElementById('pinUrl').value.trim();

    if (!image) {
      alert('Вставь ссылку на картинку!');
      return;
    }

    db.collection('pins').add({
      title: title || 'Без названия',
      image: image,
      category: selectedCategory,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function() {
      document.getElementById('pinTitle').value = '';
      document.getElementById('pinUrl').value = '';
      modalOverlay.classList.remove('active');
    });
  });

  // ==========================================
  // Открыть/закрыть модалку
  // ==========================================
  addBtn.addEventListener('click', function() {
    modalOverlay.classList.add('active');
  });

  cancelBtn.addEventListener('click', function() {
    modalOverlay.classList.remove('active');
  });

  modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });

  // ==========================================
  // Фильтры
  // ==========================================
  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentCategory = btn.dataset.cat;
      renderPins();
    });
  });

  // Поиск
  searchInput.addEventListener('input', renderPins);

}); // конец DOMContentLoaded