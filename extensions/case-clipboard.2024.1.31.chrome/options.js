//* ***************************************************************** */
//*                                                                   */
//* IBM Confidential                                                  */
//* OCO Source Materials                                              */
//*                                                                   */
//* (C) Copyright IBM Corp. 2021 - 2023                               */
//*                                                                   */
//* The source code for this program is not published or otherwise    */
//* divested of its trade secrets, irrespective of what has been      */
//* deposited with the U.S. Copyright Office.                         */
//*                                                                   */
//* ***************************************************************** *

import {TEMPLATE_ARRAY_DEFAULT_SIZE,getTemplateMax,key,link1,link2,link3,link4,link5,cpformat1,DEFAULT_SHARED_URL,SHARED_TEMPLATE_FILE,UNIX_PATH_PREFIX,defaultDateFormat} from "./constants.js";
import {setSharedTemplate,isBeImportedTemplates,getSharedTemplate} from "./template-helper.js";
import {setSharedTemplatesSyncInProgress, setSharedTemplatesSyncCompleted} from "./menus.js";
import * as dateHelper from './date-helper.js'; 

async function populateDate()
{
	document.getElementById('dateexample').innerHTML = await dateHelper.replaceDate(0, dateHelper.getValidLocale(document.getElementById("customlocale").value), document.getElementById('customdate').value);
}

function saveOptions(e) {
  e.preventDefault();
  chrome.storage.local.set({
    link1: document.querySelector("#link1").value,
    link2: document.querySelector("#link2").value,
    link3: document.querySelector("#link3").value,
    link4: document.querySelector("#link4").value,
    link5: document.querySelector("#link5").value,
    url1: document.querySelector("#url1").value,
    url2: document.querySelector("#url2").value,
    url3: document.querySelector("#url3").value,
    url4: document.querySelector("#url4").value,
    url5: document.querySelector("#url5").value,
    cpformat1:  document.querySelector("#cpformat1").value,
    sep: document.querySelector("#sep").value,
    owner: document.querySelector("#owner").value,
    team: document.querySelector("#team").value,
    schedule: document.querySelector("#schedule").value,
    altowner: document.querySelector("#altowner").value,
    altteam: document.querySelector("#altteam").value,
    sharedurl: document.querySelector("#sharedurl").value,
    pastetemplatetotextarea: document.querySelector("#pastetemplatetotextarea").checked,
    unixpathprefix: document.querySelector("#unixpathprefix").value,
    customdate: document.querySelector("#customdate").value,
    customlocale: document.querySelector("#customlocale").value,
  });
  
  chrome.contextMenus.update("pastetemplatetotextarea", {
      checked: document.querySelector("#pastetemplatetotextarea").checked
      });
}

function restoreOptions() {
  chrome.storage.local.get({
    link1: link1.name,
    link2: link2.name,
    link3: link3.name,
    link4: link4.name,
    link5: link5.name,
    url1: link1.url,
    url2: link2.url,
    url3: link3.url,
    url4: link4.url,
    url5: link5.url,
    cpformat1: cpformat1,
    sep: key.sep,
    owner: key.owner,
    team: key.team,
    schedule: key.schedule,
    altowner: key.altowner,
    altteam: key.altteam,
    sharedurl: DEFAULT_SHARED_URL,
    pastetemplatetotextarea: false,
    unixpathprefix: UNIX_PATH_PREFIX,
    customdate: defaultDateFormat,
    customlocale: "", //default is blank (use the navigator.language setting), or null, or undefined
  }, function(items) {
    document.getElementById('link1').value = items.link1;
    document.getElementById('link2').value = items.link2;
    document.getElementById('link3').value = items.link3;
    document.getElementById('link4').value = items.link4;
    document.getElementById('link5').value = items.link5;
    document.getElementById('url1').value = items.url1;
    document.getElementById('url2').value = items.url2;
    document.getElementById('url3').value = items.url3;
    document.getElementById('url4').value = items.url4;
    document.getElementById('url5').value = items.url5;
    document.getElementById('cpformat1').value = items.cpformat1;
    document.getElementById('sep').value = items.sep;
    document.getElementById('owner').value = items.owner;
    document.getElementById('team').value = items.team;
    document.getElementById('schedule').value = items.schedule;
    document.getElementById('altowner').value = items.altowner;
    document.getElementById('altteam').value = items.altteam;
    document.getElementById('sharedurl').value = items.sharedurl;
    document.getElementById('pastetemplatetotextarea').checked = items.pastetemplatetotextarea;
    chrome.contextMenus.update("pastetemplatetotextarea", {
        checked: items.pastetemplatetotextarea 
        });
    document.getElementById('unixpathprefix').value = items.unixpathprefix; 
    document.getElementById('customdate').value = items.customdate;
    document.getElementById('customlocale').value = items.customlocale;
    
    
    //Triggers or Events on load go here
    
    //trigger date example (can trigger customlocale event too, but no need as both trigger the same operation)
	document.getElementById("customdate").dispatchEvent(new Event('input'));
	//document.getElementById("customlocale").dispatchEvent(new Event('input')); //Redundant

  });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);

/**
 * Create export All template data and create A link and download it to the browser
 * See actionmenu.js downloadAllSharedTemplates (TODO merge function into one file)
 */
export async function downloadAllSharedTemplates() {
    var template = await getSharedTemplate();
    var data = JSON.stringify(template);
    var type = "application/json";
    var file = new Blob([data], {type: type});
    var exportfile = document.createElement("a");
    var url = URL.createObjectURL(file);
    exportfile.href = url;
    exportfile.download = SHARED_TEMPLATE_FILE;
    document.body.appendChild(exportfile);
    exportfile.click();
    setTimeout(function() {
            document.body.removeChild(exportfile);
            window.URL.revokeObjectURL(url);
            }, 0);
}

/*
 * Event listener to monitor change of file select of import-file
 * File is imported into Shared template
 */
document.getElementById('import-file').addEventListener('change', async (event) => {
        var messageElement=document.getElementById("file-message");
        messageElement.textContent="";

        var importfile = event.target;
        if (importfile.files.length > 0) {
                await setSharedTemplatesSyncInProgress();
                var file = importfile.files[0];
                var reader = new FileReader();
                reader.readAsText(file);
                reader.onload = async function() {

                        try {

                                var temp = JSON.parse(reader.result);
                                if (await isBeImportedTemplates(temp)) {
                                        await setSharedTemplate(temp);
                                        messageElement.textContent="Your shared templates have been imported successfully.";

                                } else {
                                        await setSharedTemplatesSyncCompleted();
                                        messageElement.textContent="Error: Check your JSON file. Array size needs to be " + await getTemplateMax();
                                }

                        }
                        catch (event)
                        {
                                await setSharedTemplatesSyncCompleted();
                                messageElement.textContent="Error: JSON file could not be imported, "+ event;
                        }
                }

        }
});

document.getElementById("export-file").addEventListener('click', (event) => {
	var messageElement=document.getElementById("file-message");
	messageElement.textContent="";
	downloadAllSharedTemplates();
});

//Date Format Preview
document.getElementById("customdate").addEventListener('input', async (event) => {
	await populateDate();
});

document.getElementById("customlocale").addEventListener('input', async (event) => {
	await populateDate();
});
