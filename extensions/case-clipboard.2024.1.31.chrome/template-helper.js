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

import {copyToClipboard} from './clipboard-helper.js';
import {templateMax,getTemplateMax,DEFAULT_MY_TEMPLATE,DEFAULT_SHARED_URL,DEFAULT_SHARED_TEMPLATE} from './constants.js';
import {setSharedTemplatesSyncInProgress, setSharedTemplatesSyncCompleted, setMyTemplatesSyncInProgress, setMyTemplatesSyncCompleted} from './menus.js';

var template = JSON.parse(atob(DEFAULT_MY_TEMPLATE));
while (template.length < templateMax) {
    var templateObj = new Object();
    templateObj.title = "New Template";
    templateObj.cliptext = "";
    templateObj.type = "TEMPLATE";
    templateObj.parentId = "mytemplate";
    template.push(templateObj);
}

/**
 * Constructs a default template array (blank entries) up to the template max.
 */
async function constructDefaultTemplateArray()
{

	const construct = async () => {
		return new Promise((resolve) => {
			
			var templateArray = JSON.parse(atob(DEFAULT_MY_TEMPLATE));
			var title = "New Template";
			for (let i = 0; i< templateMax;i++)
			{
				if (i >= templateArray.length) //but less than templateMax
				{
					templateArray[i].push(generateBlankTemplate());  //Generate a blank template to expand the array if it's not large enough for the current maximum.
					continue;
				}
				
				if (templateArray[i].title == null || templateArray[i].title === undefined || templateArray[i].title == "" || templateArray[i].title.match(/^[ \t\r\n\f]*$/))
				{
					templateArray[i].title = "New Template";
				}
				
				if (templateArray[i].cliptext == null || templateArray[i].cliptext === undefined)
				{
					templateArray[i].clipttext = "";
				}
				
				if (templateArray[i].type == null || templateArray[i].type === undefined || templateArray[i].type === "")
				{
					templateArray[i].type = "TEMPLATE";
				}
				
				if (templateArray[i].parentId == null || templateArray[i].parentId === undefined || templateArray[i].parentId === "" || !templateArray[i].parentId.match(/^mytemplate-[0-9]*$/))
				{
					templateArray[i].type = "mytemplate";
				}
			
			}
	
			resolve(templateArray);
		}
	)};
	        
	return await construct();
   
}     


/**
 * This variable is used for the semaphore when performing certain operations to edit the template list
 * It's primarially used to prevent multiple button presses
 */
var mytemplateBusy = false;

/**
 * Function to enable the semaphore variable
 */
export async function mytemplateObtainSemaphore()
{
	mytemplateBusy = true;
}

/**
 * Function to release (disable) the semaphore variable
 */
export async function mytemplateReleaseSemaphore()
{
	mytemplateBusy = false;
}

/**
 * Function to retrieve the semaphore variable asynchronously
 */
export async function mytemplateStatusSemaphore()
{
	return mytemplateBusy;
}

/**
 * Asynchronous function to set only the template title
 * @param id The ID of the specific template to read from in chrome.storage.local
 * @param title The title to give the template.  The title cannot be a blank string and will be reset to the name "New Template" if that happens.  
 */
export async function setTemplateName(id, title) 
{
	//If the title is an empty string or just space or other related characters, set the template title to New Template
	//This avoids an issue on Chrome where the Templates Menu doesn't reload.  This is not an issue on Firefox but the code can remain for both
    if (title === null || title === undefined || title === "" || title.match(/^[ \t\r\n\f]*$/)) 
	{
		await chrome.storage.local.set({['template_title'+id]:"New Template"});
	}
	else
	{
		await chrome.storage.local.set({['template_title'+id]:title});
	}
}

/**
 * Asynchronous function to return the template title for a specific template ID
 * @param id The ID of the specific template to read from in chrome.storage.local
 * @returns The template title for the specific template ID
 */
export async function getTemplateName(id)
{

        const read = async (id) => {
              return new Promise((resolve) => {
                  chrome.storage.local.get({['template_title'+id]: template[id].title }, function(items)
        {
              for (const [key, value] of Object.entries(items)) {
                  if (key.startsWith('template_title')) {
                     resolve(items[key]);
                  }
              }
        });
        }
        )};

        const templateTitle = await read(id);
        return templateTitle;
}

/**
 * Asynchronous function to retrieve the template titles from chrome.storage.local and return a list of titles
 * @returns The list of titles from storage
 */
export async function getTemplateNames()
{
  var templateList=[];
	for(let id=0; id<await getTemplateMax(); id++)
	{
		templateList[id] = await getTemplateName(id);
	}
	return templateList;
}

/**
 * Function to return the template type, as it could be stored as a template, a separator, or a submenu.  
 * The type is not the same as the menuitem type
 * TEMPLATE type is the menuitem type "normal"
 * SEPARATOR type is the menuitem type "separator"
 * SUBMENU type is the menuitem type "normal"
 * @param id The template Id to look up
 * @returns The template type of TEMPLATE, SEPARATOR, or SUBMENU
 */
export async function getTemplateType(id)
{
    const read = async (id) => {
        return new Promise((resolve) => {
        	
            chrome.storage.local.get({['template_type'+id]: template[id].type}, function(items)
			  {
				  if (Object.keys(items).length === 0 && items.constructor === Object)
				  {
					  resolve(undefined);
				  }
			        for (const [key, value] of Object.entries(items)) {
			            if (key.startsWith('template_type')) {
			               resolve(items[key]);
			            }
			        }
		});
        }
        )};

  const templateType = await read(id);
  if (templateType == null || templateType == undefined || templateType === "")
	 {
	  return "TEMPLATE";
	 }
	 else if (templateType === "SUBMENU" || templateType === "SEPARATOR")
	 {
		 
	 }
	 else
	 {
		 return "TEMPLATE";
	 }
  
  /*
   * TEMPLATE (or undefined) represents a template
   */
  return templateType;

}


/**
 * Function to set the template type for a specific ID.  
 * @param id The template Id to look up in chrome.storage.local
 * @param templateType (optional) The template type (TEMPLATE, SEPARATOR, or SUBMENU).  TEMPLATE is the default.
 */
export async function setTemplateType(id, templateType)
{

  if (templateType == null || templateType == undefined || templateType === "" || templateType === "TEMPLATE")
	 {
	  	await chrome.storage.local.set({['template_type'+id]:"TEMPLATE"});
	 }
  else if (templateType === "SUBMENU" || templateType === "SEPARATOR")
	  {
	  	await chrome.storage.local.set({['template_type'+id]:templateType});
	  }
	  else
	  {
		await chrome.storage.local.set({['template_type'+id]:"TEMPLATE"});
	  }
}

/**
 * Function to return the template's parentId (represents the submenu that the template belongs to).  By default it should be "mytemplate" for My Templates.
 * @param id The ID of the specific template to read from in chrome.storage.local
 * @returns The name of the parentId for the submenu.  This does not validate if the parentId actually exists.  
 */
export async function getTemplateParentId(id)
{
    const read = async (id) => {
        return new Promise((resolve) => {
        	
            chrome.storage.local.get({['template_parentId'+id]: template[id].parentId}, function(items)
			  {
				  if (Object.keys(items).length === 0 && items.constructor === Object)
				  {
					  resolve(undefined);
				  }
			        for (const [key, value] of Object.entries(items)) {
			            if (key.startsWith('template_parentId')) {
			               resolve(items[key]);
			            }
			        }
			  });
			  }
			  )};

  const templateParentId = await read(id);
  
  if (templateParentId == null || templateParentId == undefined || templateParentId === "")
	 {
	  return "mytemplate";
	 }
 
  return templateParentId;

}

/**
 * Obtains the name of the submenu.  Literally this is just "mytemplate-"+id.
 * We only support one submenu layer, not multiple.
 * This currenly does a check to see if we are beyond the maximum size, but this will be removed as this is not an asyncronous function.
 * @param submenuId The ID of the submenu location
 * @param useSharedTemplates (optional) Boolean if you want to return the submenu name of a shared templates instead.  
 * @return "mytemplate-"+ID 
 */
export function getSubmenuName(submenuId, useSharedTemplates)
{	
	if (useSharedTemplates == null || useSharedTemplates === undefined || useSharedTemplates === false)
	{
		return "mytemplate-"+submenuId;
	}
	else if (useSharedTemplates === true)
	{
		return "sharedtemplate-"+submenuId;
	}
	else
	{
		return "mytemplate-"+submenuId;
	}
}

/**
 * Function to generate the submenuID from a parentId (a parentId is a string that identifies which submenu a menuitem belongs to)
 * @param parentId A string that identifes which submenu a template belongs to.  Only mytemplate-## or sharedtemplate-##
 * @return pulls the integer from the parentId, otherwise return -1 on error. 
 */
