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


import {getCaseInformation,getCaseNumberFromCloseTab,getSelectedTextWithNewLines,copyToClipboard,pasteToTextarea,getShortLink} from './clipboard-helper.js';
import {sortTabs, discardTechnotes, getCurrentTab} from './tabs-helper.js';
import {getTemplateName,getTemplateText,getTemplateType, getTemplateParentId,getTemplate, importTemplates,importSharedTemplatesClipboard,exportTemplatesClipboard,setSharedTemplate,getSharedTemplate,getSharedTemplatesFromURL,getSharedURL,saveAllTemplates,isValidSubmenu,determineMenuType} from './template-helper.js';

import {getTemplateMax,templateMax,key,link1,link2,link3,link4,link5,cpformat1,DEFAULT_SHARED_TEMPLATE,TEMPLATE_FILE,defaultDateFormat} from './constants.js';
import {mainMenu, sharedtemplatesMenu, mytemplatesMenu, setSharedTemplatesCheckTitle, setSharedTemplatesSyncInProgress, setSharedTemplatesSyncCompleted, setMyTemplatesSyncInProgress, setMyTemplatesSyncCompleted} from './menus.js';
import * as dateHelper from './date-helper.js'; 

var sharedtemplate = [];
var template = [];

var links = new Object();
links.link1 = link1;
links.link2 = link2;
links.link3 = link3;
links.link4 = link4;
links.link5 = link5;

var tsno = new Object();
tsno.id = null;
tsno.source = "none";

var page = new Object();
page.title = null;
page.url = null;
page.cpformat = cpformat1;
page.cliptext = null; // *** UNCOMMENT FOR CHROME , COMMENT OUT FOR FIREFOX ***

/*
 * copy object is to store copied data
 */
var copy = new Object();
copy.title = null;
copy.url = null;

var ports = []
var actTab = null;

//Controls if My Template Update is visible
var betaVisibility = true;

// *** CHROME(page.cliptext) / DO NOT NEED TO UNCOMMENT FOR FIREFOX***
if (typeof page.cliptext !== 'undefined') {
	chrome.runtime.onInstalled.addListener(async () => {
		initMainMenu();
	});
} else {
	initMainMenu();
	setInterval(function() {chrome.tabs.query({}, discardTechnotes);}, 60000);
}

async function initMainMenu() {
    /*
     * We use the templateMax as the max to prevent issues loading menus.  Otherwise code would have to be written to micro-manage the menus.  
     * This could be a problem in the future if the upper maximum is increased beyond 99.
     */
    var max = templateMax;

/*    if (typeof page.cliptext !== 'undefined') {
        max = await getTemplateMax();
    }
*/

	//Main Menu
	for (let i=0; i<mainMenu.length;i++)
		{
			chrome.contextMenus.create(mainMenu[i]);
		
		}
	
	//Shared Templates Menu
    for(let i=0; i<max; i++) {
          chrome.contextMenus.create({
              id: "sharedtemplate-"+i,
              parentId: "sharedtemplate",
              title: "New Template",
              contexts: ["all"],
              visible: false,
          });
        }
        
    for (let i=0; i<sharedtemplatesMenu.length; i++)
    {
		chrome.contextMenus.create(sharedtemplatesMenu[i]);

    }

    //My Templates Menu
	for(let i=0; i<max; i++) {
	  chrome.contextMenus.create({
	      id: "mytemplate-"+i,
	      parentId: "mytemplate",
	      title: "New Template",
	      contexts: ["all"],
              visible: false,
              type: "normal",
	  });
	}
	
    for (let i=0; i<mytemplatesMenu.length; i++)
    {
		chrome.contextMenus.create(mytemplatesMenu[i]);

    }
	
    //Other menu operations
	var msg = new Object();
	msg.selection = "init_selection";
	msg.title = "init_title";
	msg.url = "init_url";
	initContextMenu(msg);
	
	//Other Default Settings
	//Date Format
	await dateHelper.setCustomDate(defaultDateFormat);
	await dateHelper.setCustomLocale(navigator.language); //Default on install simply pulls the value from navigator.language

}

function connected(p) {
    ports[p.sender.tab.id] = p
}
chrome.runtime.onConnect.addListener(connected);

function handleActivated(activeInfo) {
  actTab = activeInfo;
  if (typeof ports[activeInfo.tabId] !== 'undefined') {
    ports[activeInfo.tabId].postMessage({action: "tabChanged"});
  }
  // *** CHROME(page.cliptext) / DO NOT NEED TO UNCOMMENT FOR FIREFOX***
  if (typeof page.cliptext === 'undefined') {
	chrome.tabs.query({}, discardTechnotes);
  }
}
chrome.tabs.onActivated.addListener(handleActivated);

