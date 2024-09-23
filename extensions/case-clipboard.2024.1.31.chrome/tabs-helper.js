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

let sorturls = []
sorturls.push("outlook.office.com");
sorturls.push("https://.*\.slack\.com.*");
sorturls.push("ibmsf.lightning.force.com");
sorturls.push("https://jazz.*\.hursley\.ibm\.com.*");
sorturls.push("ecurep.mainz.de.ibm.com");
sorturls.push("w3.ibm.com/tools/caseviewer");
sorturls.push("www.ibm.com/support");

export function sortTabs(tabs) {

  let urls = [];
  for (var i=0; i<tabs.length; i++) {
    urls.push(tabs[i].url);
  }
  urls.sort(function(a, b) {

    for(var i=0; i<sorturls.length; i++){
      if(isMatchUrl(a, b, sorturls[i])) {
        return sortUrl(a, b, sorturls[i]);
      }
    }

    if (a > b) {
      return 1;
    } else {
      return -1;
    }

  });

  let moved = [];
  for(var i=0; i<urls.length; i++){
    for (var j=0; j<tabs.length; j++) {
      if (moved.indexOf(tabs[j].id) < 0) {
        if (tabs[j].url === urls[i]) {
          chrome.tabs.move([tabs[j].id], {index: i});
          moved.push(tabs[j].id);
          break;
        }
      }
    }
  }

}

function isMatchUrl(a, b, url) {
  if(a.startsWith(url, 8) || b.startsWith(url, 8)) {
    return true;
  }

  if (url.startsWith("http")) {
    if (a.match(url) || b.match(url)) {
      return true;
    }
  }

  return false;
}

function sortUrl(a, b, url) {
  if(a.startsWith(url, 8) || b.startsWith(url, 8)) {
    if(!a.startsWith(url, 8)) {
      return 1;
    } else if (b.startsWith(url, 8)) {
      if (a > b) {
        return 1;
      } else {
        return -1;
      }
    }
    return -1;
  }

  if(a.match(url) || b.match(url)) {
    if(!a.match(url)) {
      return 1;
    } else if(b.match(url)) {
      if (a > b) {
        return 1;
      } else {
        return -1;
      }
    }
    return -1;
  }

  return -1;
}

export function discardTechnotes(tabs) {
  for(var i=0; i<tabs.length; i++){
    if (tabs[i].url.startsWith("https://www.ibm.com/support/")) {
      if(!tabs[i].discarded) {
        if (Date.now() - tabs[i].lastAccessed > 600000) {
          chrome.tabs.discard(tabs[i].id);
        }
      }
    }
  }
}

/*      
 * Get current Active tab
 */       
export async function getCurrentTab() {
        var tab = await chrome.tabs.query({ currentWindow:true, active:true }).then(tabs => { // UNCOMMENT FOR CHROME
        // var tab = await browser.tabs.query({ currentWindow:true, active:true }).then(tabs => { // UNCOMMENT FOR FIREFOX
                for (tab of tabs) {
                        return tab;
                }
        }, error => {
                console.error(error)
        })
        return tab;
}
