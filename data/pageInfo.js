var iframes = [];
var linksCalculated = 0;

self.port.on("requestPageInfo", function(data) {
  var links = [];
  var cacheDepth = parseInt(data.cacheDepth);
  if (window.parent !== window) {
    if (window.name !== 'link') {
      return;
    }
  }
  var imageURLs = extractImages(document);

  var kk = cacheDepth !== 0;
  console.log("CACHE DEPTH " + " " +  + " " + cacheDepth + " " + kk);
  if (window.parent === window &&
      cacheDepth !== 0) {
    links = extractLinks(document);
    loadLinks(links);
  }

  self.port.emit("pageInfo", {
    images: imageURLs,
    links: links
  });

});

function extractImages(doc) {
  var imageURLs = [];
  var images = doc.getElementsByTagName('img');
  imageURLs.push(doc.location.toString());
  for (var i = 0; i < images.length; i++) {
    imageURLs.push(images[i].src);
  }
  return imageURLs;
}

function extractLinks(doc) {
  var links = [];
  var aEls = doc.getElementsByTagName('a');
  for (var i = 0; i < aEls.length; i++) {
    links.push(aEls[i].href);
  }
  return links;
}

function loadLinks(links) {
  var i;
  var link;
  var offscreenIframe;
  var html = '<body>Foo</body>';
  console.log("LOAD " + links.length);
  for(i=0; i<links.length; ++i) {
    console.log("LOADING " + links[i]);
    if (links[i].indexOf("mailto:") !== -1) {
      continue;
    }
    offscreenIframe = document.createElement('iframe');
    offscreenIframe.setAttribute('name', 'link');
    // prevent opening pop ups and frame busting (the iframe cannot change windows.location from parent)
    offscreenIframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
    offscreenIframe.style.display = 'none';
    offscreenIframe.onload = function () {
      var iframe = offscreenIframe;
      console.log("LOADED " + iframe.contentWindow);
      //iframe.contentDocument.onload =
      //head.appendChild(infoScript);

      // var iframe = offscreenIframe;
      // calculatePageSize(iframe.contentDocument);
      // linksCalculated += 1;
      // if (linksCalculated === links.length) {
      //   self.port.emit("pageInfo", imageURLs);
      // }
    };
    // offscreenIframe.addEventListener('load', (function () {
    //   var iframe = offscreenIframe;
    //   return function() {
    //     //console.log("CACOTA " + iframe.contentWindow);
    //     iframe.contentWindow.onload = function() {
    //       var head = iframe.contentDocument.getElementsByTagName("head")[0];
    //       var infoScript = document.createElement('script');
    //       infoScript.type = 'text/javascript';
    //       infoScript.src = 'caca.js';
    //       head.appendChild(infoScript);
    //       console.log("LOADED");
    //       // calculatePageSize(iframe.contentDocument);
    //       // linksCalculated += 1;
    //       // if (linksCalculated === links.length) {
    //       //   self.port.emit("pageInfo", imageURLs);
    //       // }
    //     };
    //   };
    // })(), false);
    iframes.push(offscreenIframe);
    link = links[i].replace("http://","")
      .replace("https://","");
    //offscreenIframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html);
    offscreenIframe.src = links[i];
    document.body.appendChild(offscreenIframe);
  }
}
