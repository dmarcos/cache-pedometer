var totalCacheEl = window.document.getElementById('totalCache');
var currentPageCacheEl = window.document.getElementById('currentPageCache');

window.addEventListener('message', updateUI, false);

function updateUI(message) {
  totalCacheEl.textContent = message.data.totalCache;
  currentPageCacheEl.textContent = message.data.currentPageCache;
}