export function getSubmenuId(parentId)
{
	if (parentId == null || parentId === undefined)
	{
		return -1;
	}
	
	if (parentId.match(/^mytemplate-[0-9]*$/))
	{
		return Number(parentId.replace("mytemplate-",""));
	}
	else if (parentId.match(/^sharedtemplate-[0-9]*$/))
	{
		return Number(parentId.replace("sharedtemplate-",""));
	}
	else
	{
		return -1;
	}
}

/**
 * Function to set the template type for a specific ID.  
 * @param id The template Id to look up
 * @param templateParentId (optional) The parentId of the template (which submenu it belongs to)
 * @returns The template type or undefined (treat undefined as a template)
 */
export async function setTemplateParentId(id, templateParentId)
{

  if (templateParentId == null || templateParentId === undefined || templateParentId === "" || templateParentId === "mytemplate")
	 {
	  	await chrome.storage.local.set({['template_parentId'+id]:"mytemplate"});
	 }
  else
	  {
	  	await chrome.storage.local.set({['template_parentId'+id]:templateParentId});
	  }
}

/**
 * Function to validate if a submenu currently exists
 * @param parentId The string representing the submenu name (i.e. the menu ID)
 * @returns true if the template represented by the parentId.
 * On failure (or if parentId is equivalent to "mytemplate"), returns false
 */
export async function isValidSubmenu(parentId) /* doesSubmenuExist(parentId) */
{
	if (parentId == null || parentId == undefined || parentId === "" || parentId === "mytemplate")    //trivial case, the submenu doens't exist because it's the parent My Templates menu.
	{
		return false;
	}
	
	if (!parentId.match(/^mytemplate-[0-9]*$/))
	{
		return false;
	}
	
	//Convert to a submenuId number
	var submenuId = getSubmenuId(parentId);
		
		
	if (await isSubmenu(submenuId))
	{
		return true;
	}
	
	return false;
}

/**
 * Determine if a specific template ID is actually a submenu
 * @param id The id of the submenu to check for
 * @return true if a submenu is in the id's location in template array, false if not (or beyond the range)
 */
export async function isSubmenu(id)
{
	if (id < 0 || id >= await getTemplateMax())
	{
		return false;
	}
	
	return (await getTemplateType(id) === "SUBMENU");
}


/**
 * Asynchronous function to set the template text
 * @param id The id of the template
 * @param text The text of the template to store in chrome.storage.local.  If the text is just blank space characters, it will be truncated to a null string.
 */
export async function setTemplateText(id, text)
{
	if (text == null || text === undefined || text.match(/^[ \t\r\n\f]*$/))
	{
        await chrome.storage.local.set({['template_text'+id]:""});
	}
	else 
    {
        await chrome.storage.local.set({['template_text'+id]:text});
	}
}

/**
 * Asynchronous function to return the template text for a specific template ID
 * @param id The ID of the specific template to read from in chrome.storage.local
 * @returns The template text for the specific template ID
 */
export async function getTemplateText(id)
{
        const read = async (id) => {
              return new Promise((resolve) => {
                  chrome.storage.local.get({['template_text'+id]: template[id].cliptext }, function(items)
        {
              for (const [key, value] of Object.entries(items)) {
                  if (key.startsWith('template_text')) {
                     resolve(items[key]);
                  }
              }
        });
        }
        )};

        var templateText = await read(id);
        return templateText;
}

/**
 * Asynchronous function to set shared templates
 */
export async function setSharedTemplate(sharedtemplate) 
{
        /*
         * If imported array's size is smaller than getTemplateMax(), the rest entries will be "New Template"
         */
        var max = await getTemplateMax();
        while (sharedtemplate.length < max) {
                var templateObj = new Object();
                templateObj.title = "New Template";
                templateObj.cliptext = "";
                //templateObj.type = "TEMPLATE";
                //tempalteObj.parentId = "mytemplate";
          
                sharedtemplate.push(templateObj)
        }
        if (!(await isSharedTemplatesUpdated(sharedtemplate))) {
                await setSharedTemplatesSyncCompleted();
        } else {
                await chrome.storage.local.set({['sharedtemplate']: sharedtemplate});
        }
}

/**
 * Compare JSON object
 */
function objectSort(obj){
        const sorted = Object.entries(obj).sort();
        for(let i in sorted){
                const val = sorted[i][1];
                if(typeof val === "object"){
                        sorted[i][1] = objectSort(val);
                }
        }
        return sorted;
}

/**
 * Function to return the shared templates array from chrome.storage.local
 * @return Object array of shared templates
 */
export async function getSharedTemplate()
{
        const read = async () => {
              return new Promise((resolve) => {
                  chrome.storage.local.get({['sharedtemplate']: JSON.parse(atob(DEFAULT_SHARED_TEMPLATE))}, function(items)
        {
              for (const [key, value] of Object.entries(items)) {
                  if (key.startsWith('sharedtemplate')) {
                     resolve(items[key]);
                  }
              }
        });
        }
        )};

	var sharedtemplate = await read();
	return sharedtemplate;
}

/**
 * Get Shared Templates from github pages URL.
 * Sample web site is https://pages.github.ibm.com/KENOI/case-clipboard-template/sharedtemplates.json
 * If URL does not start with https:// or http://, this function will stop to get data from URL.
 * @param isInit boolean to indicate if we are generating this from first install / startup.
 */
export async function getSharedTemplatesFromURL(isInit) {
        if(!isInit) {
                await setSharedTemplatesSyncInProgress();
        }
	var url = await getSharedURL(); 
	var isSync = false;
	if (url.startsWith("https://") || url.startsWith("http://")) {
		await fetch(url, {
			method: 'get',
			cache: "no-store",
                        credentials: 'include',
		})
		.then(response => response.json())
		.then(async function (data) {
			if (await isBeImportedTemplates(data)) {
                                if((await isSharedTemplatesUpdated(data))) {
                                        if(isInit) {
                                                await setSharedTemplatesSyncInProgress();
                                                await new Promise(resolve => setTimeout(resolve, 100));
                                        }
                                        console.log('getSharedTemplatesFromURL: Request succeeded with JSON response', data);
                                        await setSharedTemplate(data);
                                } else {
                                        await setSharedTemplatesSyncCompleted();
                                }
                                isSync = true;
			}
		})
		.catch(async function (error) {
			if(!isInit) {
				await openSharedURL();
			}
			console.log('Request failed', error);
		});
	} else {
		console.log("Shared Templates URL does not start with 'http'");
	}
        if(!isSync) {
                await setSharedTemplatesSyncCompleted();
        }
	return isSync;
}

/**
 * Open shared templates URL at a new tab.  This is called when manually synchronizing the shared templates does not work
 */
async function openSharedURL() {
        var url = await getSharedURL();
        chrome.tabs.create({url: url});
}

/**
 * Gets the shared templates URL from chrome.storage.local
 * @return String representing the URL stored in chrome.storage.local
 */
export async function getSharedURL() 
{
        const read = async () => {
              return new Promise((resolve) => {
                  chrome.storage.local.get({['sharedurl']: DEFAULT_SHARED_URL}, function(items)
        {
              for (const [key, value] of Object.entries(items)) {
                  if (key.startsWith('sharedurl')) {
                     resolve(items[key]);
                  }
              }
        });
        }
        )};

        var sharedurl = await read();
        return sharedurl;
}

/**
 * Asynchronous function to return all my templates' title and text as an array.
 * @return Object array of all My Templates (JSON objects) 
 */
export async function getAllTemplates() 
{
        var mytemplate = [];
        let max = await getLastNonBlankTemplateId() + 1;
        for (let id=0; id<max; id++) {
				
				var templateObj = await getTemplate(id);
				mytemplate[id] = templateObj;
				
				//Previous code that called each method individually, now getTemplate() calls chrome.storage.local once for all properties
                /*var templateObj = new Object();
                templateObj.title = await getTemplateName(id);
                templateObj.cliptext = await getTemplateText(id);
                templateObj.type = await getTemplateType(id);
                templateObj.parentId = await getTemplateParentId(id);
                mytemplate[id] = templateObj;
                */
        }
	return mytemplate;
}

/**
 * Function to import My Templates from JSON data (usually from a file)
 * @param page JSON data set to parse
 */
export async function importTemplates(page) {
   await setMyTemplatesSyncInProgress();
   var temp = []
   if (typeof page.cliptext !== 'undefined') {
    // for chrome
    temp = JSON.parse(page.cliptext);
  } else {
    // for firefox
    await navigator.clipboard.readText().then(function(data){
      temp = JSON.parse(data);
    });
  }
  await saveAllTemplates(temp);
  await new Promise(resolve => setTimeout(resolve, 100));
  await setMyTemplatesSyncCompleted();
}