chrome.storage.onChanged.addListener(async function (changes, namespace) {
  // Code to notice configuration change. I will use this in the future to elimiate unrequired code execution.
  for (let [k, { oldValue, newValue }] of Object.entries(changes)) {
    /* Keep this console log output as comment to use future change
    console.log(
      `Storage key "${k}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
    */
	if (k.startsWith('template_title') || k.startsWith('template_text') || k.startsWith('template_type') || k.startsWith('template_parentId'))
	{
//	    console.log(k);
	}
	  
	
    if (k.startsWith('template_title'))
    {
	    // Get id from key template_title<id>
	    var id = k.substring(14);
	    if (template[id] == null || template[id] === undefined)
	    {
			template[id] = await getTemplate(id);
		}
		
	    if (template[id].title == null || template[id].title === undefined || template[id].title === "" || template[id].title.match(/^[ \t\r\n\f]*$/))
	    {
			template[id].title = "New Template";	
		}
		
    	if (template[id].cliptext == null || template[id].cliptext === undefined)
	    {
			template[id].cliptext = "";	
		}
		
	    if (template[id].parentId == null || template[id].parentId === undefined)
	    {
			template[id].parentId = "mytemplate";	
		}	
		
		if (template[id].type == null || template[id].type === undefined)
		{
			template[id].type = "TEMPLATE"
		}
		
	    if (newValue == null || newValue === undefined || newValue === "" || newValue.match(/^[ \t\r\n\f]*$/))
	    {
			template[id].title = "New Template";
		}
	    else
	    {
			template[id].title = newValue;
	    }
	    
				await chrome.contextMenus.update('mytemplate-'+id, { 
                title: template[id].title,
                visible: isTitleVisible(template[id].title,template[id].cliptext),
//                parentId: "mytemplate", //todo
//                type: determineMenuType(template[id].type), //todo
	    });

    }
    else if (k.startsWith('template_text')) 
    {
	    // Get id from key template_text<id>
	    var id = k.substring(13);

	    if (template[id] == null || template[id] === undefined)
	    {
			template[id] = await getTemplate(id);
		}
		
	    if (template[id].title == null || template[id].title === undefined || template[id].title === "" || template[id].title.match(/^[ \t\r\n\f]*$/))
	    {
			template[id].title = "New Template";	
		}
		
    	if (template[id].cliptext == null || template[id].cliptext === undefined)
	    {
			template[id].cliptext = "";	
		}
		
	    if (template[id].parentId == null || template[id].parentId === undefined)
	    {
			template[id].parentId = "mytemplate";	
		}	
		
		if (template[id].type == null || template[id].type === undefined)
		{
			template[id].type = "TEMPLATE"
		}
			    
	    if (newValue == null || newValue === undefined)
	    {
			template[id].cliptext = "";	
		}
		else
	    {
			template[id].cliptext = newValue;
        }
        
				await chrome.contextMenus.update('mytemplate-'+id, {
                title: template[id].title,
                visible: isTitleVisible(template[id].title,template[id].cliptext),
//                parentId: "mytemplate", //todo
//                type: determineMenuType(template[id].type), //todo
            });
    }
    else if (k.startsWith('template_type'))  //Represents TEMPLATE (or undefined, null, or "" for backwards compatibility), SUBMENU, or SEPARATOR
   	{
	   	var id = k.substring(13); //template_type has 13 characters
	   	
	   	if (template[id] == null || template[id] === undefined)
	    {
			template[id] = await getTemplate(id);
		}
	   	
	   	if (template[id].title == null || template[id].title === undefined || template[id].title === "" || template[id].title.match(/^[ \t\r\n\f]*$/))
	    {
			template[id].title = "New Template";	
		}
		
    	if (template[id].cliptext == null || template[id].cliptext === undefined)
	    {
			template[id].cliptext = "";	
		}
		
	    if (template[id].parentId == null || template[id].parentId === undefined)
	    {
			template[id].parentId = "mytemplate";	
		}	
		
		if (template[id].type == null || template[id].type === undefined)
		{
			template[id].type = "TEMPLATE"
		}
		
    	var mytemplateType = "normal";
    	//TODO call method to validate submenu
		let parentId = template[id].parentId; 
		
		if (parentId == null || parentId == undefined || parentId === "")
		{
			parentId = "mytemplate";
		}
		else if (await isValidSubmenu(parentId) === false)
		{
			parentId = "mytemplate"
		}
		else
		{
			parentId = "mytemplate";
		}
		
		mytemplateType = determineMenuType(newValue);
    	
    	if (mytemplateType === "normal" && (newValue == null || newValue === undefined || newValue === ""))
    	{   
			template[id].type = "TEMPLATE";
		}
		else
		{
			template[id].type = newValue;
		}
    	
    		await chrome.contextMenus.update('mytemplate-'+id, {
    		title: template[id].title,  
            visible: isTitleVisible(template[id].title,template[id].cliptext),
//            parentId: parentId,  //TODO
            type: mytemplateType, //TODO
    	});
    	
   	}
    else if (k.startsWith('template_parentId'))  //Represents the parentId... by default the menus all have a parentId of "mytemplate" for My Templates, but the name here represents
    {
	   	var id = k.substring(17); // template_parentId has 17 characters

	    if (template[id] == null || template[id] === undefined)
	    {
			template[id] = await getTemplate(id);
		}

	    if (template[id].title == null || template[id].title === undefined || template[id].title === "" || template[id].title.match(/^[ \t\r\n\f]*$/))
	    {
			template[id].title = "New Template";	
		}
		
    	if (template[id].cliptext == null || template[id].cliptext === undefined)
	    {
			template[id].cliptext = "";	
		}
		
	    if (template[id].parentId == null || template[id].parentId === undefined)
	    {
			template[id].parentId = "mytemplate";	
		}	
		
		if (template[id].type == null || template[id].type === undefined)
		{
			template[id].type = "TEMPLATE"
		}
		
    	let parentId = "mytemplate";
    	
		if (newValue == null || newValue == undefined || newValue === "")
		{
	    	template[id].parentId = "mytemplate";
		}
		else if (await isValidSubmenu(parentId) === false)
		{
			parentId = "mytemplate";
		}
   	
    	//TODO verify that the submenu exists, otherwise set it back to mytemplate
    	
//        await chrome.contextMenus.update('mytemplate-'+id, {
//            title: template[id].title,
//            visible: isTitleVisible(template[id].title,template[id].cliptext),
//           parentId: template[id].parentId,
//            type: determineMenuType(template[id].type), //TODO
//            
//        });
                
        //Only register that we should rebuild the template menu if the oldValue and newValue are not matching.  
        if (oldValue === newValue)
        {
			
		}
        else
        {
			await chrome.storage.local.set({mustRebuildMyTemplates: true});
		}
		
    }
    //This performs the operation to rebuild the template menu.  We only rebuild if checkRebuildState() returns true.
    //This is necessary for Firefox as menus that have been updated with parnetId need to be rebuilt.
    //Set doRebuildMyTemplates to true in chrome.storage.local to trigger this operation.  
    else if (k === "doRebuildMyTemplates")
    {
		if (newValue === true)
		{		
			if (await checkRebuildState() === true)
			{
//				console.log("rebuildMyTemplates()");
				await rebuildMyTemplates();
				await chrome.storage.local.set({mustRebuildMyTemplates: false,});
			}
			
			await chrome.storage.local.set({doRebuildMyTemplates: false,});
		}

	}
    else if (k.startsWith('sharedtemplate'))
    {
            await setSharedTemplatesSyncInProgress();
            if (typeof newValue !== 'undefined') {
                sharedtemplate = newValue;
                for(let id=0; id<sharedtemplate.length; id++) {
                        await chrome.contextMenus.update('sharedtemplate-'+id, {
                                title: sharedtemplate[id].title,
                                visible: isTitleVisible(sharedtemplate[id].title,sharedtemplate[id].cliptext),
                        });
                }
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            await setSharedTemplatesSyncCompleted();
    }
    else if (k.startsWith('link'))
    {
            if (typeof newValue !== 'undefined'){
                if (links[k] !== newValue) {
             		links[k].name = "🔗 " +newValue;
                }
            }
            chrome.contextMenus.update(links[k].id, {
                title: links[k].name
            });
    }
    
    else if (k.startsWith('url')) 
    {
	    if (typeof newValue !== 'undefined'){
		k = 'link'+k.substring(3);
		if(links[k] !== newValue) {
			links[k].url = newValue;
		}
	    }
    }
    else if (k.startsWith('cpformat')) 
    {
            if (typeof newValue !== 'undefined'){
                page.cpformat = newValue;
            }
    }
    else if (k.startsWith('sep') || 
	    k.startsWith('owner') ||
	    k.startsWith('team') ||
	    k.startsWith('schedule') ||
	    k.startsWith('altowner') ||
	    k.startsWith('altteam')) {
	    if (typeof newValue !== 'undefined'){
		key[k] = newValue;
	    }
    }

  }
});

chrome.runtime.onMessage.addListener(async function(msg, sender, sendResponse) {
    // *** FOR CHROME(updateClipText) , DO NOT NEED TO UNCOMMENT FOR FIREFOX***
    if (msg.request === 'updateClipText') {
	    page.cliptext = msg.cliptext;

    } else if (msg.request === 'updateContextMenu') {
	if (template.length !== templateMax) {
		initContextMenu(msg);
	} else {
        	updateContextMenu(msg);
	}
    } else if (msg.request === 'mytemplate-update' || msg.request === 'mytemplate-update-advanced') {
            saveTemplate(msg.id, msg.title);
    }
});

async function updateContextMenu(msg) {

        var text = msg.selection;
        page.title = msg.title;

        tsno.id = await getTSNO(text);
        var context = "all";

        if (tsno.source === 'none') {
          context = "audio";
        }

        chrome.contextMenus.update("copy-case-no", {
          title: "Copy " + tsno.id + " (" + tsno.source + ")",
          contexts: [context],
        });

        chrome.contextMenus.update(link1.id, {
              contexts: [context],
        });

        chrome.contextMenus.update(link2.id, {
              contexts: [context],
        });

          chrome.contextMenus.update(link3.id, {
              contexts: [context],
          });

          chrome.contextMenus.update(link4.id, {
              contexts: [context],
          });

          chrome.contextMenus.update(link5.id, {
              contexts: [context],
          });

          if(link1.url.endsWith('{nocase}')) {
              chrome.contextMenus.update(link1.id, {
                  contexts: ["all"],
              });
          }

          if(link2.url.endsWith('{nocase}')) {
              chrome.contextMenus.update(link2.id, {
                  contexts: ["all"],
              });
          }

         if(link3.url.endsWith('{nocase}')) {
              chrome.contextMenus.update(link3.id, {
                  contexts: ["all"],
              });
          }

          if(link4.url.endsWith('{nocase}')) {
              chrome.contextMenus.update(link4.id, {
                  contexts: ["all"],
              });
          }

          if(link5.url.endsWith('{nocase}')) {
              chrome.contextMenus.update(link5.id, {
                  contexts: ["all"],
              });
          }

        chrome.contextMenus.update("copy-unix-path", {
            contexts: [context]
        });

        chrome.contextMenus.update("copy-citrix-path", {
            contexts: [context]
        });

        chrome.contextMenus.update("copy-bd-path", {
            contexts: [context]
        });

        chrome.contextMenus.update("copy-eacaccess-path", {
            contexts: [context]
        });

        if (tsno.source === 'select') {
          var changedPathTitle = "Not working";
          var isPath = true;
          var path = text.trim();
          var unixpath = await getUnixPathPrefix();
          if(path.startsWith('S:\\sf\\TS')) {
            changedPathTitle = "Copy Citrix => UNIX path";
          } else if (path.startsWith(unixpath + '/TS')) {
            changedPathTitle = "Copy UNIX => Citrix path";
          } else {
            isPath = false;
          }

          if (isPath) {
            chrome.contextMenus.update("copy-changed-path", {
              title: changedPathTitle,
              contexts: ["selection"]
            });
          } else {
            chrome.contextMenus.update("copy-changed-path", {
              title: changedPathTitle,
              contexts: ["audio"]
            });
          }
        }
        let getpastetemplatetotextarea = chrome.storage.local.get("pastetemplatetotextarea", function (value) {
        	if (typeof value.pastetemplatetotextarea !== 'undefined') {
        		chrome.contextMenus.update("pastetemplatetotextarea", { 
        			checked: value.pastetemplatetotextarea
        		});
        	}
        	
        });

}

/*
 * Function to check template is visible
 * If title includes "New Template", it will disappear from the context menu.
 */
function isTitleVisible(title, cliptext) {
        var isVisible = true;
	if (cliptext === null || cliptext === "") {
	        if (title === null || (title.endsWith("New Template") || title === "")) {
        		isVisible = false;
        	}
	} 
        return isVisible;
}

async function initContextMenu(msg) {
        var text = msg.selection;
        page.title = msg.title;

	var isSync = await getSharedTemplatesFromURL(true);
	await setSharedTemplatesCheckTitle(isSync);
	sharedtemplate = await getSharedTemplate();
	for(let id=0; id<sharedtemplate.length; id++) {
	    chrome.contextMenus.update('sharedtemplate-'+id, {
              title: sharedtemplate[id].title,
              visible: isTitleVisible(sharedtemplate[id].title, sharedtemplate[id].cliptext),
            });
	}

/*  We now call rebuildMyTemplates() to rebuild the mytemplates menu
        for(let id=0; id<await getTemplateMax(); id++) {
	  	let templateObj = await getTemplate(id);
	  	var mytemplateType = "normal";
          if (templateObj.type === "SEPARATOR")
          {
			  mytemplateType = "separator";
		  }
          template[id] = templateObj;
          chrome.contextMenus.update('mytemplate-'+id, {
              title: template[id].title,
              visible: isTitleVisible(template[id].title, template[id].cliptext),
              parentId: template[id].parentId, 
              type: mytemplateType, 
          });
	}
*/
		await rebuildMyTemplates();
			  
        var getlink1 = chrome.storage.local.get("link1", function (value) {
          if (typeof value.link1 !== 'undefined'){
            if (link1.name !== value.link1) {
              link1.name = "🔗 " + value.link1;
            }
          }
          if (!link1.name.includes("🔗")) {
            link1.name = "🔗 " + link1.name;
          }
          chrome.contextMenus.update(link1.id, {
              title: link1.name
          });
        });
        var getlink2 = chrome.storage.local.get("link2", function (value) {
          if (typeof value.link2 !== 'undefined'){
            if(link2.name !== value.link2) {
              link2.name = "🔗 " + value.link2;
            }
          } 
          if (!link2.name.includes("🔗")) {
            link2.name = "🔗 " + link2.name;
          }
          chrome.contextMenus.update(link2.id, {
              title: link2.name
          });
        });
        var getlink3 = chrome.storage.local.get("link3", function (value) {
          if (typeof value.link3 !== 'undefined'){
            if (link3.name !== value.link3) {
              link3.name = "🔗 " + value.link3;
            }
          } 
          if (!link3.name.includes("🔗")) {
            link3.name = "🔗 " + link3.name;
          }
          chrome.contextMenus.update(link3.id, {
              title: link3.name
          });
        });
        var getlink4 = chrome.storage.local.get("link4", function (value) {
          if (typeof value.link4 !== 'undefined'){
            if (link4.name !== value.link4) {
              link4.name = "🔗 " + value.link4;
            }
          }
          if (!link4.name.includes("🔗")) {
            link4.name = "🔗 " + link4.name;
          }
          chrome.contextMenus.update(link4.id, {
              title: link4.name
          });
        });
        var getlink5 = chrome.storage.local.get("link5", function (value) {
          if (typeof value.link5 !== 'undefined'){
            if (link5.name !== value.link5) {
              link5.name = "🔗 " + value.link5;
            }
          } 
          if (!link5.name.includes("🔗")) {
            link5.name = "🔗 " + link5.name;
          }
          chrome.contextMenus.update(link5.id, {
              title: link5.name
          });
        });

        var getting1 = chrome.storage.local.get("url1", function (value) {
          if (typeof value.url1 !== 'undefined'){
            link1.url = value.url1;
          }
        });
        var getting2 = chrome.storage.local.get("url2", function (value) {
          if (typeof value.url2 !== 'undefined'){
            link2.url = value.url2;
          }
        });
        var getting3 = chrome.storage.local.get("url3", function (value) {
          if (typeof value.url3 !== 'undefined'){
            link3.url = value.url3;
          }
        });
        var getting4 = chrome.storage.local.get("url4", function (value) {
          if (typeof value.url4 !== 'undefined'){
            link4.url = value.url4;
          }
        });
        var getting5 = chrome.storage.local.get("url5", function (value) {
          if (typeof value.url5 !== 'undefined'){
            link5.url = value.url5;
          }
        });

        var getcpformat1 = chrome.storage.local.get("cpformat1", function (value) {
          if (typeof value.cpformat1 !== 'undefined'){
            page.cpformat = value.cpformat1;
          }
        });

        var getsep = chrome.storage.local.get("sep", function (value) {
          if (typeof value.sep !== 'undefined'){
            key.sep = value.sep;
          }
        });

        var getowner = chrome.storage.local.get("owner", function (value) {
          if (typeof value.owner !== 'undefined'){
            key.owner = value.owner;
          }
        });

        var getteam = chrome.storage.local.get("team", function (value) {
          if (typeof value.team !== 'undefined'){
            key.team = value.team;
          }
        });

        var getschedule = chrome.storage.local.get("schedule", function (value) {
          if (typeof value.schedule !== 'undefined'){
            key.schedule = value.schedule;
          }
        });

        var getaltowner = chrome.storage.local.get("altowner", function (value) {
          if (typeof value.altowner !== 'undefined'){
            key.altowner = value.altowner;
          }
        });

        var getaltteam = chrome.storage.local.get("altteam", function (value) {
          if (typeof value.altteam !== 'undefined'){
            key.altteam = value.altteam;
          }
        });

	updateContextMenu(msg);
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
   await getTSNO(info.selectionText);

	 if (info.menuItemId === link1.id) {
     openLink(link1.url, tsno.id);

   } else if (info.menuItemId === link2.id) {
     openLink(link2.url, tsno.id);

   } else if (info.menuItemId === link3.id) {
     openLink(link3.url, tsno.id);

   } else if (info.menuItemId === link4.id) {
     openLink(link4.url, tsno.id);

   } else if (info.menuItemId === link5.id) {
     openLink(link5.url, tsno.id);

   } else if (info.menuItemId === "copy-selected-text") {
      const text = info.selectionText;
      var body = await escapeNewLines(tab, text);
      copyToClipboard(tab, body);

    } else if (info.menuItemId === "copy-changed-path") {
      var path = info.selectionText.trim();
      var unixprefix = await getUnixPathPrefix();
      if(path.startsWith('S:\\sf\\TS')) {
        path = path.replaceAll('\\', '/').replace('S:/sf', unixprefix);
      } else if (path.startsWith(unixprefix + '/TS')) {
        unixprefix = unixprefix.replaceAll('/', '\\');
        path = path.replaceAll('/', '\\').replace(unixprefix, 'S:\\sf');
      }
      copyToClipboard(tab, path);

    } else if (info.menuItemId === "copy-unix-path") {
      var prefix = await getUnixPathPrefix();
      var path = "cd " + prefix + "/" + tsno.id.substring(0,5) + "/" + tsno.id.substring(5,8) + "/" + tsno.id;
      copyToClipboard(tab, path);

    } else if (info.menuItemId === "copy-citrix-path") {
      var path = "S:\\sf\\" + tsno.id.substring(0,5) + "\\" +  tsno.id.substring(5,8) + "\\" + tsno.id+"\\";
      copyToClipboard(tab, path);

    } else if (info.menuItemId === "copy-bd-path") {
      var path = "H:\\sf\\" + tsno.id.substring(0,5) + "\\" +  tsno.id.substring(5,8) + "\\" + tsno.id+"\\";
      copyToClipboard(tab, path);

    } else if (info.menuItemId === "copy-eacaccess-path") {
      var path = "/ecurep/sf/" + tsno.id.substring(0,5) + "/" + tsno.id.substring(5,8) + "/" + tsno.id;
      path = "yes | eac_access " + path + " ;cd " + path;
      copyToClipboard(tab, path);

    } else if (info.menuItemId === "copy-case-no") {
      copyToClipboard(tab, tsno.id);

    } else if (info.menuItemId === "copy-url-to-clipboard") {
      var cptext = await getTitleURL(tab);
      copyToClipboard(tab, cptext);
      
    } else if (info.menuItemId === "copy-url-only-to-clipboard") {
        var cptext = await getURL(tab);
        copyToClipboard(tab, cptext);

    } else if (info.menuItemId === "copy-url-text-to-clipboard") {
      var cptext = await getTitleURL(tab);
      cptext = await getURLSelectedText(tab, cptext, info.selectionText);
      copyToClipboard(tab, cptext);

    } else if (info.menuItemId === "copy-url-notitle-text-to-clipboard") {
      var cptext = await getURL(tab);
      cptext = await getURLSelectedText(tab, cptext, info.selectionText);
      copyToClipboard(tab, cptext);

    } else if (info.menuItemId === "sharedtemplate-check") {
      var isSync = await getSharedTemplatesFromURL(false);
      setSharedTemplatesCheckTitle(isSync);
    
    } else if (info.menuItemId === "sharedtemplate-import-file") {
      openOptions();
      
    } else if (info.menuItemId === "open-options") {
      openOptions();
        
    } else if (info.menuItemId === "sharedtemplate-export-clipboard") {
      exportTemplatesClipboard(tab, sharedtemplate);

    } else if (info.menuItemId === "sharedtemplate-import-clipboard") {
      importSharedTemplatesClipboard(page);

    } else if (info.menuItemId.startsWith("sharedtemplate-")) {
      for (let i=0; i<await getTemplateMax(); i++) {
        if (info.menuItemId === "sharedtemplate-"+i) {
          await callTemplateAction(info, tab, sharedtemplate[i]);
          break;
        }
      }

    } else if (info.menuItemId === "mytemplate-update") {
      openTemplateEditor();    
    
    } else if (info.menuItemId === "mytemplate-update-advanced") {
	  openTemplateEditorAdvanced();
	  
    } else if (info.menuItemId === "rebuild-mytemplates") {    //Set variables to trigger a call to rebuildMyTemplates();
		await chrome.storage.local.set({mustRebuildMyTemplates: true, doRebuildMyTemplates: true,});
		//await rebuildMyTemplates();  //Instead we set variables in chrome.storage.local to trigger the rebuilding.
		
    } else if (info.menuItemId === "mytemplate-export") {
      exportTemplatesClipboard(tab, template);

    } else if (info.menuItemId === "mytemplate-import") {
      importTemplates(page);

    } else if (info.menuItemId.startsWith("mytemplate-")){
      for (let i=0; i<await getTemplateMax(); i++) {
        if (info.menuItemId === "mytemplate-"+i) {
          await callTemplateAction(info, tab, template[i]);
          break;
        }
      }
    } else if (info.menuItemId === 'sort-tabs') {
      chrome.tabs.query({}, tabs => {sortTabs(tabs)});

    } else if (info.menuItemId === 'pastetemplatetotextarea')
    {
    	await chrome.storage.local.set({pastetemplatetotextarea: !info.wasChecked});
        chrome.contextMenus.update("pastetemplatetotextarea", {
        checked: !info.wasChecked
        });
    }
});

