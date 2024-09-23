//* ***************************************************************** */
//*                                                                   */
//* IBM Confidential                                                  */
//* OCO Source Materials                                              */
//*                                                                   */
//* (C) Copyright IBM Corp. 2022-2023                                 */
//*                                                                   */
//* The source code for this program is not published or otherwise    */
//* divested of its trade secrets, irrespective of what has been      */
//* deposited with the U.S. Copyright Office.                         */
//*                                                                   */
//* ***************************************************************** *

var ccPort = chrome.runtime.connect({name:"case-clipboard-port"}); // CHROME(chrome.runtime), FIREFOX(browser.runtime)
ccPort.onMessage.addListener(function(m) {
  if(typeof m.action !== 'undefined') {
    if (m.action === 'tabChanged') {
      sendPageInfo();
    } else if (m.action === 'mytemplate-update') {
      var max = m.templateMax - 1;
      var id = prompt("Please input template#(0 - "+max+") which you want to change.");
      if (id <= max) {
          var template_title = prompt("Please input template title.");
          sendSaveInfo(id, template_title);
      } else {
        alert("Please input # between 0 and "+max+".");
      }
    }
  }

});

//This stores the location of the right-click context menu event.
var contextMenuElement = null;
document.addEventListener("contextmenu", function(event) {
	contextMenuElement = event.target;
}, true);

document.addEventListener('selectionchange', function() {
  sendPageInfo();

}, false);

var html = document.querySelector("html");
html.addEventListener('mouseenter', function() {
  sendPageInfo();

}, false);

document.addEventListener('mousedown', function() {
  sendPageInfo();

}, false);

document.addEventListener('paste', function(event) {
	var str = event.clipboardData.getData('text/plain');
	if (str.indexOf('</NDL>') !== -1) {
		str = str.substring(str.indexOf('<NDL>'));

		var host = str.substring(str.indexOf('<HINT>CN=') + 9);
		host = host.substring(0, host.indexOf('/'));
		// console.log("HOST:" + host);

		var rep = str.substring(str.indexOf('<REPLICA ') + 9);
		rep = rep.substring(0, rep.indexOf('>'));
		rep = rep.replace(/:/g, "");
		// console.log("REPLICA:" + rep);

		var note = str.substring(str.indexOf('<NOTE OF') + 8);
		note = note.substring(0, note.indexOf('>'));
		note = note.replace(/:/g, "");
		note = note.replace(/-ON/g, "");
		// console.log("NOTE:" + note);

		var link = "Notes://" + host + "/" + rep + "//" + note;
		prompt("Copy Notes URL with Ctrl+C keys", link);
		// console.log(str);
		// console.log('Notes Link');
	} else {
		// console.log(str);
	}
}, false);

function sendPageInfo() {
  var result = false;
  var selection = window.getSelection().toString().trim();
  var title = document.title;
  var url = document.URL;
  var header = null;
  var subject = null;
  var x = 0;

  if (url.includes("lightning.force.com")) {
    result = title.match(/([tT][sS][0-9]{9})/);
    if (result) {
      var caseno = RegExp.lastMatch;
      var subtitles = document.querySelectorAll(".title.slds-truncate");
      //console.log("subtitles.length : " + subtitles.length)
      if (subtitles.length === 3) {
        for (var i=0, len=subtitles.length|0; i<len; i=i+1|0) {
          //console.log("subtitles " + i + " :" + subtitles[i].textContent);
          if (subtitles[i].textContent.includes(caseno)) {
             x = i;
             break;
          }
        }
        var headers = document.querySelectorAll(".header__title");
        if (typeof headers !== 'undefined') {
          /*
          console.log("headers is not undefined");
          console.log("x : " + x + " / headers.length : " + headers.length )
          for (var i=0, len=headers.length|0; i<len; i=i+1|0) {
            console.log("headers " + i + " :" + headers[i].title);
          }
          */
          if ( x < headers.length ) {
            title = caseno + " | " + headers[x].title;
          }
        }
      }
    }

  } else {
    result = title.match(/([tT][sS][0-9]{9})/);
    if (! result) {
      if (url.includes("w3.ibm.com/tools/caseviewer/case/")) {
        var caseno = "";
        var caseObj = document.querySelector(".bx--title-case");
        if (typeof caseObj !== 'undefined') {
          if(caseObj !== null) {
            caseno = caseObj.textContent.match(/([tT][sS][0-9]{9})/) ? RegExp.lastMatch + " | " : "";
          }
        }
        var subject = document.querySelector(".bx--col-md-16 > p:nth-child(1) > strong:nth-child(2)");
        if (typeof subject !== 'undefined') {
          if (subject !== null) {
            document.title = caseno + subject.textContent;
          }
        }
        tilte = document.title;
      } else if (url.includes("hursley.ibm.com:9443/jazz/web/projects")) {
        var caseObj = document.querySelector(".LabelValue");
        if (typeof caseObj !== 'undefined') {
          if (caseObj !== null) {
            caseno = caseObj.textContent.match(/([tT][sS][0-9]{9})/) ? RegExp.lastMatch + " | " : "";
            title = caseno + title;
            document.title = title;
          }
        }
      }
    }
  }

  // ONLY CHROME START
  if(typeof (navigator.clipboard) !== 'undefined') {
    navigator.clipboard.readText()
      .then(text => {
         chrome.runtime.sendMessage({
           request: 'updateClipText',
           cliptext: text
           }, function(response) { });
      });
  }

  chrome.runtime.sendMessage({
      request: 'updateContextMenu',
      selection: selection,
      title: title,
      url: url
  }, function(response) { });
}

function sendSaveInfo(id, template_title) {
  chrome.runtime.sendMessage({
    request: 'mytemplate-update',
    id: id,
    title: template_title
  }, function(response) { });
}
// ONLY CHROME END