/**
 * Function to import shared templates from clipboard
 */
export async function importSharedTemplatesClipboard(page) {
   await setSharedTemplatesSyncInProgress();
   var temp = []
   if (typeof page.cliptext !== 'undefined') {
    // for chrome
    temp = JSON.parse(page.cliptext);
   } else {
    // for firefox
    await navigator.clipboard.readText().then(function(data){
      temp = JSON.parse(data);
     });
   }
   await setSharedTemplate(temp);
}

/**
 * Function to export my/shared templates to clipboard in JSON format
 * @param tab The current tab
 * @param template The template array to export to the clipboard in JSON format
 */
export function exportTemplatesClipboard(tab, template) {
  copyToClipboard(tab, JSON.stringify(template));
  console.log(template);
}

/**
 * Function to check if Shared Templates are updated.
 * @param data JSON data
 */
export async function isSharedTemplatesUpdated(data) {
        var obj = await getSharedTemplate();
        var temp = JSON.stringify(objectSort(obj));
        var max = await getTemplateMax();
        while (data.length < max) {
                var templateObj = new Object();
                templateObj.title = "New Template";
                templateObj.cliptext = "";
                data.push(templateObj);
        }
        var shared = JSON.stringify(objectSort(data));
        if (temp === shared) {
                return false;
        } else {
                console.log("isSharedTemplatesUpdated: true");
                return true;
        }
}

/**
 * Function to help with importing templates
 * @param temp 
 */
export async function isBeImportedTemplates(temp)
{
        var max = await getTemplateMax();
	if (Array.isArray(temp)) {
		if (temp.length <= max) {
			return true;
		} 
	} 
	return false;
}

/**
 * Function to save all templates (My Templates) to chrome.storage.local.  
 * //TODO Further checks needed for data entry checking on title, cliptext, type, and parentId (although parentId will be checked in a separate method afterwards)
 * @param temp
 */
export async function saveAllTemplates(temp) {
  
  /*
   * templateMax might be better than getTemplateMax() to clear all data in storage.
   */	
  var max = await getTemplateMax();
  var error = "";
	
  if (Array.isArray(temp)) {
    if (temp.length <= max) {
      // Check data format
      var cont = 'true';
      while (temp.length < max) {
        var templateObj = new Object();
        templateObj.title = "New Template";
        templateObj.cliptext = "";
        templateObj.type = "TEMPLATE";
        templateObj.parentId = "mytemplate";

        temp.push(templateObj);
      }
      for(let id=0; id<max; id++) {
        if (temp[id].title === undefined) {
          cont = 'false';
          console.log("array[" + id + "].title data is not defined/valid");
        }
        if (temp[id].cliptext === undefined) {
          cont = 'false';
          console.log("array[" + id + "].cliptext data is not defined/valid");
        }
      //Type can be undefined in older versions of the JSON file, we don't throw an error but set this to "TEMPLATE"
        if (temp[id].type === undefined || temp[id].type == null || temp[id] === "") {  
        	temp[id].type = "TEMPLATE";
        }
        
      //The parentId may be unset in older versions of the JSON data file, we don't throw an error but set this to "mytemplate"
        if (temp[id].parentId === undefined || temp[id].parentId == null || temp[id].parentId === "") { 
        	temp[id].parentId = "mytemplate";
        }
      }
      if(cont == 'true') {
        for(let id=0; id<max; id++) {
          await chrome.storage.local.set({['template_title'+id]:temp[id].title, ['template_text'+id]:temp[id].cliptext, ['template_type'+id]:temp[id].type, ['template_parentId'+id]:temp[id].parentId,});

        }
      } else {
        error="Import data array[].title or array[].cliptext is not defined in the array. Check console log for detail";
      }
    } else {
    	error="Import data array length is not " + max;
      console.log(error);

    }
    console.log("*** Imported(Tried to import if it failed) data are follows ***");
    console.log(temp);
  } else {
    error="Import data is not an array";
    console.log(error);
  }
  
  return error;
}

/**
 * Function to scan for a list of TEMPLATE entries that share a submenu name (mytemplate-id)
 * @submenuId String of "mytemplate-##" to search for
 * @return An array of indexes
 */
export async function getAllSubmenuElements(submenuId)
{
	let indexes = [];
	let max = await getTemplateMax();
	for (let i = 0; i < max; i++)
	{
		let object = await getTemplate(i);
		
		var submenuName = getSubmenuName(submenuId);
		
		if ((object.type === "TEMPLATE" || object.type === "SEPARATOR") && object.parentId === submenuName)
		{
			indexes.push(i);
		}
	}
	
	return indexes;
}

/**
 * Function to move a template up EXACTLY one position in the template array (and realign submenus accordingly)
 * @param id The template ID to move up
 */
export async function moveSelectionUp(id)
{
	//if at top of submenu also return, or code it to move the element out of the submenu and up one more.  
	if (id <= 0)
		{
			return;
		}
		
		//Store the two templates we are swapping in buffer
		let entryBefore = await getTemplate(id-1);
		let entryCurrent = await getTemplate(id);
		
		//Set the current entry in the position above
		await setEntry(id-1, entryCurrent);

		//Set the template above in the position at the current id
		await setEntry(id, entryBefore);
		
		//If we moved a submenu, we need to realign the parentId located in other templates
		//We scan for an array of elements with the name "mytemplate-"+id (and "mytemplate-"+id-1)
		let listCurrentSubmenu = [];
		let listBeforeSubmenu = [];
		
		if (entryCurrent.type === "SUBMENU")
		{
			listCurrentSubmenu = await getAllSubmenuElements(id);
		}
		
		if (entryBefore.type === "SUBMENU")
		{
			listBeforeSubmenu = await getAllSubmenuElements(id-1);
		}
		
		//Using the lists we swap out the submenu name if it was a submenu
		if (entryCurrent.type === "SUBMENU")
		{
			for (let i=0;i<listCurrentSubmenu.length;i++)
			{
				await setTemplateParentId(listCurrentSubmenu[i], getSubmenuName(id-1));
			}
		}
		
		if (entryBefore.type === "SUBMENU")
		{
			for (let i=0;i<listBeforeSubmenu.length;i++)
			{
				await setTemplateParentId(listBeforeSubmenu[i], getSubmenuName(id));
			}
		}
		
			
}

/**
 * Function to move templates up, but this also checks if there is a block we need to move through, like a submenu.
 * @param id The template id that we would like to move up.  
 * @return The new position of the current template that has been moved up.
 */
export async function moveUp(id)
{
	let max = await getTemplateMax();
	if (id <= 0  || id > max)
	{
		return;
	}
	
	let templateCurrent = await getTemplate(id);
	let templateBefore = await getTemplate(id-1);
	let upwardLength = 0;
	let downwardLength = 0;
	let reverseDirection = false;
	let newFocusId=id;
	
	//Determine block to move up
	if (templateCurrent.parentId === "mytemplate")
	{
		//If it's a submenu, we need to move the ENTIRE submenu up one
		if (templateCurrent.type === "SUBMENU") 
		{
			//Remember we need to move all submenu elements up with this... technically we should be moving the entry above down the length of the current submenu... but if that's also a submenu we can't shortcut
			upwardLength = await getSubmenuBlockLengthUpwards(id, false);
			downwardLength = await getSubmenuBlockLengthDownwards(id);
			
			if (upwardLength < downwardLength && upwardLength != 0)  //Can we save compute cycles by moving down the entries above instead of moving all of the entires up?
			{
//				reverseDirection = true;  //TODO
			}

		}
		else
		{
			upwardLength = await getSubmenuBlockLengthUpwards(id, false);  //Theoretically this should be a length of 1, unless there's a block of disconnected submenu items
		}
	}
	else
	{
		if (templateCurrent.parentId === templateBefore.parentId) //If the adjacent element we are moving up through is part of the same submenu, we are only moving up 1
		{
			if (await getSubmenuBlockLengthUpwards(id, false) >= 1)  // this method returns 1 if the adjacent element is a submenu header, and 0 if the id is less than or equal to 0
			{
				upwardLength = 1;  //Move only one, as we don't want to move through the submenu block or disconnected block we belong to.
			}
			else
			{
				upwardLength = 0;  //Don't move as we are at the top of a submenu (or at the top of the array in a disconnected submenu item block)  
			}
		}
		else if (templateBefore.type === "SUBMENU")
		{
			if (templateCurrent.parentId === getSubmenuName(id-1))  //check if a submenu is immediately above us (and we are a submenuitem).
			{
				upwardLength = 0;
			}
			else
			{
				upwardLength = 1; //await getSubmenuBlockLengthUpwards(id, false);  //This should be 1
			}
			
		}
		//If the templateBefore is not from the same submenu, or is part of "mytemplate", calculate the upward length, which should include the submenu header if present.
		//If "mytemplate" is found (incuding if it's just a submenu header), the length from this method should return 1	
		else
		{
			upwardLength = await getSubmenuBlockLengthUpwards(id, false); // 

		}
	}	
	//Is the current ID we are moving up part of a submenu, and are we in that submenu block

	if (id-upwardLength < 0 || id+downwardLength-1 >= max)
	{
		return newFocusId;
	}
	//Now we are ready to move the template.  
	
	//TODO Can we shortcut the move?  Only if the element(s) above represent a smaller set to move down
	if (templateCurrent.type === "SUBMENU" && reverseDirection === true)
	{
		for (let index = id-upwardLength;index<id;index++)
		{
			for (let i = 0;i<downwardLength;i++)
			{
				await moveSelectionDown(id-upwardLength+i);
			}
		}
		newFocusId = newFocusId - upwardLength;
	}
	else
	{
		if (templateCurrent.type === "SUBMENU")
		{
			for (let index = id;index<id+downwardLength;index++)
			{
				for (let i = 0;i<upwardLength;i++)
				{
					await moveSelectionUp(index-i);
				}
			}
			newFocusId = newFocusId - upwardLength;
		}
		else
		{
			//perform a normal move, although loop if we need to go through a submenu or a block of detatched submenu items.  
			for (let index = id; index>id-upwardLength; index--)
			{
					await moveSelectionUp(index);
			}
			newFocusId = newFocusId - upwardLength;
		}
	}
		
	return newFocusId;
}

