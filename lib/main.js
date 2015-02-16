var pageMod = require("sdk/page-mod");
var tabs = require("sdk/tabs");
var {Cc, Ci, Cu} = require("chrome");
var utils = require('sdk/window/utils');
var { viewFor } = require("sdk/view/core");
var data = require("sdk/self").data;
var { ActionButton } = require('sdk/ui/button/action');
var { Toolbar } = require("sdk/ui/toolbar");
var { Frame } = require("sdk/ui/frame");

var cacheService = Cc["@mozilla.org/netwerk/cache-storage-service;1"].getService(Ci.nsICacheStorageService);

let {LoadContextInfo} = Cu.import(
  "resource://gre/modules/LoadContextInfo.jsm", {}
);

let {PrivateBrowsingUtils} = Cu.import(
  "resource://gre/modules/PrivateBrowsingUtils.jsm", {}
);

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
var currentURL;

var frame = new Frame({
  url: "./index.html"
});

frame.on("attach", updateUI);

var toolbar = Toolbar({
  title: "Player",
  items: [frame]
})

var currentWindow = utils.getMostRecentBrowserWindow();
var storage;
var sizeUnits = ['bytes', 'KB', 'MB', 'GB', 'TB'];

// currentWindow.gBrowser.addEventListener("load", function() {
//   currentPageCache = 'Calculating...'
//   updateUI();
// }, true);

function calculateUnits(size) {
  if (typeof size !== 'number') {
    return size;
  }
  var unit = 0;
  while (size > 1024) {
    size = size / 1024;
    unit += 1;
  }
  return size.toFixed(1) + " " + sizeUnits[unit];
}

function updateUI() {
  var uiData = {
    lastURL: currentURL,
    totalCache: calculateUnits(totalCache),
    currentPageCache: calculateUnits(currentPageCache)
  };
  frame.postMessage(uiData, frame.url);
}

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
  console.log("REQUEST NUMBER " + urls.length);
  for (i=0; i<urls.length; ++i) {
    url = urls[i];
    if (!url || url.length === 0) {
      finishedRequests += 1;
      console.log("REQUEST FINISHED X" + finishedRequests);
      if (finishedRequests === urls.length) {
        callback(pageSize);
      }
      continue;
    }
    cacheSize(urls[i], function(size) {
      pageSize += size;
      finishedRequests += 1;
      console.log("REQUEST FINISHED " + finishedRequests);
      if (finishedRequests === urls.length) {
        callback(pageSize);
      }
    });
  }
}

function updatePageInfo(urls) {
  calculatePageSize(urls, function(size) {
    currentPageCache = size;
    totalCache += size;
    //console.log("PAGE TOTAL SIZE XXX " + pageSize);
    updateUI();
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
          console.log("PAGE SIZE XXX " + url + " " + pageSize + " " + isnew);
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

pageMod.PageMod({
  include: ["*"],
  contentScriptFile: data.url("pageInfo.js"),
  attachTo: ["top"], // Ignores iframes. Only top level pages
  onAttach: function onAttach(worker) {
    currentURL = worker.url;
    console.log("Opening Page " + worker.url);
    var currentWindow = viewFor(worker.tab.window);
    var currentDocument = currentWindow.document;
    worker.port.emit("requestPageInfo");
    worker.port.on("pageInfo", updatePageInfo);
  }
});