/*
 * Function to call template action after checking contents
 */ 
async function callTemplateAction(info, tab, t) {
    if(t.tltle !== 'undefined' && t.cliptext !== 'undefined') {
        if(t.title.startsWith('-') && t.cliptext.startsWith('http')) {
            chrome.tabs.create({url: t.cliptext});
        }
    } 
    await copyTemplateToClipboard(info, tab, t.cliptext);
}

/*
 * Function to copy template after doing required operations
 */
async function copyTemplateToClipboard(info, tab, text) {
        var replaceText = await replaceKeys(tab, text);
        await chrome.storage.local.get("pastetemplatetotextarea", function (value) {
        if (typeof value.pastetemplatetotextarea !== 'undefined') {
                if (value.pastetemplatetotextarea == true) {
                        pasteToTextarea(info, tab, replaceText);
                }
        }
        });
        copyToClipboard(tab, replaceText);
}

/*
 * Function to monitor keyboard shortcuts events to execute commands in manifest.json
 */
chrome.commands.onCommand.addListener(async function (command) {
        var tab = await getCurrentTab();
        if(command === 'cmd-copy-title-url-text') {
                var cptext = await getTitleURL(tab);
                cptext = await getURLSelectedTextDirect(tab, cptext);
                copyToClipboard(tab, cptext);
        }
        else if(command === 'cmd-mytemplate-0') {
                await copyTemplateToClipboard(null, tab, template[0].cliptext);
        }
        else if(command === 'cmd-mytemplate-1') {
                await copyTemplateToClipboard(null, tab, template[1].cliptext);
        }
        else if(command === 'cmd-mytemplate-2') {
                await copyTemplateToClipboard(null, tab, template[2].cliptext);
        }
});