/**
 * Function to move templates down, but this also checks if there is a block we need to move through, like a submenu.
 * @param id The template id that we would like to move down.  
 * @return The new position of the current template that has been moved down.
 */
export async function moveDown(id)
{
	let max = await getTemplateMax();
	if (id < 0 || id >= max-1)
	{
		return id;
	}
	
	let templateCurrent = await getTemplate(id);
	let templateAfter = await getTemplate(id+1);
	let subsequentDownwardLength = 0;
	let downwardLength = await getSubmenuBlockLengthDownwards(id);
	let reverseDirection = false;
	let newFocusId=id;
	
	//Determine block to move down //TODO
	if (templateCurrent.parentId === "mytemplate")
	{
		//If it's a submenu, we need to move the ENTIRE submenu up one
		if (templateCurrent.type === "SUBMENU") 
		{
			//Remember we need to move all submenu elements up with this... technically we should be moving the entry above up the length of the current submenu... but if that's also a submenu we can't shortcut
			//downwardLength = await getSubmenuBlockLengthDownwards(id+1);
			subsequentDownwardLength = await getSubmenuBlockLengthDownwards(id+downwardLength);

			
			if (subsequentDownwardLength < downwardLength && subsequentDownwardLength != 0)  //Can we save compute cycles by moving down the entries above instead of moving all of the entires down?
			{
				reverseDirection = true;
			}

		}
		else
		{
			subsequentDownwardLength = await getSubmenuBlockLengthDownwards(id+1);
			
		}
	}
	else
	{
		if (templateCurrent.parentId === templateAfter.parentId) //If the adjacent element we are moving down through is part of the same submenu, we are only moving down 1
		{
			if (await getSubmenuBlockLengthDownwards(id+downwardLength-1) >= 1)  // this method returns 1 if the adjacent element is a submenu header, and 0 if the id is less than or equal to 0
			{
				subsequentDownwardLength = 1;  //Move only one, as we don't want to move through the submenu block or disconnected block we belong to.
			}
			else
			{
				subsequentDownwardLength = 0;  //Don't move as we are at the bottom of a submenu (or at the bottom of the array in a disconnected submenu item block)  
			}
		}
		else 
		//If the templateAfter is not from the same submenu, or is part of "mytemplate", calculate the subsequent downward length.  
		//If "mytemplate" is found (incuding if it's just a submenu header), the length from this method should return 1	
		{
			
			//LOGIC TO DETERMINE IF TEMPLATE IS PART OF A SUBMENU
			let upwardLength = 0;
			let submenuLength = await getSubmenuLengthByName(templateCurrent.parentId);
			
			if (submenuLength != 0)
			{
				subsequentDownwardLength = await getSubmenuBlockLengthDownwards(id+1);
				
				for (let i = 0; i < submenuLength+1 && id-i >= 0; i++)
				{
					if (templateCurrent.parentId === getSubmenuName(id-i))
					{
						subsequentDownwardLength = 0;
						break;
					}
					
					if (await getTemplateParentId(id-i) === templateCurrent.parentId)
					{
						//continue;
					}
					else
					{
						break;
					}
				}
			}
			else
			{
				subsequentDownwardLength = await getSubmenuBlockLengthDownwards(id+1); // 
			}
		}	
	}	
	//Is the current ID we are moving up part of a submenu, and are we in that submenu block

	if (id+downwardLength-1+subsequentDownwardLength-1 >= max)
	{
		return newFocusId;
	}
	
	//Now we are ready to move the menu.  
	
	//Can we shortcut the move?  Only if the element(s) above represent a smaller set to move up
	if (templateCurrent.type === "SUBMENU" && reverseDirection === true)
	{
		for (let index = id+downwardLength;index<id+downwardLength+subsequentDownwardLength;index++)
		{
			for (let i = 0;i<downwardLength;i++)
			{
				await moveSelectionUp(index-i);
			}
		}
		newFocusId = newFocusId + subsequentDownwardLength;
	}
	else
	{
		if (templateCurrent.type === "SUBMENU")  //Move a submenu block
		{
			for (let index = id;index<id+downwardLength;index++)
			{
				for (let i = 0;i<downwardLength+subsequentDownwardLength-1;i++)
				{
					await moveSelectionDown(id+i);
				}
			}
			newFocusId = newFocusId + subsequentDownwardLength;
		}
		else
		{
			//perform a normal move, although loop if we need to go through a submenu or a block of detatched submenu items.  
			for (let index = id; index<id+subsequentDownwardLength; index++)
			{
					await moveSelectionDown(index);
			}
			newFocusId = newFocusId + subsequentDownwardLength;
		}
	}
	
	return newFocusId;
}

/**
 * Function to move a template down EXACTLY one position in the template array (and realign submenus accordingly)
 * @param id The template ID to move down
 */
export async function moveSelectionDown(id)
{
	
	//Don't do anything if at top
	//if at top of submenu also return, or code it to move the element out of the submenu and up one more.  
	if (id >= await getTemplateMax() - 1)
		{
			return;
		}

		//Store the two templates we are swapping in buffer
		let entryCurrent = await getTemplate(id);
		let entryAfter = await getTemplate(id+1);
	
		//Swap the current template with the one just below
		await setEntry(id+1, entryCurrent);
					
		//Swap the template after into the current position represented by id
		await setEntry(id, entryAfter);
		
		//If we moved a submenu, we need to realign the parentId located in other templates
		//We scan for an array of elements with the name "mytemplate-"+id (and "mytemplate-"+id-1)
		let listCurrentSubmenu = [];
		let listAfterSubmenu = [];
		
		if (entryCurrent.type === "SUBMENU")
		{
			listCurrentSubmenu = await getAllSubmenuElements(id);
		}
		
		if (entryAfter.type === "SUBMENU")
		{
			listAfterSubmenu = await getAllSubmenuElements(id+1);
		}
		
		//Using the lists we swap out the submenu name if it was a submenu
		if (entryCurrent.type === "SUBMENU")
		{
			for (let i=0;i<listCurrentSubmenu.length;i++)
			{
				await setTemplateParentId(listCurrentSubmenu[i], getSubmenuName(id+1));
			}
		}
		
		if (entryAfter.type === "SUBMENU")
		{
			for (let i=0;i<listAfterSubmenu.length;i++)
			{
				await setTemplateParentId(listAfterSubmenu[i], getSubmenuName(id));
			}
		}
}

/**
 * Function to move a single template to the top
 * This function doesn't move a group of templates (i.e. a submenu) to the top
 * @deprecated
 * @param id The template ID to move to the top
 */
export async function moveSelectionTop(id)
{
	//Don't do anything if at top
	//if at top of submenu also return, or code it to move the element out of the submenu and up one more.  
	if (id <= 0)
		{
			return;
		}
	//Enable Semaphore????????
	
	for (var i=id;i>0;i--)
	{
		await moveSelectionUp(i);
	}
}

