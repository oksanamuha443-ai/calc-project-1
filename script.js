
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calculator-form');
  const resultSection = document.getElementById('result-section');
  const journalList = document.getElementById('journal-list');
  const clearJournalBtn = document.getElementById('clear-journal-btn');

  // Фразы-реакции для ошибок (под тему «ремонт/плитка»)
  const ERRORS = {
    EMPTY: 'Поле пустует, а плитка сама себя не посчитает! Впишите хоть одну цифру.',
    NOT_NUMBER: 'Здесь нужны цифры, а не описание “идеального бежевого” — палитра подождёт, сначала прикинем количество!',
    ZERO: 'Ноль — это как комната без плитки: стильно в минимализме, но непрактично. Укажите реальную площадь или размер.',
    NEGATIVE: 'Отрицательная площадь? Это уже магия, а не ремонт. Вводите положительные значения — посчитаем честно и по-строительному!'
  };

  function validateField(value, errorElement) {
    // Убираем пробелы
    const trimmed = value.trim();

    if (trimmed === '') {
      errorElement.textContent = ERRORS.EMPTY;
      return { valid: false, value: null };
    }

    // Проверка на нечисловые символы (допускаем точку и минус)
    if (!/^-?\d*\.?\d+$/.test(trimmed)) {
      errorElement.textContent = ERRORS.NOT_NUMBER;
      return { valid: false, value: null };
    }

    const num = parseFloat(trimmed);

    if (num === 0) {
      errorElement.textContent = ERRORS.ZERO;
      return { valid: false, value: num };
    }

    if (num < 0) {
      errorElement.textContent = ERRORS.NEGATIVE;
      return { valid: false, value: num };
    }

    errorElement.textContent = '';
    return { valid: true, value: num };
  }

  function calculateTiles(area, tileSize, wastePercent) {
    const tilesPerMeter = 1 / (tileSize * tileSize); // штук на м²
    const baseTiles = Math.ceil(area * tilesPerMeter);
    const waste = Math.ceil(baseTiles * (wastePercent / 100));
    const totalWithWaste = baseTiles + waste;

    return { baseTiles, totalWithWaste };
  }

  function logRequest(area, tileSize, waste, totalWithWaste) {
    const time = new Date().toLocaleTimeString('ru-RU');
    const entry = {
      time,
      area,
      tileSize,
      waste,
      totalWithWaste
    };

    // Получаем текущий журнал из localStorage
    let journal = JSON.parse(localStorage.getItem('tileCalculatorJournal')) || [];
    journal.push(entry);

    // Ограничим хранение, например, последними 50 записями
    if (journal.length > 50) {
      journal = journal.slice(-50);
    }

    localStorage.setItem('tileCalculatorJournal', JSON.stringify(journal));
    renderJournal(journal);
  }

  function renderJournal(journal) {
    journalList.innerHTML = '';
    journal.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>Время:</strong> ${item.time}<br>
        <strong>Площадь:</strong> ${item.area} м²<br>
        <strong>Размер плитки:</strong> ${item.tileSize} м<br>
        <strong>Запас:</strong> ${item.waste}%<br>
        <strong>Итого с запасом:</strong> ${item.totalWithWaste} шт.
      `;
      journalList.appendChild(li);
    });
  }

  function loadJournalOnStart() {
    const journal = JSON.parse(localStorage.getItem('tileCalculatorJournal')) || [];
    renderJournal(journal);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const areaInput = document.getElementById('area');
    const tileSizeInput = document.getElementById('tile-size');
    const wasteInput = document.getElementById('waste');

    const areaResult = validateField(areaInput.value, document.getElementById('area-error'));
    const tileResult = validateField(tileSizeInput.value, document.getElementById('tile-size-error'));
    const wasteResult = validateField(wasteInput.value, document.getElementById('waste-error'));

    // Если хоть одно поле невалидно — не считаем
    if (!areaResult.valid || !tileResult.valid || !wasteResult.valid) {
      resultSection.classList.add('hidden');
      return;
    }

    const { baseTiles, totalWithWaste } = calculateTiles(
      areaResult.value,
      tileResult.value,
      wasteResult.value
    );

    document.getElementById('total-tiles').textContent = baseTiles;
    document.getElementById('with-waste').textContent = totalWithWaste;

    resultSection.classList.remove('hidden');

    logRequest(areaResult.value, tileResult.value, wasteResult.value, totalWithWaste);
  });

  clearJournalBtn.addEventListener('click', () => {
    localStorage.removeItem('tileCalculatorJournal');
    renderJournal([]);
  });

  loadJournalOnStart();
});