async function getURLSelectedText(tab, cptext, selectionText) {
	if (typeof selectionText !== 'undefined') {
		if (typeof page.cliptext !== 'undefined') {
			selectionText = await getSelectedTextWithNewLines(tab);
		}  
		cptext = cptext + "\n{sep}\n" + selectionText + "\n{sep}";
		cptext = String(cptext).replaceAll("{sep}", key.sep);
	}
	return cptext;
}

async function getURLSelectedTextDirect(tab, cptext) {
       var selectionText = await getSelectedTextWithNewLines(tab);
       if (typeof selectionText !== 'undefined') {
                if (selectionText !== '') {
                        cptext = cptext + "\n{sep}\n" + selectionText + "\n{sep}";
                        cptext = String(cptext).replaceAll("{sep}", key.sep);
                }
       }
       return cptext;
}

async function getTSNO(text) {
  var result = false;
  if (typeof text !== 'undefined') {
    if (text !== null) {
      result = text.match(/([tT][sS][0-9]{9})/);
    }
  }
  if(result) {
    tsno.id = RegExp.lastMatch;
    tsno.source = "select";
  } else {
    if (typeof page.title !== 'undefined') {
      if (page.title !== null) {
        result = page.title.match(/([tT][sS][0-9]{9})/);
      }
    }
    if (result) {
      tsno.id = RegExp.lastMatch;
      tsno.source = "title";
    } else {
      // *** CHROME(page.cliptext) / DO NOT NEED TO UNCOMMENT FOR FIREFOX***
      if (typeof page.cliptext !== 'undefined') {
        if (page.cliptext !== null) {
          result = page.cliptext.match(/([tT][sS][0-9]{9})/);
        }
        if (result) {
          tsno.id = RegExp.lastMatch;
          tsno.source = "clip";
        } else {
          tsno.id = null;
          tsno.source = "none";
        }
      } else {
      // ** FIREFOX **
        await navigator.clipboard.readText().then(function(data) {
          result = data.match(/([tT][sS][0-9]{9})/);
          if (result) {
            tsno.id = RegExp.lastMatch;
            tsno.source = "clip";
          } else {
            tsno.id = null;
            tsno.source = "none";
          }
        });
      }
    }
  }
  return tsno.id;
}