/**
 * Function to move a single template to the bottom (whatever the current maximum size is in the Options)
 * This function doesn't move a group of templates (i.e. a submenu) to the bottom
 * @deprecated
 * @param id The template ID to move to the bottom
 */
export async function moveSelectionEnd(id)
{
	//Don't do anything if at top
	//if at top of submenu also return, or code it to move the element out of the submenu and up one more.  
	if (id >= await getTemplateMax() - 1)
		{
			return;
		}
	//Enable Semaphore????????
	for (var i=id;i<await getTemplateMax()-1;i++)
	{
		await moveSelectionDown(i);
	}
	
}

/**
 * Function to insert a template AT the current position
 * This function will insert into the current submenu if the element above id is a submenu item and continues upward to a Submenu, otherwise it adds it to the main My Templates menu
 * @param id The id of the template to insert
 * @param (optional) The template to add.  If undefined, will add a blank template
 * @param (optional) Boolean to instruct the method to simply add a normal template regardless of the position of the submenu
 * @return The position of the new id where inserted.  
 */
export async function insertTemplateAt(id, mytemplate, ignoreSubmenu)
{
	let max = await getTemplateMax();
	let start = max-1;
	let lastId = await getLastNonBlankTemplateId();  //Obtains the last entry in the table that is empty instead of using the maximum size.  
	//get current selected template
	let currentTemplate = await getTemplate(id, true);
	let parentId = "mytemplate";
	
	//determine if its a submenu or a template
	
	//if template, determine if it's IN A SUBMENU
	
	
	//If the current template (id) is at (or beyond) the currently set max size, do not add
	if (id >= max || id < 0)
		{
			return lastId;
		}
	
	//check to see if we will exceed the current editor max size.  We cannot add any entries if we are to exceed the current max size
		
	//Alternatively, calculate the last id position of a non-blank template (relative to the current maximum setting) and see if that entry is the maximum
	//If we are not at the maximum for this, we can safely discard the last entry in the table... or technically (to save on compute cycles) can use this to safely discard up to the lastId.  
	if (lastId >= max - 1)
	{
		if (mytemplate == null || mytemplate === undefined || mytemplate.type === "TEMPLATE")
		{
			//This should probably change to max=lastId;... this was intended to shortcut a blank template from being added to the bottom as it's already blank
			return id;
		}
		else if (mytemplate.type === "SEPARATOR" || mytemplate.type === "SUBMENU")
		{
//			if (await isBlankTemplate(lastId))
//			{
//				start = lastId;
//			}
//			else
//			{
				return id;
//			}
		}
		else
		{
			return id;
		}
	}
	else
	{
		start = lastId + 1;
	}
	
	//Is Template in a submenu?
	if (ignoreSubmenu == null || ignoreSubmenu === undefined || ignoreSubmenu === false)
	{
		if (mytemplate == null || mytemplate === undefined || mytemplate.type === "TEMPLATE" || mytemplate.type === "SEPARATOR")
		{
			if (currentTemplate.parentId === "mytemplate")
			{
				parentId = "mytemplate";
			}
			else	
			{
				if (id-1 >= 0)
				{
					let indexTemplate = await getTemplate(id-1, true);
					
					//Check the immediate one above and see if it's part of the same submenu block... if it is, we add to that block, even if the submenu doesn't exist.
					//This block also works for the parentId "mytemplate"
					if (indexTemplate.parentId === currentTemplate.parentId)
					{
						parentId = currentTemplate.parentId;
					}
					else if (indexTemplate.parentId === "mytemplate")
					{
						if (indexTemplate.type === "SUBMENU" && currentTemplate.parentId === getSubmenuName(id-1))
						{
							parentId = currentTemplate.parentId;
						}
					}
				}
			}
		}
		else if (mytemplate.type === "SUBMENU")
		{
			parentId = "mytemplate";
			//If multilayered submenus are implemented, more logic could go here!
		}		
	}
	else 
	{
		parentId = "mytemplate";
	}
	
	if (mytemplate == null || mytemplate === undefined)
	{
		await setBlankTemplate(lastId+1,parentId);
	}
	else 
	{
		//set parentId in template object, but we need to do this asynchronously
		let object = Object.assign({}, mytemplate);
		
		const removeParentId = async (object, parentId) => {
              return new Promise((resolve) => {
				  object.parentId = parentId;
				resolve(object);
        	}
        )};
        
        object = await removeParentId(object, parentId);
        
        if (id > lastId + 1 && id < max)  //If we are beyond the last non-blank template, but we are setting this before template max, set it at the position of id
        {
			await setTemplate(id,object);
		}
        else  //Otherwise set it at the position of the last template
        {
			await setTemplate(lastId+1,object);
		}
	}
	
	//Loop to move the template up from the last position to the position of id.  
	for (var i=start;i>id;i--)
	{
		await moveSelectionUp(i);
		//await moveUp(i);
	}
	
	//Return the correct position of the new id (i.e. where should the cursor be if viewing a table of templates)
	if (mytemplate == null || mytemplate === undefined)
	{
		if (id >= lastId+1)
		{
			if (id < max)
			{
				return id;
			}
			else
			{
				return lastId+1;
			}
		}
		else
		{
			return id;
		}
	}
	else if (mytemplate.type === "SUBMENU" || mytemplate.type === "SEPARATOR" || mytemplate.type === "TEMPLATE")
	{
		if (id >= lastId+1)
		{
			if (id < max)
			{
				return id;
			}
			else
			{
				return lastId+1;
			}
		}
		else
		{
			return id;
		}
	}	
	else
	{
		return id;
	}
}

/**
 * Function to delete a template from the template array in chrome.storage.local
 * //TODO Currently the delete does not detatch submenu items, may simply run a separate function after deletion to do this
 * @param id The template id to delete
 * @return (not implemented yet) The position of the id.  If deleted from the very end, this will be one less than the current position.  
 */
export async function deleteTemplate(id)
{
	let max = await getTemplateMax();
	let lastId = await getLastNonBlankTemplateId();
	//get current selected template
	
	
	//determine if its a submenu or a template
	
	//if template, determine if it's IN A SUBMENU
	
	
	//If the current template (id) is beyond the currently set max size, do not delete as you have chosen a template that is beyond the current size
	//This is not (max - 1), as you can delete the template in the last position.  
	//Also check for negative numbers and return without doing anything
	if (id >= max || id < 0)
		{
			return;
		}
			
	//Alternatively, calculate the last id position of a non-blank template (relative to the current maximum setting) and see if that entry is the maximum
	max = lastId + 1;
	
	
	//If we are deleting a submenu, we need to free all of the templates from that submenu first. 
	if (await isSubmenu(id))
	{
		await detachAllFromSubmenu(id);
	}
	
	//If we are deleting a separator or entry in a current submenu, we may need to shift those up also.  
	
	//Create the blank template at the current position.  
	await setBlankTemplate(id, "mytemplate");
	
	//Special case if this is the only entry in the template list (when calculating using lastId), simply set the 0th element to a blank template and save changes.  
	if (lastId == 0 && id == 0)
	{
		
	}
	//Otherwise move the now deleted template down to the position of lastId + 1 (which cannot go beyond the maximum size), which effectively shifts up all other templates.  
	else
	{
		//Enable Semaphore????????	
		for (var i=id;i<max;i++)
		{
			await moveSelectionDown(i);
			//await moveDown(i);
		}
	}
}

/**
 * Function to detatch all elements from a submen... optionally delete the submenu
 * @param submenuId The ID of the submenu
 * @param deleteSubmenu Boolean to indicate you want to also delete this submenu after deassociating all templates from the submenu
 */
export async function detachAllFromSubmenu(submenuId, deleteSubmenu)
{
	let max = await getTemplateMax();
	var parentId = "mytemplate";
	
	if (submenuId >= max || submenuId < 0)
	{
		return;
	}
	
/*	if (await isSubmenu(submenuId) === false)
	{
		return;
	}
*/	
	let submenuName = await getSubmenuName(submenuId);

	for (let i=0;i<max;i++)
	{
		if (await getTemplateParentId(i) === submenuName)
		{
			await setTemplateParentId(i,parentId);
		}
	}
	if (deleteSubmenu === undefined || deleteSubmenu === false)
	{
		
	}
	else if (deleteSubmenu === true)
	{
		await setBlankTemplate(submenuId, parentId);
//		await setTemplateName(id,"");
//		await setTemplateText(id,"");
//		await setTemplateType(id,"TEMPLATE");
//		await setTemplateParentId(id, "mytemplate");
		
//		await deleteTemplate(submenuId);
	}
	
}

