(() => {
  const screens = {
    home: document.getElementById('screen-home'),
    web: document.getElementById('screen-web'),
    menu: document.getElementById('screen-menu'),
    favorites: document.getElementById('screen-favorites'),
    history: document.getElementById('screen-history'),
    keys: document.getElementById('screen-keys'),
    settings: document.getElementById('screen-settings'),
    help: document.getElementById('screen-help'),
    'sd-manage': document.getElementById('screen-sd-manage')
  };

  const webFrame = document.getElementById('web-frame');
  const btnLsk = document.getElementById('btn-lsk');
  const btnRsk = document.getElementById('btn-rsk');
  const btnGo = document.getElementById('btn-go');
  const searchInput = document.getElementById('search-input');
  const favoritesList = document.getElementById('favorites-list');
  const historyList = document.getElementById('history-list');
  const speedDialEl = document.getElementById('speed-dial');
  const sdManageList = document.getElementById('sd-manage-list');
  const btnManageSd = document.getElementById('btn-manage-sd');
  const favTitleInput = document.getElementById('fav-title');
  const favUrlInput = document.getElementById('fav-url');
  const btnSaveFav = document.getElementById('btn-save-fav');
  const btnClearHistory = document.getElementById('btn-clear-history');
  const searchEngineSelect = document.getElementById('search-engine');
  const viewModeSelect = document.getElementById('view-mode-select');
  const proxySelect = document.getElementById('proxy-select');
  const themeSelect = document.getElementById('theme-select');
  const statusEl = document.getElementById('status');
  const datetimeEl = document.getElementById('datetime');
  const menuItems = Array.from(document.querySelectorAll('.menu-item'));

  const key5Select = document.getElementById('key-5-action');
  const keyStarSelect = document.getElementById('key-star-action');
  const keyHashSelect = document.getElementById('key-hash-action');
  const cursorEl = document.getElementById('virtual-cursor');
  const zoomIndicator = document.getElementById('zoom-indicator');
  const cursorIndicator = document.getElementById('cursor-indicator');

  let zoomLevel = 1.0;
  let isCursorActive = false;
  let cursorX = 64;
  let cursorY = 80;

  let favorites = [];
  let historyEntries = [];
  let speedDial = [
    { title: 'Vikipedi', url: 'https://m.wikipedia.org' },
    { title: 'Ekşi', url: 'https://eksisozluk.com' },
    { title: 'YouTube', url: 'https://m.youtube.com' },
    { title: 'DDG Lite', url: 'https://lite.duckduckgo.com/lite/' }
  ];

  let settings = {
    searchEngine: 'https://www.google.com/search?q=',
    viewMode: 'mobile',
    proxy: 'corsproxy',
    theme: 'theme-day',
    zoom: 1.0,
    key5: 'cursor',
    keyStar: 'zoomOut',
    keyHash: 'zoomIn'
  };

  const navStack = [];

  function saveFavorites() { try { localStorage.setItem('mb_fav_v11', JSON.stringify(favorites)); } catch (e) {} }
  function saveHistory() { try { localStorage.setItem('mb_hist_v11', JSON.stringify(historyEntries)); } catch (e) {} }
  function saveSpeedDial() { try { localStorage.setItem('mb_sd_v11', JSON.stringify(speedDial)); } catch (e) {} }
  function saveSettings() { try { localStorage.setItem('mb_set_v11', JSON.stringify(settings)); } catch (e) {} }

  function loadAll() {
    try { favorites = JSON.parse(localStorage.getItem('mb_fav_v11') || '[]'); } catch (e) {}
    try { historyEntries = JSON.parse(localStorage.getItem('mb_hist_v11') || '[]'); } catch (e) {}
    try {
      const sd = JSON.parse(localStorage.getItem('mb_sd_v11'));
      if (sd && Array.isArray(sd)) speedDial = sd;
    } catch (e) {}
    try { Object.assign(settings, JSON.parse(localStorage.getItem('mb_set_v11') || '{}')); } catch (e) {}
  }

  /* KORUMALI SİTELERİ AÇAN PROXY SİSTEMİ */
  window.openUrl = function(targetUrl) {
    let finalUrl = targetUrl;
    
    if (settings.proxy === 'corsproxy') {
      finalUrl = 'https://corsproxy.io/?' + encodeURIComponent(targetUrl);
    } else if (settings.proxy === 'allorigins') {
      finalUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(targetUrl);
    }

    webFrame.src = finalUrl;
    showScreen('web');
    addHistory(targetUrl, targetUrl);
  };

  function setZoom(val) {
    zoomLevel = Math.max(0.7, Math.min(1.5, parseFloat(val.toFixed(2))));
    document.documentElement.style.setProperty('--zoom-level', zoomLevel);
    zoomIndicator.textContent = `${Math.round(zoomLevel * 100)}%`;
  }

  function toggleCursor() {
    isCursorActive = !isCursorActive;
    cursorEl.style.display = isCursorActive ? 'block' : 'none';
    cursorIndicator.textContent = isCursorActive ? 'İmleç:AÇIK' : 'İmleç:KAPALI';
    cursorIndicator.style.color = isCursorActive ? 'red' : 'var(--accent)';
    if (isCursorActive) updateCursorPosition(0, 0);
  }

  function updateCursorPosition(dx, dy) {
    cursorX = Math.max(4, Math.min(124, cursorX + dx));
    cursorY = Math.max(4, Math.min(156, cursorY + dy));
    cursorEl.style.left = `${cursorX}px`;
    cursorEl.style.top = `${cursorY}px`;
  }

  function clickVirtualCursor() {
    const el = document.elementFromPoint(cursorX, cursorY);
    if (el) {
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: cursorX,
        clientY: cursorY
      });
      el.dispatchEvent(event);
      if (typeof el.click === 'function') el.click();
      if (['INPUT', 'SELECT', 'BUTTON', 'A'].includes(el.tagName)) el.focus();
    }
  }

  function executeAction(action) {
    if (action === 'cursor') toggleCursor();
    else if (action === 'zoomIn') setZoom(zoomLevel + 0.1);
    else if (action === 'zoomOut') setZoom(zoomLevel - 0.1);
    else if (action === 'search') { showScreen('home'); searchInput.focus(); }
  }

  function renderSpeedDial() {
    speedDialEl.innerHTML = '';
    speedDial.slice(0, 6).forEach((item) => {
      const div = document.createElement('button');
      div.className = 'sd-item';
      div.innerText = item.title;
      div.onclick = () => openUrl(item.url);
      speedDialEl.appendChild(div);
    });
  }

  function renderSdManage() {
    sdManageList.innerHTML = '';
    if (!speedDial.length) {
      sdManageList.innerHTML = '<li style="font-size:7px; color:var(--muted);">Kayıtlı bağlantı yok.</li>';
      return;
    }
    speedDial.forEach((item, idx) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div><strong>${item.title}</strong></div>
        <div class="list-btns">
          <button class="btn del-btn" style="background:var(--muted);">Kaldır</button>
        </div>
      `;
      li.querySelector('.del-btn').onclick = () => {
        speedDial.splice(idx, 1);
        saveSpeedDial();
        renderSpeedDial();
        renderSdManage();
      };
      sdManageList.appendChild(li);
    });
  }

  function renderFavorites() {
    favoritesList.innerHTML = '';
    if (!favorites.length) {
      favoritesList.innerHTML = '<li style="font-size:7px; color:var(--muted);">Favori yok.</li>';
      return;
    }
    favorites.slice().reverse().forEach((f) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="${f.url}">${f.title || f.url}</a>
        <div class="list-btns">
          <button class="btn open-btn">Aç</button>
          <button class="btn sd-add-btn">Hızlıya Ekle</button>
          <button class="btn del-btn" style="background:var(--muted);">Sil</button>
        </div>
      `;
      li.querySelector('.open-btn').onclick = () => openUrl(f.url);
      li.querySelector('.sd-add-btn').onclick = () => {
        speedDial.unshift({ title: f.title.substring(0, 10), url: f.url });
        if (speedDial.length > 6) speedDial.pop();
        saveSpeedDial();
        renderSpeedDial();
        statusEl.textContent = 'Hızlıya Eklendi!';
      };
      li.querySelector('.del-btn').onclick = () => {
        favorites.splice(favorites.indexOf(f), 1);
        saveFavorites();
        renderFavorites();
      };
      favoritesList.appendChild(li);
    });
  }

  function renderHistory() {
    historyList.innerHTML = '';
    if (!historyEntries.length) {
      historyList.innerHTML = '<li style="font-size:7px; color:var(--muted);">Geçmiş yok.</li>';
      return;
    }
    historyEntries.slice().reverse().forEach((h) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="${h.url}">${h.title || h.url}</a>
        <div class="list-btns">
          <button class="btn open-btn">Aç</button>
          <button class="btn del-btn" style="background:var(--muted);">Sil</button>
        </div>
      `;
      li.querySelector('.open-btn').onclick = () => openUrl(h.url);
      li.querySelector('.del-btn').onclick = () => {
        historyEntries.splice(historyEntries.indexOf(h), 1);
        saveHistory();
        renderHistory();
      };
      historyList.appendChild(li);
    });
  }

  function addHistory(title, url) {
    historyEntries.push({ title: title || url, url, time: Date.now() });
    if (historyEntries.length > 50) historyEntries.shift();
    saveHistory();
    renderHistory();
  }

  function renderScreen(name) {
    if (!screens[name]) name = 'home';
    Object.values(screens).forEach((s) => s.classList.add('hidden'));
    screens[name].classList.remove('hidden');
  }

  function showScreen(name) {
    const cur = document.querySelector('.screen:not(.hidden)')?.getAttribute('data-screen');
    if (cur !== name) navStack.push(cur || 'home');
    renderScreen(name);
  }

  function goBack() {
    if (!navStack.length) { renderScreen('home'); return; }
    renderScreen(navStack.pop());
  }

  function performSearch(query) {
    if (!query || !query.trim()) return;
    let url = query.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) url = 'https://' + url;
      else url = (settings.searchEngine || 'https://www.google.com/search?q=') + encodeURIComponent(url);
    }
    openUrl(url);
  }

  function updateStatusEngine() {
    const engineMap = {
      'https://www.google.com/search?q=': 'Google',
      'https://www.bing.com/search?q=': 'Bing',
      'https://duckduckgo.com/?q=': 'DuckDuckGo',
      'https://search.brave.com/search?q=': 'Brave'
    };
    const modeTag = settings.viewMode === 'desktop' ? '[Masaüstü]' : '[Mobil]';
    statusEl.textContent = `${engineMap[settings.searchEngine] || 'Google'} ${modeTag}`;
  }

  function applyTheme() {
    document.documentElement.className = settings.theme || 'theme-day';
    updateStatusEngine();
  }

  function updateDateTime() {
    const now = new Date();
    datetimeEl.textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  }

  /* TUŞ TAKIMI KONTROLLERİ */
  document.addEventListener('keydown', (e) => {
    const isInput = ['INPUT', 'SELECT'].includes(e.target.tagName);
    const activeScreen = document.querySelector('.screen:not(.hidden)')?.getAttribute('data-screen');

    if (isCursorActive) {
      if (e.key === 'ArrowUp') { e.preventDefault(); updateCursorPosition(0, -6); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); updateCursorPosition(0, 6); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); updateCursorPosition(-6, 0); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); updateCursorPosition(6, 0); return; }
      if (e.key === 'Enter' || e.key === 'Select') { e.preventDefault(); clickVirtualCursor(); return; }
    }

    if (['Escape', 'SoftLeft', 'F1'].includes(e.key) && !isInput) { e.preventDefault(); showScreen('menu'); }
    if (['SoftRight', 'F2', 'Backspace', '0'].includes(e.key) && !isInput) { e.preventDefault(); goBack(); }

    if (!isInput) {
      if (e.key === '5') { e.preventDefault(); executeAction(settings.key5); }
      if (e.key === '*' || e.key === '7') { e.preventDefault(); executeAction(settings.keyStar); }
      if (e.key === '#' || e.key === '9') { e.preventDefault(); executeAction(settings.keyHash); }
      if (e.key === '1' && activeScreen === 'home') { e.preventDefault(); searchInput.focus(); }
    }

    if (activeScreen === 'menu' && /^[1-5]$/.test(e.key)) {
      menuItems[parseInt(e.key) - 1]?.click();
    }
  });

  function init() {
    loadAll();
    if (settings.searchEngine) searchEngineSelect.value = settings.searchEngine;
    if (settings.viewMode) viewModeSelect.value = settings.viewMode;
    if (settings.proxy) proxySelect.value = settings.proxy;
    if (settings.theme) themeSelect.value = settings.theme;
    
    key5Select.value = settings.key5 || 'cursor';
    keyStarSelect.value = settings.keyStar || 'zoomOut';
    keyHashSelect.value = settings.keyHash || 'zoomIn';

    applyTheme();
    renderSpeedDial();
    renderFavorites();
    renderHistory();

    btnLsk.onclick = () => showScreen('menu');
    btnRsk.onclick = goBack;
    btnGo.onclick = () => performSearch(searchInput.value);
    searchInput.onkeydown = (e) => { if (e.key === 'Enter') performSearch(searchInput.value); };

    btnManageSd.onclick = () => { renderSdManage(); showScreen('sd-manage'); };

    btnSaveFav.onclick = () => {
      const t = favTitleInput.value.trim();
      const u = favUrlInput.value.trim();
      if (!t || !u) {
        statusEl.textContent = 'Başlık veya URL boş!';
        return;
      }
      favorites.push({ title: t, url: u });
      saveFavorites();
      renderFavorites();
      favTitleInput.value = ''; favUrlInput.value = '';
      statusEl.textContent = 'Favori Eklendi!';
      setTimeout(updateStatusEngine, 1500);
    };

    btnClearHistory.onclick = () => { historyEntries = []; saveHistory(); renderHistory(); };
    searchEngineSelect.onchange = (e) => { settings.searchEngine = e.target.value; saveSettings(); updateStatusEngine(); };
    viewModeSelect.onchange = (e) => { settings.viewMode = e.target.value; saveSettings(); updateStatusEngine(); };
    proxySelect.onchange = (e) => { settings.proxy = e.target.value; saveSettings(); };
    themeSelect.onchange = (e) => { settings.theme = e.target.value; saveSettings(); applyTheme(); };

    key5Select.onchange = (e) => { settings.key5 = e.target.value; saveSettings(); };
    keyStarSelect.onchange = (e) => { settings.keyStar = e.target.value; saveSettings(); };
    keyHashSelect.onchange = (e) => { settings.keyHash = e.target.value; saveSettings(); };

    menuItems.forEach(i => i.onclick = () => showScreen(i.getAttribute('data-target')));

    renderScreen('home');
    updateDateTime();
    setInterval(updateDateTime, 1000);
  }

  init();
})();
