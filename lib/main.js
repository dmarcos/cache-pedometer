var pageMod = require("sdk/page-mod");
var tabs = require("sdk/tabs");
var {Cc, Ci, Cu} = require("chrome");
var utils = require('sdk/window/utils');
var { viewFor } = require("sdk/view/core");
var data = require("sdk/self").data;
var { ActionButton } = require('sdk/ui/button/action');
var { Toolbar } = require("sdk/ui/toolbar");
var { Frame } = require("sdk/ui/frame");

// var previous = ActionButton({
//   id: "previous",
//   label: "previous",
//   icon: "./icons/previous.png"
// });

// var next = ActionButton({
//   id: "next",
//   label: "next",
//   icon: "./icons/next.png"
// });

// var play = ActionButton({
//   id: "play",
//   label: "play",
//   icon: "./icons/play.png"
// });

var totalCache = 0;
var currentPageCache = 0;

var frame = new Frame({
  url: "./index.html"
});

frame.on("attach", updateUI);

var toolbar = Toolbar({
  title: "Player",
  items: [frame]
})

var currentWindow;

function updateUI() {
  var uiData = {
    totalCache: totalCache.toFixed(1),
    currentPageCache: currentPageCache.toFixed(1)
  };
  frame.postMessage(uiData, frame.url);
}

// function updatePageInfo(pageSize) {
//   currentPageCache = pageSize / 1024;
//   totalCache += currentPageCache;
//   updateUI();
// }

var storage;

function calculatePageSize(urls, callback) {
  var pageSize = 0;
  var finishedRequests = 0;
  var i;
  var url;
  var window = utils.getMostRecentBrowserWindow();
  storage = cacheService.diskCacheStorage(
    // Note: make sure |window| is the window you want
    LoadContextInfo.fromLoadContext(PrivateBrowsingUtils.privacyContextFromWindow(window, false)),
    false
  );
  for (i=0; i<urls.length; ++i) {
    url = urls[i];
    if (!url || url.length === 0) {
      finishedRequests += 1;
      continue;
    }
    console.log("REQUEST SIZE " + urls[i]);
    cacheSize(urls[i], function(size) {
      pageSize += size;
      finishedRequests += 1;
      if (finishedRequests === urls.length) {
        callback(pageSize);
      }
    });
  }
}

function updatePageInfo(urls) {
  calculatePageSize(urls, function(size) {
    console.log("PAGE TOTAL SIZE XXX " + (size / 1024).toFixed(1));
  });
}

function cacheSize(url, callback) {
    storage.asyncOpenURI(
      makeURI(url),
      "",
      Ci.nsICacheStorage.OPEN_READONLY,
      {
        onCacheEntryCheck: function (entry, appcache) {
          return Ci.nsICacheEntryOpenCallback.ENTRY_WANTED;
        },
        onCacheEntryAvailable: function (entry, isnew, appcache, status) {
          try {
            var pageSize = entry? entry.storageDataSize : 0;
            console.log("PAGE SIZE XXX " + url + " " + pageSize);
            callback(pageSize);
          } catch(err) {
            callback(0);
          }
        }
      }
    );
}

function makeURI(aURL, aOriginCharset, aBaseURI) {
  var ioService = Cc["@mozilla.org/network/io-service;1"]
                  .getService(Ci.nsIIOService);
  return ioService.newURI(aURL, aOriginCharset, aBaseURI);
}

var cacheService = Cc["@mozilla.org/netwerk/cache-storage-service;1"].getService(Ci.nsICacheStorageService);

let {LoadContextInfo} = Cu.import(
  "resource://gre/modules/LoadContextInfo.jsm", {}
);

let {PrivateBrowsingUtils} = Cu.import(
  "resource://gre/modules/PrivateBrowsingUtils.jsm", {}
);


pageMod.PageMod({
  include: ["*"],
  contentScriptFile: data.url("pageInfo.js"),
  attachTo: ["top"], // Ignores iframes. Only top level pages
  onAttach: function onAttach(worker) {

    // currentWindow = viewFor(worker.tab.window);

    // var storage = cacheService.diskCacheStorage(
    //   // Note: make sure |window| is the window you want
    //   LoadContextInfo.fromLoadContext(PrivateBrowsingUtils.privacyContextFromWindow(currentWindow, false)),
    //   false
    // );

    // storage.asyncOpenURI(
    //   makeURI(worker.url.replace(/#.*$/, "")),
    //   "",
    //   Ci.nsICacheStorage.OPEN_NORMALLY,
    //   {
    //     onCacheEntryCheck: function (entry, appcache) {
    //       return Ci.nsICacheEntryOpenCallback.ENTRY_WANTED;
    //     },
    //     onCacheEntryAvailable: function (entry, isnew, appcache, status) {
    //       var pageSize = Math.round(entry.dataSize / 1024 * 100) / 100;
    //       console.log("PAGE SIZE " + pageSize + " " + status);
    //     }
    //   }
    // );

    console.log("Opening Page " + worker.url);
    var currentWindow = viewFor(worker.tab.window);
    var currentDocument = currentWindow.document;
    //console.log("Opened Document " + currentDocument.documentElement.innerHTML);
    worker.port.emit("requestPageInfo");
    worker.port.on("pageInfo", updatePageInfo);
    // Converts from BrowserWindow to window/utils window
    //var mostRecentWindow = utils.getMostRecentBrowserWindow();
    //var topLevelWindow = utils.getToplevelWindow(currentWindow.content);
    // if (currentWindow === topLevelWindow) {
    //   if (!currentWindow.content.defaultView.frameElement) {
    //     console.log("CACA2");
    //   }
    // }
  }
});