var documentSize = 0;
var imagesSize = 0;
var imagesBatch;
var currentRequests = 0;
var currentImageRequested = 0;
var imagesToLoad;
var imagesLength;
var imageURLs = [];

self.port.on("requestPageInfo", function() {
  documentSize = document.body.innerHTML.length;
  var images = document.getElementsByTagName('img');
  var imagesSize = 0;
  imagesToLoad = images;
  imagesLength = imagesToLoad.length;
  console.log("IMAGES " + imagesLength);
  imageURLs.push(document.location.toString());
  for (var i = 0; i < images.length; i++) {
    imageURLs.push(images[i].src);
  }
  //loadImages();
  self.port.emit("pageInfo", imageURLs);
});

function loadImages() {
  for(currentRequests; currentRequests < 4;) {
    console.log("PENOTE " + currentImageRequested + " " + imagesLength);
    if (currentImageRequested >= imagesLength) {
      break;
    }
    console.log("PENE " + currentImageRequested + " " + currentRequests + " " + imagesToLoad[currentImageRequested].src);
    calculateImageSize(imagesToLoad[currentImageRequested].src);
    currentRequests += 1;
    currentImageRequested += 1;
  }
  console.log("FINISH " + currentImageRequested + " " +  currentRequests);
  if (currentImageRequested === imagesLength && currentRequests === 0) {
    //self.port.emit("pageInfo", documentSize + imagesSize);
    self.port.emit("pageInfo", imageURLs);
  }
}


function calculateImageSize(src) {
  console.log("CACOTA " + src);
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.open('GET', src, true);
  //xhr.responseType = 'blob';
  xhr.responseType = 'arraybuffer';
  xhr.onreadystatechange
  xhr.onload = function(e) {
    console.log("CACA " + this.status + " " + currentImageRequested + " " + imagesSize);
    if (this.status == 200) {
      var uInt8Array = new Uint8Array(this.response);
      var byte3 = uInt8Array[4];
      var blob = new Blob([xhr.response], {type: 'application/octet-binary'});
      //var blob = this.response;
      imagesSize += blob.size;
      currentRequests -= 1;
      loadImages();
    }
  };
  xhr.timeout = 4000;
  xhr.ontimeout = function () {
    currentRequests -= 1;
    console.log("----------- Timed out!!! ------------");
    loadImages();
  }
  xhr.onerror = function (e) {
    currentRequests -= 1;
    console.log("----------- Error!!! ------------");
    loadImages();
  };
  xhr.send();
}