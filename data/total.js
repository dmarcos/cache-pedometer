var totalCacheEl = window.document.getElementById('totalCache');
var depthRadios = window.document.forms['cacheDepth'].elements['radioDepth'];
var readerModeCheckbox = window.document.forms['readability'].elements['readerMode'];

var i;

var cacheDepth = 0;
var readerMode = false;

for(i = 0; i < depthRadios.length; ++i) {
  depthRadios[i].onclick = function(evt) {
    cacheDepth = this.value;
    updateState();
  }
}

readerModeCheckbox.onclick = function(evt) {
  readerMode = this.checked;
  updateState();
}

function updateState() {
  var data = {
    cacheDepth: cacheDepth,
    readerMode: readerMode
  };
  parent.postMessage(data, '*');
}

window.addEventListener('message', updateUI, false);

function updateUI(message) {
  totalCacheEl.textContent = message.data.totalCache;
}