/**
 * Function to repair all submenus
 * This will cycle through the entire Template array in chrome.storage.local and see if submenus exist for templates and run the attach thread if necessary.
 * This function will also remove the parentId of any templates who's submenu doesn't exist
 * This will also attempt to repair any templates that are part of a submenu but shouldn't be (such as a submenu of a submenu).  
 * This function will likely take longer to complete than other operations.
 * @return newId The location where the cursor should be placed (currently this sets it to 0)
 */
export async function repairSubmenus()
{
	let max = await getTemplateMax();
	let lastId = await getLastNonBlankTemplateId();
	let newId = 0;
	let removedParentIdIterator = 0;  // tracks the number of times the parentId was set back to "mytemplate"
	let iteration = 0; //Prevention of infinite loop
		
	for (let i=0;iteration<max && i<=lastId;i++)
	{
		let currentTemplate = await getTemplate(i, true);
		
		if (currentTemplate.parentId.match(/^mytemplate-[0-9]*$/))
		{
			if (await isSubmenu(getSubmenuId(currentTemplate.parentId)) === true)
			{
				//Do we have/need code to detect if a submen is already attached?
				let newId = await attachTemplate(i,getSubmenuId(currentTemplate.parentId));
				
				if (newId == i || (newId == 0 && i != 0))
				{
					
				}
				else
				{
					if (newId < i) //The template was moved upward
					{
						i--;
						iteration++;
					}
					else //if (newId > i) //The template was moved downward
					{
						i--;
						iteration++;
					}
				}
			}
			else
			{
				await setTemplateParentId(i, "mytemplate");
				removedParentIdIterator++;  // for debugging
			}
		}
	}	
	
	//debug
	console.log("repairSubmenus(): Number of attaches (max " + max + "): " + iteration);
	console.log("repairSubmenus(): Number of submenuitems corrected: " + removedParentIdIterator);

	return newId;  //return to the zeroth position
}

/**
 * Function to attach a template to a specific submenu. 
 * The idea of this function is to take a specific template (if a template) at the position "id" and set it's parentId to the ID of the submenu at submenuId
 * The template would then move to the submenu... if the template is located above the submenu it's added at the top, if it's below the submenu block, added to the bottom. 
 * @param id The template that you want to attatch to a submenu
 * @param submenuId The id of the submenu you want to attach to
 * @return The id where the element moved to (if not moved, or function exited before moving, returns the current id)
 */
export async function attachTemplate(id, submenuId)
{
	let max = await getTemplateMax();
	let lastId = await getLastNonBlankTemplateId();
	let newId = id;
	
	if (id >= max || id < 0)
	{
		return id;
	}
	
	if (submenuId >= max || submenuId < 0)
	{
		return id;
	}
	
	//If we have specified the same submenuId as the id, we return (techncially this would be transforming a current template into a submenu)
	if (id == submenuId)
	{
		return id;
	}
	
	if (await isSubmenu(id))  //Don't make a submenu out of a submenu
	{
		return id;
	}
	
	if (await isSubmenu(submenuId))
	{
		let submenuName = getSubmenuName(submenuId);
		let submenuDistance = id - submenuId;
		let submenuLength = await getSubmenuBlockLengthDownwards(submenuId);
		
		//Change parentId now (before we move the template around as if we do this after, the submenu won't be in the correct location)
		await setTemplateParentId(id, submenuName);

		//determine if submenu is lower or higher than the id
		//Also determine the length of the submenu, we want to add it to the bottom.  
		
		if (submenuDistance > 0)  //Positive number, move upwards
		{
						
			for (let i = id; i > submenuId + submenuLength && i > 0; i--, newId--)
			{
				await moveSelectionUp(i);
			}
			
		}
		else if (submenuDistance < 0) //Negative number, move downwards
		{
			for (let i = id; i < submenuId && i < max; i++, newId++)
			{
				await moveSelectionDown(i);
			}		
		}
		
	}
	
	return newId;
}


/**
 * Attaches the template to the closest submenu upwards, then checks downwards
 * @param id The id of the template (or separator) to attach.
 */
export async function attachTemplateToNearestSubmenu(id)
{
	
	let max = await getTemplateMax();
	let lastId = await getLastNonBlankTemplateId();
	let newId = id;
	
	if (id > max)
	{
		return newId;
	}
	
	if (id < 0)
	{
		return newId;
	}
	
	let index = id - 1;
	//Scan upward for submenu
	for (index = id - 1; index >= 0; index--)
	{		
		if (await isSubmenu(index))
		{
			newId = await attachTemplate(id,index);
			return newId;
		}
	}
	
	if (index < 0) //Scan downards
	{		
		for (let index = id + 1; index < lastId+1; index++)
		{
			if (await isSubmenu(index))
			{
				newId = await attachTemplate(id,index);
				return newId;
			}			
		}
	}
	
	return newId;
	
}

/**
 * Detaches the template from a submenu, and moves it below the submenu.  
 * @param id The id of the template (or separator) to detach.
 */
export async function detachTemplate(id)
{
	var parentId = "mytemplate";
	let max = await getTemplateMax();
	let newId = id;
	let lastId = await getLastNonBlankTemplateId();
	let currentTemplate = await getTemplate(id, true);
	
	//Make sure that the id is in the valid range before continuing
	if (id >= max)
	{
		return lastId;
	}
	
	if (id < 0)
	{
		return newId;
	}
	
	if (currentTemplate.parentId === parentId)
	{
		return newId;
	}
	
	//Move template to end of submenu, if in said submenu
	let downwardLength = await getSubmenuBlockLengthDownwards(id);
	
	//As the length is inclusive (includes the element we highlighted), we reduce the length by one in the loop	
	for (let i = id; i < id + downwardLength-1; i++,newId++)
	{
		await moveSelectionDown(i);
	}
	
	//Set the template's parentId only to "mytemplate"
	await setTemplateParentId(newId, parentId);
	
	return newId;
}

/**
 * Detaches all templates (in the entire array) from a submenu.
 * This will not rearrange the templates in the array, but will scan for all templates that match the submenu name (regardless of position) and replace it.
 * This does not delete the submenu
 * @param id The id of the template (or separator) to detach.
 */
export async function detatchAllTemplatesFromSubmenu(submenuId)
{
	let max = await getTemplateMax();
	let parentId = "mytemplate";
	let submenuName = getSubmenuName(submenuId);
	
	if (submenuId < 0 || submenuId >= max)
	{
		return;
	}
	
	for (let i = 0; i < max; i++)
	{
		if (await getTemplateParentId(i) === submenuName)
		{
			await setTemplateParentId(parentId);
		}
	}
}

/**
 * Blank templates are removed if any exist between the last nonblank entry and the top of the list.  
 * Loop starts at the last non-blank template to allow for one iteration of the loop.  
 */
export async function collapseAllBlankTemplates()
{
	let max = await getTemplateMax();
	let newId = 0;
	let lastId = await getLastNonBlankTemplateId();
	
	for (let i = lastId; i >= 0; i--)  //We know templates after the lastId are blank, so we skip processing those
	{
		if (await isBlankTemplate(i) === true)
		{
			await deleteTemplate(i);
		}
	}
	
	return newId;
}

 /**
  * Function to obtain a list of all templates for a specific submenu id
  * @return array of indexes representing templates that are considered in the submenu, including templates OUTSIDE the current templateMax.  
  */
export async function getAllSubmenuTemplates(submenuId)
{
	let arrayOfTemplates = [];
	let max = templateMax;  //This should be template max (or the absolute maximum the template array can go), as we want to grab the entire list, including those that may be stored beyond the current maximum size.
	
	submenuName = "mytemplate-"+submenuId;
	
	for (i=0;i<max;i++)
	{
		if (await getTemplateParentId(i) === submenuName)
		{
			arrayOfTemplates.push(i);
		}
	}
	
	return arrayOfTemplates;
	
}

/**
  * Function to obtain a list of all active templates for a specific submenu id
 * @return array of indexes representing templates that are considered in the submenu, adhering to the current maximum settings
 */
export async function getActiveSubmenuTemplates(submenuId)
{
	let arrayOfTemplates = [];
	let max = await getLastNonBlankTemplateId()+1;  //This should be the last valid id in the current view, as we want to only look at the current list, not entries beyond 
	//let max = await getTemplateMax();
	
	submenuName = "mytemplate-"+submenuId;
	
	for (i=0;i<max;i++)
	{
		if (await getTemplateParentId(i) === submenuName)
		{
			arrayOfTemplates.push(i);
		}
	}
	
	return arrayOfTemplates;
	
}

/**
 * @return The length of the submenu if you only have the name of the submenu.  Only calculates entries in the submenu, not anything outside of it's bounds.
 * Use getActiveSubmenuTemplates or getAllSubmenuTemplates to search the entire template array 
 */
