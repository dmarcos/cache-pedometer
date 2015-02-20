var totalCacheEl = window.document.getElementById('totalCache');
var depthRadios = window.document.forms['cacheDepth'].elements['radioDepth'];
var i;

for(i = 0; i < depthRadios.length; ++i) {
  depthRadios[i].onclick = function(evt) {
    var data = {
      cacheDepth: this.value
    };
    parent.postMessage(data, '*');
  }
}

window.addEventListener('message', updateUI, false);

function updateUI(message) {
  totalCacheEl.textContent = message.data.totalCache;
}