function openTemplateEditor() {
  var url = chrome.runtime.getURL("/TemplateEditor.html");
  var creating = chrome.tabs.create({ url: url });
}

function openTemplateEditorAdvanced() {
  var url = chrome.runtime.getURL("/AdvancedTemplateEditor.html");
  var creating = chrome.tabs.create({ url: url });
}

/*
 * Open optionpage at a new tab.
 */
function openOptions() {
  var url = chrome.runtime.getURL("/options.html");
  var creating = chrome.tabs.create({ url: url });
}

function openLink(link, tsnoid) {
  var url = encodeURIComponent(tsnoid);
  if(link.includes('\{query\}')) {
     url = link.replace('\{query\}', url);
  } else if (link.endsWith('{nocase}')) {
     url = link.replace('\{nocase\}', '');
  } else {
     url = link + url;
  }
  chrome.tabs.create({url: url});
}

async function getTitleURL(tab) {
  copy.url = await getTabURL(tab);
  copy.title = getTabTitle(tab);
  return String(page.cpformat).replace("{title}", copy.title)
    .replace("{url}", copy.url)
    .replace("\\n", "\n");
}

async function getURL(tab) {
        copy.url = await getTabURL(tab);
        return String(copy.url);
}

function getTabTitle(tab){
        return String(tab.title);
}

