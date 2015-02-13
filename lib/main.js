var pageMod = require("sdk/page-mod");
var tabs = require("sdk/tabs");
var {Cc, Ci, Cu} = require("chrome");
var utils = require('sdk/window/utils');
var { viewFor } = require("sdk/view/core");

pageMod.PageMod({
  include: ["*"],
  attachTo: ["top"], // Ignores iframes. Only top level pages
  onAttach: function onAttach(worker) {
    console.log("Opening Page " + worker.url);
    var currentWindow = viewFor(worker.tab.window);
    var currentDocument = currentWindow.document;
    console.log("Opened Document " + currentDocument.documentElement.innerHTML);
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

var frame = new Frame({
  url: "./index.html"
});

var toolbar = Toolbar({
  title: "Player",
  items: [frame]
})
