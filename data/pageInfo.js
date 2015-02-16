var imageURLs = [];
var iframes = [];
var linksCalculated = 0;

self.port.on("requestPageInfo", function() {
  var links = document.getElementsByTagName('a');
  calculatePageSize(document);
  // if (links.length === 0) {
  //   self.port.emit("pageInfo", imageURLs);
  // } else {
  //   loadLinks(links);
  // }
  self.port.emit("pageInfo", imageURLs);
});

function calculatePageSize(doc) {
  var images = document.getElementsByTagName('img');
  imageURLs.push(doc.location.toString());
  for (var i = 0; i < images.length; i++) {
    imageURLs.push(images[i].src);
  }
}

function loadLinks(links) {
  var i;
  var link;
  var offscreenIframe;
  //var html = '<body>Foo</body>';
  console.log("LOAD " + links.length);
  for(i=0; i<links.length; ++i) {
    console.log("LOADING " + links[i].href);
    offscreenIframe = document.createElement('iframe');
    offscreenIframe.style.display = 'none';
    // offscreenIframe.onload = function () {
    //   console.log("LOADED");
    //   var iframe = offscreenIframe;
    //   calculatePageSize(iframe.contentDocument);
    //   linksCalculated += 1;
    //   if (linksCalculated === links.length) {
    //     self.port.emit("pageInfo", imageURLs);
    //   }
    // };
    offscreenIframe.addEventListener('load', (function () {
      var iframe = offscreenIframe;
      return function() {
        console.log("CACOTA " + iframe.contentDocument);
        iframe.contentWindow.onload = function() {
          var head = iframe.contentDocument.getElementsByTagName("head")[0];
          var infoScript = document.createElement('script');
          infoScript.type = 'text/javascript';
          infoScript.src = 'pageInfo.js';
          head.appendChild(myscript);
          // calculatePageSize(iframe.contentDocument);
          // linksCalculated += 1;
          // if (linksCalculated === links.length) {
          //   self.port.emit("pageInfo", imageURLs);
          // }
        };
      };
    })(), false);
    iframes.push(offscreenIframe);
    link = links[i].href.replace("http://","")
      .replace("https://","");
    //offscreenIframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html);
    offscreenIframe.src = links[i].href;
    document.body.appendChild(offscreenIframe);
  }
}
