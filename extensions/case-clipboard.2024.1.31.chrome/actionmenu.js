//* ***************************************************************** */
//*                                                                   */
//* IBM Confidential                                                  */
//* OCO Source Materials                                              */
//*                                                                   */
//* (C) Copyright IBM Corp. 2023                                      */
//*                                                                   */
//* The source code for this program is not published or otherwise    */
//* divested of its trade secrets, irrespective of what has been      */
//* deposited with the U.S. Copyright Office.                         */
//*                                                                   */
//* ***************************************************************** *

import {setTemplateName,getTemplateName,getTemplateNames,setTemplateText,getTemplateText,getAllTemplates,saveAllTemplates,getSharedTemplate} from './template-helper.js';
import {key,link1,link2,link3,link4,link5,cpformat1,DEFAULT_SHARED_TEMPLATE,TEMPLATE_FILE,SHARED_TEMPLATE_FILE} from './constants.js';


/*
 * Open optionpage at a new tab.
 */

function openUrl(url)
{
	if (url !== undefined || url !== null || !url.match(/^[ \t\r\n\f]*$/))
	{
		chrome.tabs.create({url: url});
	}
}

/**
 * Create export All My template data and create A link and download it to the browser
 */
export async function downloadAllTemplates() {
        var template = await getAllTemplates();
        var data = JSON.stringify(template);
        var type = "application/json";
        var file = new Blob([data], {type: type});
        var exportfile = document.createElement("a");
        var url = URL.createObjectURL(file);
        exportfile.href = url;
        exportfile.download = TEMPLATE_FILE;
        document.body.appendChild(exportfile);
        exportfile.click();
        setTimeout(function() {
                document.body.removeChild(exportfile);
                window.URL.revokeObjectURL(url);
                }, 0);
}

/**
 * Create export All template data and create A link and download it to the browser
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

function isChecked(checkbox)
{
	if (checkbox == null)
	{	
		return false; 
	}
	
	// Only look for a checkbox icon to validate
	//if (checkbox.innerHTML.match("☑️"))
	if (checkbox.className.match("menuitemchecked") 
//		|| checkbox.className.match(/^checked$/)
//		|| checkbox.className.match(/^checked /)
//		|| checkbox.className.match(/ checked$/)
//		|| checkbox.className.match(/ checked /)
	)
	{
		return true;
	} 
	//else if (checkbox.innerHTML.match("&#x2611;&#xFE0F;") || checkbox.innerHTML.match("&#x2611;"))
//	{
//		return true;
//	}
	
	return false;
}

function toggleCheckBox(checkbox, value)
{
	if (checkbox == null)
		return;
	
	if (value == true)
	{
		//checkbox.innerHTML = "&#x2611;&#xFE0F;";
		checkbox.className = checkbox.className + " menuitemchecked";
	}
	else
	{
		//checkbox.innerHTML = "&#x1F532;";
		checkbox.className = checkbox.className.replace("menuitemchecked", "").trim();
	}
}

function isDisabled(element)
{
	if (element === undefined || element == null)
	{
		return false;
	}	
	
	if (element.getAttribute("disabled") !== null 
		|| element.className.match("menuitemdisabled")  
		|| element.className.match(/^disabled$/)
		|| element.className.match(/^disabled /)
		|| element.className.match(/ disabled$/)
		|| element.className.match(/ disabled /))
	{
		return true;
	}
	
	return false;
}

//
//Event Listeners
//

var listOfAnchors = document.getElementById("actionmenu").getElementsByClassName("menuitem");

for (let i=0; i<listOfAnchors.length; i++)
{
	listOfAnchors[i].addEventListener('click', (event) => {
		
		if (event.currentTarget === undefined 
			|| event.currentTarget === null 
			|| event.currentTarget.tagName === "LABEL" 
			|| event.currentTarget.getAttribute("href") === null 
			|| event.currentTarget.getAttribute("href").match(/^[ \t\r\n\f]*$/))
		{
			return;	
		}
		
		event.preventDefault();
		
		if (!isDisabled(event.currentTarget))
		{
			openUrl(event.currentTarget.getAttribute("href"));
			window.close();
		}
	});
	
	listOfAnchors[i].addEventListener('keydown', (event) => {
		
		if (event.key === "Enter" || event.key === " ")
		{
			event.currentTarget.dispatchEvent(new Event('click', event));	
		}
		else if (event.key === "Escape")
		{
			window.close();
		}
		else if (event.key === "ArrowDown" || event.key === "ArrowUp")
		{
				//Currently doesn't take into account disabled elements (or elements with tabindex="-1").
			let listOfMenuitems = document.getElementById("actionmenu").getElementsByClassName("menuitem");
			
			//determine current reference
			let id = -1;
			
			for (i=0; i<listOfMenuitems.length; i++)
			{
				if (listOfMenuitems[i].isSameNode(event.currentTarget))
				{
					id = i;
				}
			}
			
			if (id === null || id == -1)
			{
				return;
			}
			
			if (event.key === "ArrowDown")
			{
				//Currently doesn't take into account disabled elements (or elements with tabindex="-1").
				
				if (id + 1 >= listOfMenuitems.length)
				{
					listOfMenuitems[0].focus();
				}	
				else
				{
					listOfMenuitems[id+1].focus();
				}
			}
			else if (event.key === "ArrowUp")
			{
				//Currently doesn't take into account disabled elements (or elements with tabindex="-1").
				
				if (id - 1 < 0)
				{
					listOfMenuitems[listOfMenuitems.length - 1].focus();
				}	
				else
				{
					listOfMenuitems[id-1].focus();
				}	
			}
		}
	});
	
	if (isDisabled(listOfAnchors[i]))
	{
		listOfAnchors[i].setAttribute("tabindex", "-1");
		
//		if (listOfAnchors[i].getAttribute("href") !== null)
//		{
//			listOfAnchors[i].setAttribute("href", "");
//		}
	}
	
}

document.getElementById("export-file-sharedtemplate").addEventListener('click', async (event) => {
	await downloadAllSharedTemplates();
//	window.close();  // NEED TO KEEP OPEN TO COMPLETE DOWNLOAD
});

document.getElementById("export-file-mytemplate").addEventListener('click', async (event) => {
	await downloadAllTemplates();
//	window.close();  // NEED TO KEEP OPEN TO COMPLETE DOWNLOAD
});

document.getElementById("pastetemplatetotextarea").addEventListener('click', async (event) => {
	let element = document.getElementById("pastetemplatetotextarea");
	let value = isChecked(element);
	
	await chrome.storage.local.set({pastetemplatetotextarea: !value});
	toggleCheckBox(element, !value);
	
	//Update the context menu (in case it is not automatically reflected)
    chrome.contextMenus.update("pastetemplatetotextarea", {
        checked: !value
        });

	
});

document.addEventListener("DOMContentLoaded", async (event) => {
	//Cycle through the check / option selections to populate the correct values before the page loads
	
	let pastetemplatetotextareaelement = document.getElementById("pastetemplatetotextarea");
	let getpastetemplatetotextarea = chrome.storage.local.get("pastetemplatetotextarea", function (value) {
    	if (typeof value.pastetemplatetotextarea !== 'undefined') {
    		toggleCheckBox(pastetemplatetotextareaelement, value.pastetemplatetotextarea);
    	}
    	
    });
    
    //Doesn't currently take into account disabled elements
    document.getElementById("actionmenu").firstElementChild.focus();
	
	
});
