var totalCacheEl = window.document.getElementById('totalCache');
var currentPageCacheEl = window.document.getElementById('currentPageCache');
var lastLoadedURL = window.document.getElementById('lastLoadedURL');
window.addEventListener('message', updateUI, false);

function updateUI(message) {
  if (message.data.lastURL) {
    lastLoadedURL.textContent = message.data.lastURL;
  }
  totalCacheEl.textContent = message.data.totalCache;
  currentPageCacheEl.textContent = message.data.currentPageCache;
}