export async function getSubmenuLengthByName(submenuName)
{
	if (await isValidSubmenu(submenuName))
	{
		let max = await getTemplateMax();
		let length = 0;
				
		for (var i=Number(submenuName.replace("mytemplate-",""))+1;i<max;i++)
		{
			if (await getTemplateParentId(i) === submenuName)
			{
				
			}
			else
			{
				break;
			}
			
			length++;
		}
		
		return length;
	}
}

/**
 * @Return Length of the submenu if you only have the id of the submenu.  Only calculates entries immediately following the submenu, not anything outside of it's bounds.
 * Use getActiveSubmenuTemplates or getAllSubmenuTemplates to search the entire template array
 */
export async function getSubmenuLengthById(submenuId)
{
	if (await isSubmenu(submenuId))
	{
		
		let max = await getTemplateMax();
		let length = 0;
				
		for (var i=submenuId+1;i<max;i++)
		{
			if (await getTemplateParentId(i) === submenuName)
			{
				
			}
			else
			{
				break;
			}
			
			length++;
		}
		
		return length;
	
	}
}

/**
 * Working from "id", scan upwards to find out how many elements are in the submenu block.
 * This could be a block that has become separated from it's submenu.
 * If the submenu is found, include that in our length
 * We don't care about elements above the submenu
 * @param id The template Id to scan upwards from
 * @param excludeSubmenu (optional) Boolean if you want to calculate the submenu in your length
 * @return The length upward of a block of submenu itmes from the current position.  Length is 0 if at the top of a submenu or the top of the array
 */
export async function getSubmenuBlockLengthUpwards(id, excludeSubmenu)
{
		let max = await getTemplateMax();
		let length = 0;
		let currentEntry = await getTemplate(id);
		let bufferParentId = undefined;
		if (id < 0)
		{
			return 0;
		}
		
				
		for (var i=id-1;i>=0;i--)
		{
			let indexTemplate = await getTemplate(i);
			
				length++;		
			//We have reached a template that is not part of the submenu or is a submenu
			if (indexTemplate.parentId === "mytemplate")
			{
				if (indexTemplate.type === "SUBMENU")
				{
					if (bufferParentId !== undefined && bufferParentId === getSubmenuName(i))  // We have walked our way up to the submenu... the bufferParentId may not be set, but if it is, it would match this too
					{
						if (excludeSubmenu === undefined || excludeSubmenu === false) //Do we exclude matching submenu from the calculation? (useful for moving element to top of submenu list instead of above it)
						{
							
						}
						else
						{
							length--;
						}
						break;
					}
					else if (currentEntry.parentId === getSubmenuName(i)) //this technically only will happen when i = id-1
					{
						if (excludeSubmenu === undefined || excludeSubmenu === false) //Do we exclude matching submenu from the calculation? (useful for moving element to top of submenu list instead of above it)
						{
							
						}
						else
						{
							length--;
						}
						break;
					}
					else
					{
						break;
					}
				}
				else
				{
					if (bufferParentId !== undefined)
					{
						length--; //Since the entry here is not a submenu, it's not part of our length calculation
					}
					break;
				}
				
			}
			//if the template at position i is the same as the current entry's parent Id
			else if (bufferParentId === undefined && indexTemplate.parentId === currentEntry.parentId)
			{
				bufferParentId = currentEntry.parentId;
				continue;
			}
			else 
			{
				if (bufferParentId === undefined)  //We want to track the buffer
				{
					bufferParentId = indexTemplate.parentId;
					continue;
				}
				else if (bufferParentId !== undefined)
				{
					if (indexTemplate.parentId === bufferParentId)
					{
						continue;
					}
					else
					{
						length--;
						break;
					}
				}
				else
				{
					break; //This can only occur if currentEntry.parentId === mytemplate (including if we are a submenu), or we hit a different submenu item.  
				}
			}
			
		}
		
		return length;
}

/**
 * Working from "id", scan downwards to find out how many elements are in the submenu block.
 * This could be a block that has become separated from it's submenu.
 * If the submenu is found, always include that in our length
 * We don't care about elements above the submenu
 * @param id The template Id to scan downwards from
 * @return The length downward of a block of submenu itmes from the current position.  Length is 0 if at end of the array. //TODO While I posit length 0 should be returned for bottom of submenu, currently length 1 is returned if at end of submenu
 */
export async function getSubmenuBlockLengthDownwards(id)
{
		let max = await getTemplateMax();
		let length = 0;

		if (id >= max)
		{
			return 0;
		}
		
/*		if (id+1 >= max)
		{
			return 1; 
		}
*/
		let currentEntry = await getTemplate(id);
		
		length++;
		
		for (var i=id+1;i<max;i++,length++)
		{
			let indexTemplate = await getTemplate(i);
			
			if (currentEntry.type === "SUBMENU")
			{
				if (indexTemplate.parentId === getSubmenuName(id))  //If the submenu matches the next element's parentId in our iteration, it's part of the same submen, and we continue
				{
					continue;
				}
				else if (indexTemplate.parentId === "mytemplate")
				{
					break;
				}
				else //If the submenu doesn't match the next element's parentId, then we reached the end of the submenu block and we break.  
				{
					break;
				}
			}
			else if (await indexTemplate.parentId === currentEntry.parentId)  //type is SEPARATOR or TEMPLATE, check if the entry matches the currentEntry.parentId (i.e. part of the same block)
			{
				if (currentEntry.parentId === "mytemplate")
				{
					break;
				}

				continue;
			}
			else
			{
				//length--;
				break;
				
			}			

		}
		
		return length;
}

/**
 * Calculates the last non-blank (or non "New Template" entry in the template array, a smart maximum
 * One needs to check all of the settings, not just the name New Template, as the user may have added text to the template... but we still don't display any template that ends with the name "New Template"
 * @returns The id of the last non-blank or non-New Template entry, or 0 if at the top.   
 */
export async function getLastNonBlankTemplateId()
{
	let max = await getTemplateMax();
	let name = undefined;
	let id=max-1;
	
	for (id=max-1;id>0;id--)
	{
		if (await isBlankTemplate(id))
		{
			//continue;
		}
		else
		{
			break;
		}
  }
	return id;
}

//This is the old method
/*
async function getLastNonBlankTemplateId()
{
	let max = await getTemplateMax();
	let name = undefined;
	let id=max-1;
	
	for (id=max-1;id>0;id--)
	{
        name = await getTemplateName(id);
        
        if (name === "" || name === "New Template")
        {
        	
       	}
        else
        {
        	break;
        }

	}
	
	return id;
}
*/

/**
 * Determines if the template, submenu, or separator is blank
 * For separators, we check the type as SEPARATOR (as we don't care about the template text for a separator, it should technically be blank)
 * For submenus, we don't do anything... the submenu can technically contain no entries. 
 * @param id The id of the template to check
 * @return true if the template is blank (or is beyond the range), false if not.
 */
export async function isBlankTemplate(id)
{
	if (id < 0 || id >= await getTemplateMax())
	{
		return true;
	}
	
	let mytemplate = await getTemplate(id);

	
	if (mytemplate.type === "SEPARATOR")
	{
		//Separators are always present, we ignore the text and title.
		return false;
	}
	else if (mytemplate.type === "SUBMENU")
	{
		//simply return, as a submenu can exist with zero entries.  We may want to not display this submenu with zero entries.
		//We ignore the text and title.  Use await isSubmenu(id) if you want to determine if a particular template id is a submenu.
		return false;
	}
	else if (mytemplate.type === "TEMPLATE")
	{
			
		if (mytemplate.parentId === "mytemplate")
		{		
			// Check for an exact match "New Template"... but other code may currently use endsWith("New Template").
			if (mytemplate.title == null || mytemplate.title === undefined || mytemplate.title === "" || mytemplate.title === "New Template" || mytemplate.title.match(/^[ \t\r\n\f]*$/))
			{
				if (mytemplate.cliptext == null || mytemplate.cliptext === undefined || mytemplate.cliptext === "" || mytemplate.cliptext.match(/^[ \t\r\n\f]*$/))
				{
					return true;
				}
			
			}
		}
		else
		{
			return false;
		}
	}
	
	return false;
}

/*
	The JSON or Object for a single template should be in the following format
	{
		title: "TITLE" //Recommend using "New Template" to represent a blank template, or "Separator" to represent a separator.  Blank entries will be reverted to "New Template"
		cliptext: "TEMPLATE_TEXT"
		type: "TYPE"  //"TEMPLATE", "SEPARATOR", or "SUBMENU"
		parentId: "mytemplate" or "mytemplate-"+id that represents a submenu
	}
	NOTE: Title should not be blank, will be transformed to "New Template" after import
	NOTE: While most methods are for My Templates, the Shared Templates parentId would be "sharedtemplate" or "sharedtemplate-"+id for a submenu
*/