async function getTabURL(tab) {
        if (tab.url.includes("ibm.com/support/pages/")) {
               if (!tab.url.includes("ibm.com/support/pages/apar")) {
                    return await getShortLink(tab);
               }
        }
        return String(tab.url);
}

async function escapeNewLines(tab, str) {
    if (typeof page.cliptext !== 'undefined') 
    {
        str = await getSelectedTextWithNewLines(tab);
    }
    return String(str).replaceAll(/\r?\n\r?\n/g, "\n");
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;")
        .replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function replaceKeys(tab, str) {
 
  // Replace {inXdays} with navigator.language locale Date
  for (var days of str.matchAll(/\{in[0-9]{1,}days\}/g)) {
    var num = parseInt(days[0].replace(/[^0-9]/g, ''));
    str = String(str).replaceAll(days[0], dateHelper.getLocaleDateStringInDays(navigator.language, num));
  }

  // Replace {*-inXdays} with LocaleDate
  for (var days of str.matchAll(/\{.*-in[0-9]{1,}days\}/g)) {
    var locale = days[0].match(/\{.*-in[0-9]/g)[0].replace(/\{/g, '').replace(/-in[0-9]/g, '');
    var num = parseInt(days[0].replace(/[^0-9]/g, ''));
    str = String(str).replaceAll(days[0], dateHelper.getLocaleDateStringInDays(dateHelper.getValidLocale(locale), num));
  }

  // Replace {date+X} with date string used in Options panel
  for (var date of str.matchAll(/\{date\+[0-9]{1,}\}/g)) {
    var num = parseInt(date[0].match(/\+[0-9]{1,}/g)[0].replace(/[^0-9]/g, ''));
    str = String(str).replaceAll(date[0], await dateHelper.replaceDate(num, dateHelper.getValidLocale(await dateHelper.getCustomLocale()))); //Use date syntax from options panel
  } 
  
  // Replace {*-date+X} with formated Date in specified locale (using Options panel formatting)
  for (var date of str.matchAll(/\{.*-date\+[0-9]{1,}\}/g)) {
    var locale = date[0].match(/\{.*-date\+/g)[0].replace(/\{/g, '').replace(/-date\+/g, '');
    var num = parseInt(date[0].match(/\+[0-9]{1,}/g)[0].replace(/[^0-9]/g, ''));
    str = String(str).replaceAll(date[0], await dateHelper.replaceDate(num, dateHelper.getValidLocale(locale)));
  }

  // Replace {date+X-%...} with formatted Date
//  for (var date of str.matchAll(/\{date\+[0-9]{1,}-.*\}/g)) {
//    var num = parseInt(date[0].match(/\+[0-9]{1,}-/g)[0].replace(/[^0-9]/g, ''));
//    var format = date[0].match(/-.*/g)[0].replace(/\}/g, '').substring(1);
//    str = String(str).replaceAll(date[0], dateHelper.replaceDate(num, navigator.language, format));
//  }

  // Replace {*-date+X-%...} with formated Date in specified locale
//  for (var date of str.matchAll(/\{.*-date\+[0-9]{1,}-.*\}/g)) {
//    var locale = date[0].match(/\{.*-date\+/g)[0].replace(/\{/g, '').replace(/-date\+/g, '');
//    var num = parseInt(date[0].match(/\+[0-9]{1,}-/g)[0].replace(/[^0-9]/g, ''));
//    var format = date[0].match(/[0-9]-.*/g)[0].replace(/\}/g, '').substring(2);
//    str = String(str).replaceAll(date[0], dateHelper.replaceDate(num, dateHelper.getValidLocale(locale), format));
//  }

  // Replace {*-today} with Date in specified locale
  for (var today of str.matchAll(/\{.*-today\}/g)) {
    var locale = today[0].replace(/\{/g, '').replace(/-today\}/g, '');
    str = String(str).replaceAll(today[0], dateHelper.getLocaleDateStringInDays(dateHelper.getValidLocale(locale), 0));
  }

  var selectionText = await getSelectedTextWithNewLines(tab);
  if (typeof selectionText !== 'undefined') { 
    str = String(str).replaceAll("{selected-text}", selectionText);
  }

  str = String(str)
    .replaceAll("{sep}", key.sep)
    .replaceAll("{owner}", key.owner)
    .replaceAll("{team}", key.team)
    .replaceAll("{schedule}", key.schedule)
    .replaceAll("{today}", dateHelper.getLocaleDateStringInDays(navigator.language, 0))
    .replaceAll("{date}", await dateHelper.replaceDate(0, dateHelper.getValidLocale(await dateHelper.getCustomLocale()))) //Uses date syntax from Options panel 
    .replaceAll("{alt-owner}", key.altowner)
    .replaceAll("{alt-team}", key.altteam);

  if (tab.url.includes("https://ibmsf.lightning.force.com/lightning/r/Case/")) {
          var result = tab.title.match(/([tT][sS][0-9]{9})/);
          if (result) {
                  tsno.id = RegExp.lastMatch;
                  tsno.source = "title";
                  var caseInfo = await getCaseInformation(tab, tsno.id);
                  str = String(str).replaceAll("{case-contact}", caseInfo.contact)
                    .replaceAll("{case-account}", caseInfo.account)
                    .replaceAll("{case-subject}", caseInfo.subject)
                    .replaceAll("{case-description}", caseInfo.description)
                    .replaceAll("{case-phone}", caseInfo.phone)
                    .replaceAll("{case-parent}", caseInfo.parent)
                    .replaceAll("{case-owner}", caseInfo.caseOwner);
          } else {
                 console.log("The URL matches with lighting case, but case number is not found in the title");
                 console.log("*** URL is " + tab.url + " ***");
                 console.log("*** Title is " + tab.title + " ***");
          }

  } else if (tab.url.includes("CaseClosureForm")) {
          var caseno = await getCaseNumberFromCloseTab(tab);
          if(caseno !== null) {
               var caseInfo = await getCaseInformation(tab, caseno);
                str = String(str).replaceAll("{case-no}", caseno)
                  .replaceAll("{case-contact}", caseInfo.contact)
                  .replaceAll("{case-account}", caseInfo.account)
                  .replaceAll("{case-subject}", caseInfo.subject)
                  .replaceAll("{case-description}", caseInfo.description)
                  .replaceAll("{case-phone}", caseInfo.phone)
                  .replaceAll("{case-parent}", caseInfo.parent)
                  .replaceAll("{case-owner}", caseInfo.caseOwner);
          }
  }

  if ( tsno.source !== 'none') {
	 return String(str).replaceAll("{case-no}", tsno.id);
  } else {
         return str;
  }
}

function printFile(file) {
  var reader = new FileReader();
  reader.onload = function(evt) {
    console.log(evt.target.result);
  };
  reader.readAsText(file);
}

/*
 * Get UNIX PATH Prefix from Options
 */
async function getUnixPathPrefix() {
        const read = async () => {
              return new Promise((resolve) => {
                  chrome.storage.local.get("unixpathprefix", function(items)
        {
               if(typeof items.unixpathprefix === 'undefined') {
                     resolve("/ecurep/sf");
               } else {
                     resolve(items.unixpathprefix);
               }
        });
        }
        )};
       var path = await read(); 
       return path;
}

/*
 * This function may not be required, because Update my template# function does not exist any more.
 */
function saveTemplate(id, title) {
  title = id + ". " + title;
  if (typeof page.cliptext !== 'undefined') {
    // for chrome
    chrome.storage.local.set({['template_title'+id]:title, ['template_text'+id]:page.cliptext});
  } else {
    // for firefox
    navigator.clipboard.readText().then(function(data){
      chrome.storage.local.set({['template_title'+id]:title, ['template_text'+id]:data});
    });
  }
}

async function checkRebuildState()
{
        const read = async () => {
              return new Promise((resolve) => {
                  chrome.storage.local.get({mustRebuildMyTemplates: false}, function(items)
        {
				if (Object.keys(items).length === 0 && items.constructor === Object)
				{
							resolve(false);
				}
				
				resolve(items.mustRebuildMyTemplates)
        });
        }
        )};

        const rebuild = await read();
        return rebuild;
}

async function checkPerformRebuild()
{
        const read = async () => {
              return new Promise((resolve) => {
                  chrome.storage.local.get({doRebuildMyTemplates: false}, function(items)
        {
				if (Object.keys(items).length === 0 && items.constructor === Object)
				{
							resolve(false);
				}
				
				resolve(items.doRebuildMyTemplates)
        });
        }
        )};

        const rebuild = await read();
        return rebuild;
}

/**
* Function to rebuild My Templates menu.  If the parentId of a menu changes, we *must* call this to fix the menu ordering
* Menu items that have had their parentId set (even to the same value) will be placed at the bottom of the current menu (or submenu).  
* This is asynchronous, and will call the Sync In Progress method for MyTemplates to alert the user that the menu is rebuilding.  
*/
async function rebuildMyTemplates()
{
	await setMyTemplatesSyncInProgress();
	
	try
	{
		let max = await getTemplateMax();
		for(let id=0; id< templateMax; id++)
		{
			let templateObj = await getTemplate(id);
		  	var mytemplateType = "normal";
			if (templateObj.type === "SEPARATOR")
			{
				mytemplateType = "separator";
			}
			
			if (templateObj.title == null || templateObj.title === undefined || templateObj.title === "" || templateObj.title.match(/^[ \t\r\n\f]*$/))
			{
				templateObj.title = "New Template";
			}
			template[id] = Object.assign({}, templateObj);
			
			if (id >= max)
			{
				await chrome.contextMenus.update('mytemplate-'+id, {
					title: templateObj.title,
					visible: false,  //Items beyond the current maximum should not be displayed.
					parentId: templateObj.parentId,
					type: mytemplateType,
				});
			}
			else
			{
				await chrome.contextMenus.update('mytemplate-'+id, {
					title: templateObj.title,
					visible: isTitleVisible(templateObj.title, templateObj.cliptext),
					parentId: templateObj.parentId,
					type: mytemplateType,
				});
			}
			//Code needs to be implemented to mark menu items beyond the current maximum, but not beyond the templateMax as not-visible.
			//Or this loop needs to be to the entire templateMax, but entries beyond getTemplateMax() are marked as not visible.  
		}	
		
		for (let i=0; i<mytemplatesMenu.length; i++)
	    {
			let object = Object.assign({}, mytemplatesMenu[i]);
			let menuitemId = mytemplatesMenu[i].id;
			
	        const performDelete = async (object) => {
	              return new Promise((resolve) => {
					  delete object.id;
					resolve(object);
	        	}
	        )};
	        
	        object = await performDelete(object);
			await chrome.contextMenus.update(menuitemId, object);
	    }
	}
	catch (e)
	{
		console.log("ERROR: rebuildMyTemplates(): " + e);
	}   
	finally
	{ 
    	await setMyTemplatesSyncCompleted();
    }
}