/**
 * This function returns a template Object variable with the same formatting as an entry stored in the JSON file.  
 * @param id The template Id to return
 * @param noClipText (optional) Boolean if you want to not retrieve the cliptext (as this will be a larger value to return, saves on performance)
 */
export async function getTemplate(id, noClipText)
{
	
	//While we could dynamically remove the template_text from the object, this requires an async method call to do so.
	//Instead we duplicate the function call twice below to save on time. 
	if (noClipText == null || noClipText === undefined || noClipText === false)
	{	
		const read = async (id) => {
			return new Promise((resolve) => {
				chrome.storage.local.get({
					['template_title'+id]: template[id].title, 
					['template_text'+id]: template[id].cliptext, 
					['template_type'+id]: template[id].type, 
					['template_parentId'+id]: template[id].parentId,
					}, function(items)	{
	
						if (Object.keys(items).length === 0 && items.constructor === Object)
						{
							resolve(undefined);
						}
						
						var mytemplate = {
							title: "New Template",
							cliptext: "",
							type: "TEMPLATE",
							parentId: "mytemplate",
						};
	
						for (const [key, value] of Object.entries(items)) {
							if (key.startsWith('template_title')) {
								mytemplate.title = value;
							}
							if (key.startsWith('template_text')) {
								mytemplate.cliptext = value;
							}
							if (key.startsWith('template_type')) {
								if (value == null || value === undefined || value === "")
								{
									mytemplate.type = "TEMPLATE"
								}
								else
								{
									mytemplate.type = value;
								}
							}
							if (key.startsWith('template_parentId')) {
								if (value == null || value === undefined || value === "")
								{
									mytemplate.parentId = "mytemplate"
								}
								else
								{
									mytemplate.parentId = value;
								}
							}
						}
	
						resolve(mytemplate);
	
					}
				);
			})
		};
	
		const entry = await read(id);
		
		return entry;
	}
	else
	{
		const read = async (id) => {
			return new Promise((resolve) => {
				chrome.storage.local.get({
					['template_title'+id]: template[id].title, 
					['template_type'+id]: template[id].type, 
					['template_parentId'+id]: template[id].parentId,
					}, function(items)	{
	
						if (Object.keys(items).length === 0 && items.constructor === Object)
						{
							resolve(undefined);
						}
						
						var mytemplate = {
							title: "New Template",
							type: "TEMPLATE",
							parentId: "mytemplate",
						};
	
						for (const [key, value] of Object.entries(items)) {
							if (key.startsWith('template_title')) {
								mytemplate.title = value;
							}
							
							//skip cliptext
							
							if (key.startsWith('template_type')) {
								if (value == null || value === undefined || value === "")
								{
									mytemplate.type = "TEMPLATE"
								}
								else
								{
									mytemplate.type = value;
								}
							}
							if (key.startsWith('template_parentId')) {
								if (value == null || value === undefined || value === "")
								{
									mytemplate.parentId = "mytemplate"
								}
								else
								{
									mytemplate.parentId = value;
								}
							}
						}
	
						resolve(mytemplate);
	
					}
				);
			})
		};
	
		const entry = await read(id);
		
		return entry;		
	}
}

/**
 * Duplicate function for getAllTemplates()
 */
export async function getTemplates()
{
	return await getAllTemplates();
}


/**
 * This method returns a blank template Object with the same formatting as a single entry stored in the JSON file.  
 * This is NOT an asynchronous method call
 * @parentId (optional) the parentId of the blank template, defaults to "mytemplate"
 */
export function generateBlankTemplate(parentId)
{
	var templateParentId = "mytemplate";
	
	if (parentId == null || parentId === undefined || parentId === "" || !parentId.match(/^mytemplate-[0-9]*$/))
	{
		templateParentId = "mytemplate";
	}
	else
	{
		templateParentId = parentId;
	}
	
	return 	{
		title: "New Template",
		cliptext: "",
		type: "TEMPLATE",
		parentId: templateParentId,
	};
}

/*
 * These represent setters for setting speific types of templates, submenus, or separators.  
 * The call to setTemplate(id, title, text, parentId)
 */

/** 
 * Function to set a blank template with a specific parentId
 * @param id The template id to set
 * @param parentId (optional) The parentId to set (defaults to "mytemplate")
 */
export async function setBlankTemplate(id, parentId)
{
	if (parentId == null || parentId === undefined || parentId === "" || !parentId.match(/^mytemplate-[0-9]*$/))
	{
		await setTemplate(id, generateBlankTemplate("mytemplate"));
	}
	else
	{
		await setTemplate(id, generateBlankTemplate(parentId));
	}
}

/**
 * This function sets a Template.  It doesn't have to be of type "TEMPLATE", but simply takes a template Object and adds it to chrome.storage.local
 * //NOTE: there are currently no checks on the mytemplate Object other than checking for parentId.
 * @param id The id to add the template to
 * @param myTemplate The template Object to add
 */
export async function setTemplate(id, mytemplate)
{
	//Setting the parentId on a context menu forces it to load at the bottom of the submenu.  
	//By checking for if parentId exists, we can prevent a trigger in the background.js from forcing a reload (essentially we don't change the parentId).  
	if (mytemplate.parentId == null || mytemplate.parentId === undefined || mytemplate.parentId === "")
	{
		await chrome.storage.local.set({
			['template_title'+id]:mytemplate.title, 
			['template_text'+id]:mytemplate.cliptext, 
			['template_type'+id]:mytemplate.type, 
		});		
	}
	else
	{
		await chrome.storage.local.set({
			['template_title'+id]:mytemplate.title, 
			['template_text'+id]:mytemplate.cliptext, 
			['template_type'+id]:mytemplate.type, 
			['template_parentId'+id]:mytemplate.parentId,
		});
	}
}

/**
 * This function sets a separator.  Takes a template Object and adds it to chrome.storage.local as a Separator.
 * The title is not transformed (usually separators are named "Separator")
 * //NOTE there are currently no checks on the mytemplate Object.
 * @param id The id to add the template to
 * @param myTemplate The template Object to add
 */
export async function setSeparator(id, mytemplate)
{
	await chrome.storage.local.set({
		['template_title'+id]:mytemplate.title, 
		['template_text'+id]:mytemplate.cliptext, 
		['template_type'+id]:"SEPARATOR", 
		['template_parentId'+id]:mytemplate.parentId,
	});
}

/**
 * This function sets a submenu.  Takes a template Object and adds it to chrome.storage.local as a Submenu to "mytemplate".
 * The title is not transformed (usually it's named "Submenu")
 * //NOTE there are currently no checks on the mytemplate Object.
 * @param id The id to add the template to
 * @param myTemplate The template Object to add
 */
export async function setSubmenu(id, mytemplate)
{
	await chrome.storage.local.set({
		['template_title'+id]:mytemplate.title, 
		['template_text'+id]:mytemplate.cliptext, 
		['template_type'+id]:"SUBMENU", 
		['template_parentId'+id]:"mytemplate",
	});
}


//Sets a new entry in the template array.  
/**
 * Function to set an entry (template) in the MyTemplates vector in chrome.storage.local
 * @param id The id to add the template to
 * @param myTemplate The template object to add if it's type is set to TEMPLATE, SEPARATOR, or SUBMENU
 */
export async function setEntry(id, mytemplate)
{
	if (mytemplate == null || mytemplate === undefined)
	{
		return;
	}
	
	if (mytemplate.type == null || mytemplate.type === undefined)
	{
		return;
	
	}
	
	if (mytemplate.type === "TEMPLATE")
	{
		await setTemplate(id, mytemplate)
	}
	else if (mytemplate.type === "SEPARATOR")
	{
		await setTemplate(id, mytemplate);
	}
	else if (mytemplate.type === "SUBMENU")
	{
		await setTemplate(id, mytemplate);
	}

}

/**
 * This function takes a template type string (TEMPLATE, SUBMENU, SEPARATOR) and converts that to what chrome.contextMenus.update() (or create()) would use.
 * @returns "normal" or "separator"... other valid options that theoretically could be returned are "checkbox" or "radio".
 */
export function determineMenuType(type)
{
	if (type == null || type === undefined || type === "" || type === "TEMPLATE")
	{
		return "normal";
	}
	else if (type === "SUBMENU")
	{
		return "normal";
	}
	else if (type === "SEPARATOR")
	{
		return "separator";
	}
	
	return "normal";
}

export async function checkRebuild()
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

