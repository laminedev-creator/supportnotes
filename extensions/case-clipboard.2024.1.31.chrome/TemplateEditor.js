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

//Do we need to allow clipboard access to the TemplateEditor files in manifest.json???
//import {copyToClipboard} from './clipboard-helper.js';
//import {exportTemplate} from './background.js';
//import {importTemplate} from './background.js';
//import {saveAllTemplate} from './background.js';
import * as CONSTANTS from './constants.js';
import * as templateHelper from './template-helper.js';
//import {setTemplateName,getTemplateName,getTemplateNames,setTemplateText,getTemplateText,getAllTemplates,isBeImportedTemplates,saveAllTemplates,moveSelectionUp,moveSelectionDown,moveSelectionTop,moveSelectionEnd} from './template-helper.js';
import {setMyTemplatesSyncInProgress, setMyTemplatesSyncCompleted} from './menus.js';

/**
 * Asynchronous function set the template title to the current value stored in "templatename" input field
 * The template to set the name to is the entry that is currently selected in the dropdown select list
 */
async function setCurrentTemplateName()
{
	var name = document.getElementById("templatename").value;
	var selectElement = document.getElementById("templatechoice");
	await templateHelper.setTemplateName(selectElement.selectedIndex, name);
}

/**
 * Asynchronous function to set the template's text into chrome.storage.local
 */
async function setCurrentTemplateText()
{
	var templateText = document.getElementById("editorArea").value;
	var selectElement = document.getElementById("templatechoice");
	await templateHelper.setTemplateText(selectElement.selectedIndex, templateText);
}

/** This asynchronous function generates the options HTML.
 * @param list A list of values, specifically template names
 * @returns The HTML formatting for a list of <option> elements
 */
async function generateOptionListHTML(list)
{

	var html="";
	var i=0;
	
	for (i=0;i<list.length;i++)
	{
		html = html +
			"<option " + 
			 "value=\"" + (i+1) + " - " + list[i] + "\"" + 
			">" + 
				(i+1) + " - " + list[i].replace(/^New Template$/,"").replace(/^Separator$/,"----------") + 
			"</option>\n";
	}
	

	return html;
}

/**
 * Clears the current options list named "templatechoice"
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
 */
function clearOptionList()
{
	var selectElement = document.getElementById("templatechoice");
	var i=0;
	
	for (i=selectElement.options.length;i>=0;i--)
	{
		selectElement.remove(i);
	}
	
}

/** 
 * This asynchronous function generates the options DOM.
 * @param list A list of values, specifically template names
 * @returns The DOM array of HTMLElements with a list of <option> elements.  The names will be in the format "id - value"
 */
async function generateOptionList(list, selectedIndex)
{
	var i=0;
	let optionsList = [];
	var inc=0;
	
	for (i=0;i<list.length;i++)
	{
		let title = list[i];
		let value = templateHelper.getSubmenuName(i);
		let mytemplate = await templateHelper.getTemplate(i);
		let additionalClasses = "";
		
		//Decorate the Titles
		if (mytemplate.type === "SEPARATOR")
		{
			//title = title.replace(/^Separator$/,"");  //Optional removal as separators don't need a title.
			title = "-----";
			
		}
		else if (mytemplate.type === "SUBMENU")
		{
			// Use CSS
			additionalClasses = additionalClasses + " " + value;
		} 
		else if (mytemplate.type === "TEMPLATE")
		{

			if (mytemplate.parentId === "mytemplate")
			{
				inc++;
//				title = inc + " - " + title;
				
				if (inc <= 9)
				{
					additionalClasses = additionalClasses + " " + "numsp";
				}
			}
			else
			{
				
			}
		}
		
		if (mytemplate.parentId === "mytemplate")
		{
			additionalClasses = additionalClasses + " menuitem";
		}
		else
		{
			additionalClasses = additionalClasses + " submenuitem";
		}
		
		//Replace New Template with a blank
		title = title.replace(/^New Template$/,"");
		
		optionsList[i] = await new Option(title, value, false, (i==selectedIndex));
		
		//Add initial classes
		if (mytemplate.type === "SUBMENU")
		{
			await optionsList[i].setAttribute("class","submenu");
		} 
		else if (mytemplate.type === "SEPARATOR")
		{
			await optionsList[i].setAttribute("class", "separator");
		}
		else if (mytemplate.type === "TEMPLATE")
		{
			await optionsList[i].setAttribute("class", "template");
		}
		
		//Append additional classes.  
		await optionsList[i].setAttribute("class", (await optionsList[i].getAttribute("class")) + additionalClasses);
		
		

	}
	
	return optionsList;
}

/**
 * This asyncronous function populates the "templatechoice" select dropdown list with the list of templates called from method generateOptionList()
 * @param isClear Boolean that controls whether the dropdown list should be cleared first (true) or not cleared (false)
 * @returns
 */
async function populateOptionList(isClear)
{
	var selectElement = document.getElementById("templatechoice");
	const templateNames = await templateHelper.getTemplateNames();
	const optionsList = await generateOptionList(templateNames, selectElement.selectedIndex);
	var i=0;

	if (isClear)
	{
		clearOptionList();
	}

	for (let i=0;i<optionsList.length;i++)
	{
		selectElement.add(optionsList[i]);
	}
	
}

/**
 * This function sets the select dropdown list to the current template stored in "selectedtemplate" label
 */
function setSelectedOptionsList()
{
	var selectElement = document.getElementById("templatechoice");
	var i = 0;
	
	for (i=0;i<selectElement.options.length;i++)
	{
		if (selectElement.item(i).value.match(document.getElementById("selectedtemplate")))
		{
			selectElement.item(i).selected = true;
		}
	}
}

/**
 * This function sets the select dropdown list to the one that matches the title
 * This function should ignore the "ID - " prefix of the title  stored in the displayed name in the dropdown list
 * @param name The template title to match against
 */
function setSelectedOptionsListByName(name)
{
	var selectElement = document.getElementById("templatechoice");
	var i = 0;
	
	for (i=0;i<selectElement.options.length;i++)
	{
		if (selectElement.item(i).value.match(name))
		{
			selectElement.item(i).selected = true;
			
		}
	}
}

/**
 * This function clears the list of all selected options
 * Currently the list is a dropdown list and is expected to always have one entry selected, so this may not be necessary
 * This doesn't default select the first element in the list if its repopulated
 * @param name (not implemented) If you want to remap what is currently selected, supply this argument, otherwise set it to null to clear all selected items.
 */
async function clearSelectedOptionsList(name)
{
	var selectElement = document.getElementById("templatechoice");
	var i = 0;
	
	for (i=0;i<selectElement.options.length;i++)
	{
		selectElement.item(i).selected = false;
	}
}

/**
 * Asynchronous function that sets the text of the currently selected element.
 * It expects only one element to be selected.
 * @returns
 */
async function setSelectedTemplateText() {
        var selectElement = document.getElementById("templatechoice");
	var templateText = await templateHelper.getTemplateText(selectElement.selectedIndex);
	document.getElementById("editorArea").value = templateText;
}

/**
 * Asynchronous function that populates the template title into the templatename field (and hidden field selectedtemplate)
 * This is so the user can see the current name when loading a template before changing it wih the Change Name button  
 * The hidden field selectedtemplate may not be needed with other coding in place to load the template name from storage
 */
async function populateTemplateTitle() {
    var selectElement = document.getElementById("templatechoice");
    var templateTitle = "";
    
    // If no element is selected, assume that zero is selected (i.e. load the top-most template in the list)
    if (selectElement.selectedIndex === -1)
    	{
    		selectElement.selectedIndex=0;
    		templateTitle = await templateHelper.getTemplateName(0);
    	}
    else
    	{
			templateTitle = await templateHelper.getTemplateName(selectElement.selectedIndex);
    	}
    
    document.getElementById("templatename").value = templateTitle;
    
    
    if (document.activeElement === document.getElementById("templatename"))
    {
		
	}
	else
	{
		document.getElementById("selectedtemplate").value = templateTitle;
	}
	
}


/**
 * Asynchronous function to populate the default template text (index of 0 in the template array)
 */
async function setDefaultTemplateText() {
    var selectElement = document.getElementById("templatechoice");
    selectElement.selectedIndex=0;
	var templateText = await templateHelper.getTemplateText(0);
	document.getElementById("editorArea").value = templateText;
}

/**
 * Function to compute the resizing of the editor area to adjust the textarea's height
 */
async function setResize() 
{
/*	var editorArea = document.getElementById("editorArea");
	var innerHeight = window.innerHeight - 70;
	editorArea.style.height = innerHeight + 'px';
*/
}

/**
 * This function populates the special sequences into the text are for the editor
 */
function populateSpecialSequence(seq)
{
	var cursorPosition = document.getElementById("editorArea").selectionStart;
	let currentText = document.getElementById("editorArea").value;
	
	if (cursorPosition === null)
	{
		return;
	}
	
	if (seq >= 0 && seq < (CONSTANTS.SPECIAL_SEQUENCES.length / 2))
	{
		//document.getElementById("editorArea").value = currentText.slice(0, cursorPosition) + CONSTANTS.SPECIAL_SEQUENCES[seq*2] + currentText.slice(cursorPosition);
		//document.getElementById("editorArea").setRangeText(CONSTANTS.SPECIAL_SEQUENCES[seq*2], document.getElementById("editorArea").selectionStart, document.getElementById("editorArea").selectionEnd, "end");

		document.getElementById("editorArea").focus();
		document.execCommand("insertText", false, CONSTANTS.SPECIAL_SEQUENCES[seq*2]);
	}
}

/**
 * This function determines the type of the current selection in the Template List
 * //TODO
 */
async function determineSelectedTemplateType()
{
	var selectedIndex = document.getElementById("templatechoice").selectedIndex;
	
	if (selectedIndex === -1)
	{
		selectedIndex = 0;
	}
	
	let type = await templateHelper.getTemplateType(selectedIndex);
		
	return type;
}

/**
 * Updates UI elements based on current template name
 */
async function templateTypeChanges()
{
	if (document.getElementById("templatetextheader") != null)
	{
		let type = await determineSelectedTemplateType();
		
		if (type === "SEPARATOR")
		{
			document.getElementById("changename").innerText = "Separator Name";
			document.getElementById("templatetextheader").innerText = "Separator's Template Text";
	
		}
		else if (type === "SUBMENU")
		{
			document.getElementById("changename").innerText = "Submenu Name";
			document.getElementById("templatetextheader").innerText = "Submenu's Template Text";
	
		}
		else //if (type === "TEMPLATE")
		{
			document.getElementById("changename").innerText = "Template Name";
			document.getElementById("templatetextheader").innerText = "Template Text";
	
		}
	}
}

/** 
 * This function disables the save button
 * @param status Boolean.  True will disable the Save button (false will enable it)
 */
function setDisabledSaveButton(status)
{
	if (status === true || status === false)
	{
		document.getElementById("savetemplatetext").disabled=status;
	}

}

/* EVENT LISTENERS*/

//Adds an event listener to the "refresh" button to reload the entire template list (such as if it's been changed in another tab)
document.getElementById("reload").addEventListener('click', async (event) => {

	await populateOptionList(true);
	//setSelectedOptionsList();
	await setSelectedTemplateText();
	await populateTemplateTitle();
	
	//determineSelectedType();   //Is the current highlighted element a template, submenu, or separator
	//getSubmenuList();
	//setSubmenu();
	setDisabledSaveButton(true);
	//setDisabledChangeNameButton(false);
	//populateCollapseButtonStatus();
	//populateAddButtonStatus();
	//populateDeleteButtonStatus();
	//populateMoveButtonStatus();

});


//Adds an event listener to the "load" button to reload the current template (essentially reset the text to what is stored in chrome.storage.local)
document.getElementById("load").addEventListener('click', async (event) => {
        setSelectedTemplateText();
        populateTemplateTitle();
        
    	setDisabledSaveButton(true);

});

//Adds an event listener when the Change Name button is clicked.
document.getElementById("changetemplatename").addEventListener('click', async (event) => {
	setCurrentTemplateName();
	populateOptionList(true);
	populateTemplateTitle();
});

//Adds an event listener to track the X button next to template Name that will reset the template name to the current value in storage
if (document.getElementById("reverttemplatename") != null)
{
	document.getElementById("reverttemplatename").addEventListener('click', async (event) => {
	
		var selectElement = document.getElementById("templatechoice");
		var templateNameElement = document.getElementById("templatename");
		
		//if the element selected is -1, assume the 0th element.  
		if (selectElement.selectedIndex == -1) 
		{
			//If code is in place to save the template when clicking the check button, enable this code
			//templateNameElement.value = await templateHelper.getTemplateName(0);
			
			//If code is in place to save the template when simply typing a new character, use this code to set the name to the selectedtemplate hidden input field, and then save the name.
			templateNameElement.value = document.getElementById("selectedtemplate").value;
			document.getElementById("changetemplatename").click();
			
		}
		else if (selectElement.selectedIndex >= 0 && selectElement.selectedIndex < await CONSTANTS.getTemplateMax())
		{
			//If code is in place to save the template when clicking the check button, enable this code
			//templateNameElement.value = await templateHelper.getTemplateName(selectElement.selectedIndex);
			
			//If code is in place to save the template when simply typing a new character, use this code to set the name to the selectedtemplate hidden input field, and then save the name.
			templateNameElement.value = document.getElementById("selectedtemplate").value;
			document.getElementById("changetemplatename").click();
			
			 
		}
		
		//Don't disable the save button, we may have made edits to the template text in the textarea.  
		 
	});
}


//Adds an event listener when the "Save" button is clicked.
//Saves the template test to chrome.storage.local
document.getElementById("savetemplatetext").addEventListener('click', async (event) => {
        setCurrentTemplateText();
        document.getElementById("changetemplatename").click();
        
        setDisabledSaveButton(true);
});

//Adds an event listener to reset the current template to the defaults.  
//This DOES NOT SAVE the template in case the client made a mistake (they can click SAVE manually).
document.getElementById("reset").addEventListener('click', (event) => {
	//document.getElementById("templatename").value = "New Template";  //Clearing the template text shouldn't clear the template name, let the user change this
	//document.getElementById("editorArea").value = "";
	
	document.getElementById("editorArea").focus();
	document.getElementById("editorArea").select(); //setSelectionRange(0, document.getElementById("editorArea").value.length);
	document.execCommand("insertText", false, " ");

	document.getElementById("editorArea").select(); //setSelectionRange(document.getElementById("editorArea").value.length,document.getElementById("editorArea").value.length);
	
	document.getElementById("editorArea").dispatchEvent(new Event('input'));
});

//Adds an event listener to determine if the templatechoice select dropdown box has a new selection selected
//Populates the title and text of that selected template.
document.getElementById("templatechoice").addEventListener('change', async (event) => {
	await setSelectedTemplateText();
	await populateTemplateTitle();

	//await templateTypeChanges();

//DEBUGGING DATA
	if (document.getElementById("mytemplatetype") !== null)
	{
		document.getElementById("mytemplatetype").value=await templateHelper.getTemplateType(document.getElementById("templatechoice").selectedIndex);
	}
	
	if (document.getElementById("mytemplateparentid") !== null)
	{
		document.getElementById("mytemplateparentid").value=await templateHelper.getTemplateParentId(document.getElementById("templatechoice").selectedIndex);
	}
	
	if (document.getElementById("mytemplatesubmenulength") !== null)
	{
		document.getElementById("mytemplatesubmenulength").value=await templateHelper.getSubmenuBlockLengthDownwards(document.getElementById("templatechoice").selectedIndex);
	}
	
	if (document.getElementById("mytemplatecalcupward") !== null)
	{
		document.getElementById("mytemplatecalcupward").value=await templateHelper.getSubmenuBlockLengthUpwards(document.getElementById("templatechoice").selectedIndex);
	}
	
	if (document.getElementById("mytemplatecalcupwardwithoutsub") !== null)
	{
		document.getElementById("mytemplatecalcupwardwithoutsub").value=await templateHelper.getSubmenuBlockLengthUpwards(document.getElementById("templatechoice").selectedIndex, true);
	}
//END OF DEBUGGING DATA
	
	setDisabledSaveButton(true);
});

//Add event listener for changes to the Submenu dropdown
if (document.getElementById("parentId") != null)
{
	document.getElementById("parentId").addEventListener('change', async (event) => {
		//TODO
	});
}

//Add event listener for clicking the Detach button.  This is a shortcut to select (none) in the Submenu.  
if (document.getElementById("detachsubmenu") != null)
{
	document.getElementById("detachsubmenu").addEventListener('click', async (event) => {
		
		var selectElement = document.getElementById("templatechoice");
		var submenuElement = document.getElementById("parentId");
		var templateIndex = selectElement.selectedIndex;
		
		let templateType = await templateHelper.getTemplateType(templateIndex);
			
		if (templateType === "SUBMENU")
		{
			//Cleanup step... likely trigger "reload" button.
			return;
		}
		
		let templateParentId = await templateHelper.getTemplateParentId(templateIndex);
		
		//Does the template's parentId (including the separator) match "mytemplate", as that's the default.
		if (templateParentId === "mytemplate")
		{
			//Cleanup step... likely trigger "reload" button click event.
			return;
		}
	
		//If the templateIndex is -1, we instead use the 0th index
		if  (templateIndex == -1)
		{
			templateIndex = 0;
		}
		
		if (templateIndex >= 0 && templateIndex < await CONSTANTS.getTemplateMax())
		{
		
			//TODO logic to move the template to just above the submenu
			//await templateHelper.setTemplateParentId("mytemplate");
			await templateHelper.removeSubmenuFromTemplate(templateIndex);
			
			//TODO method call to set the template's parentId setting in chrome storage to "mytemplate"
			//Set the submenu select element to index 0 (none)
			submenuElement.selectedIndex = 0;
			
			//Set the correct index in the template select element.  

			//Cleanup step... likely trigger "reload" button click event
			
		}

	});
}

//Add events to track if inputs have been made to various input fields 
document.getElementById("templatename").addEventListener('input', async (event) => {

	//This codeblock I had accidently added on 6/18/2023 curiously updates the Template Name in realtime with each keystroke!  
	if (document.getElementById("templatename").value === "" || document.getElementById("templatename").value.match(/^[ \t\r\n\f]*$/))
	{
		document.getElementById("templatename").value = "";
		document.getElementById("templatechoice").item(document.getElementById("templatechoice").selectedIndex).innerText = "";
		await setCurrentTemplateName();
	}
	else
	{
		await setCurrentTemplateName();
		await populateOptionList(true);
		await populateTemplateTitle();

	}
		
	//I was only tracking if changes to the input textbox were made, as the Save button should become enabled.
	setDisabledSaveButton(false);
});


document.getElementById("editorArea").addEventListener('input', (event) => {
	
	
	setDisabledSaveButton(false);

});

document.addEventListener("keydown", (event) => {
	if ((event.key === "S" || event.key === "s") && (event.ctrlKey|| event.metaKey))
	{
		event.preventDefault();
		document.getElementById("savetemplatetext").click();
	}
});

//We want to trigger the button to the right of the text box to save the template name, not perform the default operation when Enter is pressed.
document.getElementById("templatename").addEventListener("keydown", (event) => {
	if (event.key === "Enter")
	{
		event.preventDefault();
		document.getElementById("templatechoice").focus();
		document.getElementById("changetemplatename").click();
	}
	else if (event.key === "Escape")
	{
		if (document.getElementById("contextmenu") !== null && !document.getElementById("contextmenu").className.includes("displaynone"))
		{
			event.preventDefault();
			document.getElementById("contextmenu").className = document.getElementById("contextmenu").className + " displaynone";

		}
		else
		{
			event.preventDefault();
			document.getElementById("reverttemplatename").click();
			document.getElementById("templatechoice").focus();
		}
	}
});

if (document.getElementById("delete") !== null)
{
	document.getElementById("templatechoice").addEventListener("keydown", (event) => {
		
			//if (event.key === "Delete" || ((event.key === "-" /*&& event.location == 3*/) && !event.ctrlKey))  //Perform delete template
			if (event.key === "Delete" && (event.ctrlKey || event.metaKey))
			{
				event.preventDefault();
				document.getElementById("delete").click();
			}
			else if (event.key === "Backspace")  //Switch to the Template Name input box and start editing the name.
			{
				if (event.metaKey === true)  //The ⌘ (command) key for macs
				{
					event.preventDefault();
					document.getElementById("delete").click();
					return;	
				}
				
				if (document.getElementById("templatename").value === "New Template")
				{
					document.getElementById("templatename").value = "";
				}
				
				document.getElementById("templatename").setSelectionRange(document.getElementById("templatename").value.length,document.getElementById("templatename").value.length);
				document.getElementById("templatename").dispatchEvent(new Event('keydown', event));
				document.getElementById("templatename").focus();
			}
			//Perform Insert Template At (We ignore the CTRL + [=] key combination as that's used for Zoom In on the browser)
			//We basically want to infer that using the plus key (but actually clicking the equals sign) adds a blank template
			else if ((event.key === "Insert" && (!event.ctrlKey && !event.metaKey))
			 || (event.key === "+" && event.location == 3)
			 || (event.key === "=" && (!event.ctrlKey && !event.metaKey))
			 || (event.key === "`" && (!event.ctrlKey && !event.metaKey))
			 || (event.key === "~" && (!event.ctrlKey && !event.metaKey)))
			{
				//If [KEY] modifer key held down, if at end of submenu, attach to that same submenu as the element at or above it.  
				event.preventDefault();
				document.getElementById("insertnewtemplate").click();
			}
			else if (event.key === "-" && ((!event.ctrlKey && !event.metaKey) || event.location == 3)) //Perform Insert Separator
			{
				//If [KEY] modifer key held down, if at end of submenu, attach to that same submenu as the element at or above it.  
				event.preventDefault();
				document.getElementById("insertseparator").click();
			}
			 //Perform Insert Submenu
			else if ((event.key === "Insert" && (event.ctrlKey || event.metaKey))
			 || (event.key === "=" && event.location === 3)
			 || (event.key === "`" && (event.ctrlKey || event.metaKey))
			 || (event.key === "~" && (event.ctrlKey || event.metaKey)))
			{
				event.preventDefault();
				document.getElementById("insertsubmenu").click();
			}
			//Move template Up
			else if (event.key === "ArrowUp" && (event.ctrlKey || event.metaKey))
			{
				event.preventDefault();
				document.getElementById("moveup").click();
			}
			//Move Template Down
			else if (event.key === "ArrowDown" && (event.ctrlKey || event.metaKey))
			{
				event.preventDefault();
				document.getElementById("movedown").click();
			}
			//Move template to top
			else if (event.key === "Home" && (event.ctrlKey || event.metaKey))
			{
				event.preventDefault();
				document.getElementById("movetop").click();
			}
			//Move Template to bottom
			else if (event.key === "End" && (event.ctrlKey || event.metaKey))
			{
				event.preventDefault();
				document.getElementById("moveend").click();
			}
			//Attach template to nearest submenu (if submenu exists)
			else if (event.key === "ArrowRight" && (event.ctrlKey || event.metaKey))
			{
				event.preventDefault();
				document.getElementById("attachnearest").click();
			}
			//Detach template from current submenu
			else if (event.key === "ArrowLeft" && (event.ctrlKey || event.metaKey))
			{
				event.preventDefault();
				document.getElementById("detach").click();
			}
			else if (event.key.match(/^[\t]$/) || event.key === 'Tab' && (!event.ctrlKey && !event.metaKey))
			{
				//Do nothing, as we look for the \s characters in the next match(). 
			}
//			else if (event.key === "S" && event.ctrlKey === true)
//			{
//				event.preventDefault();
//				document.dispatchEvent(new Event ('keydown', event));
//			}
			else if (event.key === "F2" && (!event.ctrlKey && !event.metaKey))
			{
				document.getElementById("templatename").setSelectionRange(document.getElementById("templatename").value.length,document.getElementById("templatename").value.length);
				document.getElementById("templatename").focus();
			}
			else if (event.key.match(/^[A-Za-z0-9!@#$%^&*():;"'{}\[\]<>,.?/\\|`~ \s]$/) && (!event.ctrlKey && !event.metaKey)) //Switch to the Template Name input box and start editing the name.
			// Not the plus +, equals =, or minus - signs, or arrow keys, or Underscore _
			{
				if (document.getElementById("templatename").value === "New Template")
				{
					document.getElementById("templatename").value = "";
				}
				
				document.getElementById("templatename").setSelectionRange(document.getElementById("templatename").value.length,document.getElementById("templatename").value.length);
				document.getElementById("templatename").dispatchEvent(new Event('keydown', event));
				document.getElementById("templatename").focus();
			}
	
	});
}

//load special sequence buttons

var listOfButtons=document.getElementsByClassName("specialsequences");
for (let i=0;i<listOfButtons.length;i++)
{
	for (let j=0; j<CONSTANTS.SPECIAL_SEQUENCES.length; j=j+2)
	{
		if (listOfButtons[i].id.match("insert-" + CONSTANTS.SPECIAL_SEQUENCES[j+1]))
		{
			listOfButtons[i].addEventListener('click', (event) => {
				populateSpecialSequence(j/2);
				document.getElementById("editorArea").focus();
				
				//Send the input event to the editorArea
				document.getElementById("editorArea").dispatchEvent(new Event('input'));
			});
		}
	}
}

/*
 * Functions and events to import my templates from text file
 */
//Import / Export buttons
/*
document.getElementById("import-all").addEventListener('click', (event) => {
	importTemplate(browser.tabs.getCurrent());
});

document.getElementById("export-all").addEventListener('click', (event) => {
	exportTemplate(browser.tabs.getCurrent());
});
*/
/* 
 * Adds an event listner to determine if import-file file input menu has a new file selected.
 * Import template from text file includes JSON array. Array size needs to be same with CONSTANTS.getTemplateMax().
 * Sample JSON data is at https://github.ibm.com/KENOI/case-clipboard-template.
 */
document.getElementById('import-file').addEventListener('change', async (event) => {
	var importfile = event.target;
	if (importfile.files.length > 0) {
                await setMyTemplatesSyncInProgress();
		var file = importfile.files[0];
		var reader = new FileReader();
		reader.readAsText(file);
		reader.onload = async function() { 
			try
			{			
				setDisabledSaveButton(true);

				var temp = JSON.parse(reader.result);
				if (await templateHelper.isBeImportedTemplates(temp)) {
					let message = await templateHelper.saveAllTemplates(temp);	
					
					if (message !== "")
					{
						console.log(message);
					}
					//else
					//{			
					//Perform repairs on the imported data to remove incorrectly positioned submenus and submenu items.
					await templateHelper.repairSubmenus();
					
					if (await templateHelper.checkRebuild() === true)
					{
						await chrome.storage.local.set({doRebuildMyTemplates: true,});
					}
                                        populateOptionList(true);
					setDefaultTemplateText();
					populateTemplateTitle();
                                        await new Promise(resolve => setTimeout(resolve, 100));
                                        await setMyTemplatesSyncCompleted();
                    //}
					
				} else {
					console.log('Check your json file. Array size needs to be ' + await CONSTANTS.getTemplateMax());
                                        await setMyTemplatesSyncCompleted();
				}

			}
			catch (event)
			{
				console.log('Error: JSON file could not be imported,' + event);
                                await setMyTemplatesSyncCompleted();
                setDisabledSaveButton(false);

			}
			finally
			{
				await setMyTemplatesSyncCompleted();
			}
		}

	}
});

/**
 * Create export All template data and create A link and download it to the browser
 */
async function downloadAllTemplates() {
        var template = await templateHelper.getAllTemplates();
        var data = JSON.stringify(template);
        var type = "application/json";
        var file = new Blob([data], {type: type});
        var exportfile = document.createElement("a")
        var url = URL.createObjectURL(file);
        exportfile.href = url;
        exportfile.download = CONSTANTS.TEMPLATE_FILE;
        document.body.appendChild(exportfile);
        exportfile.click();
        setTimeout(function() {
                document.body.removeChild(exportfile);
                window.URL.revokeObjectURL(url);
                }, 0);

}

/*
 * Adds an event listner to determine if export-file button is clicked.
 */
document.getElementById("export-file").addEventListener('click', (event) => {
	downloadAllTemplates();
});

/*
 * Adds an event listener to determine if new navigation buttons are clicked.
 */

if (document.getElementById("moveup") !== null)  //Prevents errors on original TemplateEditor.html
	{
		document.getElementById("moveup").addEventListener('click', async (event) => {
			
			var selectElement = document.getElementById("templatechoice");
			var selectedIndex = selectElement.selectedIndex;
			if (await templateHelper.mytemplateStatusSemaphore() === true)
			{
				selectElement.focus();
				return;
			}
			
		try {


			await templateHelper.mytemplateObtainSemaphore();
			//determine template position
			
			if (selectedIndex !== undefined && selectedIndex > 0 && selectedIndex < await CONSTANTS.getTemplateMax())
			{
				let newIndex = await templateHelper.moveUp(selectedIndex);
				
				//repopulate
				await populateOptionList(true);
								
				selectElement.selectedIndex = newIndex;
				populateTemplateTitle();

			}
			if (await templateHelper.checkRebuild() === true)
			{
				await chrome.storage.local.set({doRebuildMyTemplates: true,});
			}
		}
		catch(e)
		{
			console.log("ERROR: Click Event for 'moveup' failed to complete: " + e);
		}
		finally
		{
			selectElement.focus();
			await templateHelper.mytemplateReleaseSemaphore();
		}
		
		});
		
		document.getElementById("movedown").addEventListener('click', async (event) => {
			var selectElement = document.getElementById("templatechoice");
			var selectedIndex = selectElement.selectedIndex;
			if (await templateHelper.mytemplateStatusSemaphore() === true)
			{
				selectElement.focus();
				return;
			}
		try
		{
			await templateHelper.mytemplateObtainSemaphore();
			//determine template position
			
			if (selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex < await CONSTANTS.getTemplateMax() - 1)
			{
				let newIndex = await templateHelper.moveDown(selectedIndex);
				
				//repopulate
				await populateOptionList(true);
								
				selectElement.selectedIndex = newIndex;
				populateTemplateTitle();
			}
			if (await templateHelper.checkRebuild() === true)
			{
				await chrome.storage.local.set({doRebuildMyTemplates: true,});
			}
		}
		catch (e)
		{
			console.log("ERROR: Click Event for 'movedown' failed to complete: " + e);
		}
		finally
		{
			selectElement.focus();
			await templateHelper.mytemplateReleaseSemaphore();
		}
		});
		
		document.getElementById("movetop").addEventListener('click', async (event) => {
			var selectElement = document.getElementById("templatechoice");
			var selectedIndex = selectElement.selectedIndex;
			if (await templateHelper.mytemplateStatusSemaphore() === true)
			{
				selectElement.focus();
				return;
			}
			
			try
			{
				await templateHelper.mytemplateObtainSemaphore();
				//determine template position
				
				if (selectedIndex !== undefined && selectedIndex > 0 && selectedIndex < await CONSTANTS.getTemplateMax())
				{
					await templateHelper.moveSelectionTop(selectedIndex);
					
					//repopulate
					await populateOptionList(true);
									
					selectElement.selectedIndex = 0;
					populateTemplateTitle();
				}
				if (await templateHelper.checkRebuild() === true)
				{
					await chrome.storage.local.set({doRebuildMyTemplates: true,});
				}
			}
			catch (e)
			{
				console.log("ERROR: Click Event for 'movetop' failed to complete: " + e);
			}
			finally
			{
				selectElement.focus();
				await templateHelper.mytemplateReleaseSemaphore();
			}
		});
		
		document.getElementById("moveend").addEventListener('click', async (event) => {
			var selectElement = document.getElementById("templatechoice");
			var selectedIndex = selectElement.selectedIndex;
			if (await templateHelper.mytemplateStatusSemaphore() === true)
			{
				selectElement.focus();
				return;
			}
			
			try
			{
				await templateHelper.mytemplateObtainSemaphore();
				//determine template position
				
				if (selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex < await CONSTANTS.getTemplateMax() - 1)
				{
					await templateHelper.moveSelectionEnd(selectedIndex);
					
					//repopulate
					await populateOptionList(true);
									
					selectElement.selectedIndex = await CONSTANTS.getTemplateMax() - 1;
					populateTemplateTitle();
				}
				if (await templateHelper.checkRebuild() === true)
				{
					await chrome.storage.local.set({doRebuildMyTemplates: true,});
				}
			}
			catch (e)
			{ 
				console.log("ERROR: Click Event for 'moveend' failed to complete: " + e);
			}
			finally
			{
				selectElement.focus();
				await templateHelper.mytemplateReleaseSemaphore();
			}
		});
		
		document.getElementById("insertnewtemplate").addEventListener('click', async (event) => {
			var selectElement = document.getElementById("templatechoice");
			var selectedIndex = selectElement.selectedIndex;
			if (await templateHelper.mytemplateStatusSemaphore() === true)
			{
				selectElement.focus();
				return;
			}
			
			try
			{
				await templateHelper.mytemplateObtainSemaphore();
				//determine template position
				
				if (selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex < await CONSTANTS.getTemplateMax() - 1)
				{
					let newIndex = await templateHelper.insertTemplateAt(selectedIndex);
					
					//repopulate
					await populateOptionList(true);
									
					selectElement.selectedIndex = newIndex;
					populateTemplateTitle();
					selectElement.dispatchEvent(new Event('change'));
				}
				if (await templateHelper.checkRebuild() === true)
				{
					await chrome.storage.local.set({doRebuildMyTemplates: true,});
				}
			}
			catch (e)
			{
				console.log("ERROR: Click Event for 'insertnewtemplate' failed to complete: " + e);
			}
			finally
			{
				selectElement.focus();
				await templateHelper.mytemplateReleaseSemaphore();
			}
		});
		
		document.getElementById("insertseparator").addEventListener('click', async (event) => {
			var selectElement = document.getElementById("templatechoice");
			var selectedIndex = selectElement.selectedIndex;
			if (await templateHelper.mytemplateStatusSemaphore() === true)
			{
				selectElement.focus();
				return;
			}
			
			try
			{
				await templateHelper.mytemplateObtainSemaphore();
				//determine template position
				
				if (selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex < await CONSTANTS.getTemplateMax())
				{
					let newIndex = await templateHelper.insertTemplateAt(selectedIndex, {
						title: "Separator",
						cliptext: "",
						parentId: "mytemplate",
						type: "SEPARATOR"
						}
					);
					
					//repopulate
					await populateOptionList(true);
									
					selectElement.selectedIndex = newIndex;
					populateTemplateTitle();
					selectElement.dispatchEvent(new Event('change'));
				}
				if (await templateHelper.checkRebuild() === true)
				{
					await chrome.storage.local.set({doRebuildMyTemplates: true,});
				}
			}
			catch(e)
			{
				console.log("ERROR: Click Event for 'insertseparator' failed to complete: " + e);
			}
			finally
			{
				selectElement.focus();
				await templateHelper.mytemplateReleaseSemaphore();
			}
		});	
		
		document.getElementById("insertsubmenu").addEventListener('click', async (event) => {
			var selectElement = document.getElementById("templatechoice");
			var selectedIndex = selectElement.selectedIndex;
			if (await templateHelper.mytemplateStatusSemaphore() === true)
			{
				selectElement.focus();
				return;
			}
			
			try
			{
				await templateHelper.mytemplateObtainSemaphore();
				//determine template position
				
				if (selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex < await CONSTANTS.getTemplateMax())
				{
					let newIndex = await templateHelper.insertTemplateAt(selectedIndex, {
						title: "Submenu",
						cliptext: "",
						parentId: "mytemplate",
						type: "SUBMENU"
						}
					);
					
					//repopulate
					await populateOptionList(true);
									
					selectElement.selectedIndex = newIndex;
					populateTemplateTitle();
					selectElement.dispatchEvent(new Event('change'));
				}
				if (await templateHelper.checkRebuild() === true)
				{
					await chrome.storage.local.set({doRebuildMyTemplates: true,});
				}
			}
			catch (e)
			{
				console.log("ERROR: Click Event for 'insertsubmenu' failed to complete: " + e);
			}
			finally
			{
				selectElement.focus();
				await templateHelper.mytemplateReleaseSemaphore();
			}
		});	
			
		document.getElementById("delete").addEventListener('click', async (event) => {
			var selectElement = document.getElementById("templatechoice");
			var selectedIndex = selectElement.selectedIndex;
			if (await templateHelper.mytemplateStatusSemaphore() === true)
			{
				selectElement.focus();
				return;
			}
			
			try
			{
				await templateHelper.mytemplateObtainSemaphore();
				//determine template position
				
				if (selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex < await CONSTANTS.getTemplateMax())
				{
					await templateHelper.deleteTemplate(selectedIndex);
					
					//repopulate
					await populateOptionList(true);
									
					selectElement.selectedIndex = selectedIndex;
					populateTemplateTitle();
					selectElement.dispatchEvent(new Event('change'));
				}
				if (await templateHelper.checkRebuild() === true)
				{
					await chrome.storage.local.set({doRebuildMyTemplates: true,});
				}
			}
			catch (e)
			{
				console.log("ERROR: Click Event for 'delete' failed to complete: " + e);				
			}
			finally
			{
				selectElement.focus();
				await templateHelper.mytemplateReleaseSemaphore();
			}
		});
		
		document.getElementById("attachnearest").addEventListener('click', async (event) => {
			var selectElement = document.getElementById("templatechoice");
			var selectedIndex = selectElement.selectedIndex;
			if (await templateHelper.mytemplateStatusSemaphore() === true)
			{
				selectElement.focus();
				return;
			}
			
			try
			{
				await templateHelper.mytemplateObtainSemaphore();
				//determine template position
				
				if (selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex < await CONSTANTS.getTemplateMax())
				{
					let newIndex = await templateHelper.attachTemplateToNearestSubmenu(selectedIndex);
					
					//repopulate
					await populateOptionList(true);
									
					selectElement.selectedIndex = newIndex;
					populateTemplateTitle();
					selectElement.dispatchEvent(new Event('change'));
				}
				if (await templateHelper.checkRebuild() === true)
				{
					await chrome.storage.local.set({doRebuildMyTemplates: true,});
				}
			}
			catch (e)
			{
				console.log("ERROR: Click Event for 'attachnearest' failed to complete: " + e);
			}
			finally
			{
				selectElement.focus();
				await templateHelper.mytemplateReleaseSemaphore();
			}
		});
		
		document.getElementById("detach").addEventListener('click', async (event) => {
			var selectElement = document.getElementById("templatechoice");
			var selectedIndex = selectElement.selectedIndex;
			if (await templateHelper.mytemplateStatusSemaphore() === true)
			{
				selectElement.focus();
				return;
			}

			try
			{
				await templateHelper.mytemplateObtainSemaphore();
				//determine template position
				
				if (selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex < await CONSTANTS.getTemplateMax())
				{
					let newIndex = await templateHelper.detachTemplate(selectedIndex);
					
					//repopulate
					await populateOptionList(true);
									
					selectElement.selectedIndex = newIndex;
					populateTemplateTitle();
					selectElement.dispatchEvent(new Event('change'));
				}
				if (await templateHelper.checkRebuild() === true)
				{
					await chrome.storage.local.set({doRebuildMyTemplates: true,});
				}
			}
			catch (e)
			{
				console.log("ERROR: Click Event for 'detach' failed to complete: " + e);				
			}
			finally
			{
				selectElement.focus();
				await templateHelper.mytemplateReleaseSemaphore();
			}
		});
		
		document.getElementById("repairsubmenus").addEventListener('click', async (event) => {
			var selectElement = document.getElementById("templatechoice");
			var selectedIndex = selectElement.selectedIndex;
			if (await templateHelper.mytemplateStatusSemaphore() === true)
			{
				selectElement.focus();
				return;
			}
			
			try
			{
				await templateHelper.mytemplateObtainSemaphore();
				//determine template position
				
				if (selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex < await CONSTANTS.getTemplateMax())
				{
					let newIndex = await templateHelper.repairSubmenus();
					
					//repopulate
					await populateOptionList(true);
									
					selectElement.selectedIndex = newIndex;
					//Focus, and select the newIndex (likely element 0), as we aren't bound to be in the same element after redoing the table
					populateTemplateTitle();
					selectElement.dispatchEvent(new Event('change'));
				}
				if (await templateHelper.checkRebuild() === true)
				{
					await chrome.storage.local.set({doRebuildMyTemplates: true,});
				}
			}
			catch (e)
			{
				console.log("ERROR: Click Event for 'repairsubmenus' failed to complete: " + e);
			}
			finally
			{
				selectElement.focus();
				await templateHelper.mytemplateReleaseSemaphore();
			}
		});
		
		document.getElementById("collapseall").addEventListener('click', async (event) => {
			var selectElement = document.getElementById("templatechoice");
			var selectedIndex = selectElement.selectedIndex;
			if (await templateHelper.mytemplateStatusSemaphore() === true)
			{
				selectElement.focus();
				return;
			}
			
			try
			{
				await templateHelper.mytemplateObtainSemaphore();
				//determine template position
				
				if (selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex < await CONSTANTS.getTemplateMax())
				{
					let newIndex = await templateHelper.collapseAllBlankTemplates();
					
					//repopulate
					await populateOptionList(true);
									
					selectElement.selectedIndex = newIndex;
					//Focus, and select the newIndex (likely element 0), as we aren't bound to be in the same element after redoing the table
					populateTemplateTitle();
					selectElement.dispatchEvent(new Event('change'));
				}
				if (await templateHelper.checkRebuild() === true)
				{
					await chrome.storage.local.set({doRebuildMyTemplates: true,});
				}
			}
			catch (e)
			{
				console.log("ERROR: Click Event for 'collapseall' failed to complete: " + e);
			}
			finally
			{
				selectElement.focus();
				await templateHelper.mytemplateReleaseSemaphore();
			}
		});
		
		document.getElementById("rebuildmenu").addEventListener("click", async (event) => {
			try
			{
				await chrome.storage.local.set({mustRebuildMyTemplates: true, doRebuildMyTemplates: true,});
			}
			catch (e)
			{
				console.log("ERROR: Click Event for 'rebuildmenu' failed: " + e);
			}
		});
	}
	
if (document.getElementById("contextmenu") !== null)
{
		//Context Menu Stuff
		
		/**
		 * 
		 */
		document.getElementById("displaycontextmenu").addEventListener("click", (event) => {
				
				let newEvent = new Event("contextmenu", event);
				let buttonPosition = document.getElementById("displaycontextmenu").getBoundingClientRect();
				newEvent.pageX = buttonPosition.left;
				newEvent.pageY = buttonPosition.bottom + 1;
				document.getElementById("templatechoice").dispatchEvent(newEvent);
		});
		
		/**
		 * Event to listen to the contextmenu event on the context menu itself.  Specifically it will prevent the default operations (don't display the browser's default context menu) if the context menu isn't current visible.
		 */
		document.getElementById("contextmenu").addEventListener("contextmenu", (event) => {
			if (!document.getElementById("contextmenu").className.includes("displaynone"))
			{
				event.preventDefault();
			}
		});
				
		/**
		 * Event to listen for the contextmenu event on the entire document (intent is for tracking if everything BUT the context menu itself issues a contextmenu event).
		 * If the context menu is already displayed, simply have it disappear
		 * If the context menu is not displayed, display it at the mouse cursor position
		 * This context menu click doesn't currently register a normal click on the specific option selected in the select element (but will use the current selected element)
		 */
		document.getElementById("templatechoice").addEventListener("contextmenu", (event) => {
			event.preventDefault();
			
			
			if (!document.getElementById("contextmenu").className.includes("displaynone"))
			{
				document.getElementById("contextmenu").className = document.getElementById("contextmenu").className + " displaynone";
			}
			else
			{
				document.getElementById("contextmenu").style.left = event.pageX + "px";
				document.getElementById("contextmenu").style.top = event.pageY + "px";
				document.getElementById("contextmenu").className= document.getElementById("contextmenu").className.replace("displaynone", "").trim();
			}
			
			if (!(document.activeElement === document.getElementById("displaycontext-today")) && !document.getElementById("contextmenu-today").className.includes("displaynone"))
			{
				document.getElementById("contextmenu-today").className = document.getElementById("contextmenu-today").className + " displaynone";
			}			
			
			if (!(document.activeElement === document.getElementById("displaycontext-date")) && !document.getElementById("contextmenu-date").className.includes("displaynone"))
			{
				document.getElementById("contextmenu-date").className = document.getElementById("contextmenu-date").className + " displaynone";
			}
		
		});
		
		/**
		 * Event to listen to a regular click in the document.  Any click where the context menu is visible makes the context menu disappear
		 */
		document.addEventListener("click", (event) => {
			
			if (document.activeElement === document.getElementById("displaycontextmenu"))
			{
				try
				{
					document.getElementById("contextmenu").firstElementChild.getElementsByTagName("li")[0].focus();
				}
				catch (e)
				{
					
				}
			}
			else if (!document.getElementById("contextmenu").className.includes("displaynone"))
			{
				document.getElementById("contextmenu").className = document.getElementById("contextmenu").className + " displaynone";
			}
			
			if (!(document.activeElement === document.getElementById("displaycontext-today")) && !document.getElementById("contextmenu-today").className.includes("displaynone"))
			{
				document.getElementById("contextmenu-today").className = document.getElementById("contextmenu-today").className + " displaynone";
			}			
			
			if (!(document.activeElement === document.getElementById("displaycontext-date")) && !document.getElementById("contextmenu-date").className.includes("displaynone"))
			{
				document.getElementById("contextmenu-date").className = document.getElementById("contextmenu-date").className + " displaynone";
			}
			
		});
	
		/**
		 * Event to listen to a regular press of the Escape key in the document.  Any press of the Escape key where the context menu is visible makes the context menu disappear.
		 * The Escape key is also used on the Template Name field (to revert the template name), and additional check for the context menu visibility is done in that method as well
		 */		
		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape")
			{
				if (!document.getElementById("contextmenu").className.includes("displaynone"))
				{
					event.preventDefault();
					document.getElementById("contextmenu").className = document.getElementById("contextmenu").className + " displaynone";
				}
				if (!document.getElementById("contextmenu-today").className.includes("displaynone"))
				{
					event.preventDefault();
					document.getElementById("contextmenu-today").className = document.getElementById("contextmenu-today").className + " displaynone";
				}			
				
				if (!document.getElementById("contextmenu-date").className.includes("displaynone"))
				{
					event.preventDefault();
					document.getElementById("contextmenu-date").className = document.getElementById("contextmenu-date").className + " displaynone";
				}
							
			}
		});
		
		//Events for each element in the context menu.
		
		//Get the list of li elements in the Menu element.
		let menuitemElements = document.getElementById("contextmenu").firstElementChild.getElementsByTagName("li");
		
		for (let i=0; i<menuitemElements.length;i++)
		{
						
			if (menuitemElements[i].id == null || menuitemElements[i].id === undefined || menuitemElements[i].id === "")  //If a separator is pointed to, do this
			{
				continue;
			}
				
			let elementIdAttribute = menuitemElements[i].id.replace("menuitem-","");
			
			if (elementIdAttribute === "cut") //These are special buttons and need unique definitions rather than being redefined
			{
				
			}
			else if (elementIdAttribute === "copy") //These are special buttons and need unique definitions rather than being redefined
			{
				
			}
			else if (elementIdAttribute === "paste") //These are special buttons and need unique definitions rather than being redefined
			{

			}
			else //All other list elements (menuitems) in the contextmenu
			{
				if (document.getElementById(elementIdAttribute) != null)  //The unique formatted "menuitem-XXXXX" will have an id that matches XXXXX elsewhere in the document, so we add a listener that performs a "click" on that element.  
				{
					menuitemElements[i].addEventListener("click", (event) => {
						document.getElementById(elementIdAttribute).click();
						
						//If needed, code can go here to make the contextmenu disappear
					});
					
					menuitemElements[i].addEventListener("keydown", (event) => {
						
						if (event.key === "Enter")
						{
							document.getElementById(elementIdAttribute).click();
						}
					});
					
				}
			}
			
		}		
		
		
	//Date and Today Button Overflow Menu
	document.getElementById("displaycontext-date").addEventListener("click", (event) => {
				
			let buttonPosition = document.getElementById("date").getBoundingClientRect();
			let pageX = buttonPosition.left;
			let pageY = buttonPosition.bottom + 1 - 14;
			
			if (!document.getElementById("contextmenu-date").className.includes("displaynone"))
			{
				document.getElementById("contextmenu-date").className = document.getElementById("contextmenu-date").className + " displaynone";
			}
			else
			{
				document.getElementById("contextmenu-date").style.left = pageX + "px";
				document.getElementById("contextmenu-date").style.top = pageY + "px";
				document.getElementById("contextmenu-date").className= document.getElementById("contextmenu-date").className.replace("displaynone", "").trim();
			}
	});
	
	document.getElementById("displaycontext-today").addEventListener("click", (event) => {
				
			let buttonPosition = document.getElementById("today").getBoundingClientRect();
			let pageX = buttonPosition.left;
			let pageY = buttonPosition.bottom + 1 - 14;
			
			if (!document.getElementById("contextmenu-today").className.includes("displaynone"))
			{
				document.getElementById("contextmenu-today").className = document.getElementById("contextmenu-today").className + " displaynone";
			}
			else
			{
				document.getElementById("contextmenu-today").style.left = pageX + "px";
				document.getElementById("contextmenu-today").style.top = pageY + "px";
				document.getElementById("contextmenu-today").className= document.getElementById("contextmenu-today").className.replace("displaynone", "").trim();
			}
	});
	
	document.getElementById("today").addEventListener("click", async (event) => {
			
		document.getElementById("editorArea").focus();
		document.execCommand("insertText", false, "{today}");
			
		if (!document.getElementById("contextmenu-today").className.includes("displaynone"))
		{
			document.getElementById("contextmenu-today").className = document.getElementById("contextmenu-today").className + " displaynone";
		}
	});
		
	document.getElementById("date").addEventListener("click", async (event) => {
			
		document.getElementById("editorArea").focus();
		document.execCommand("insertText", false, "{date}");
			
		if (!document.getElementById("contextmenu-date").className.includes("displaynone"))
		{
			document.getElementById("contextmenu-date").className = document.getElementById("contextmenu-date").className + " displaynone";
		}
	});
	
	var arrayOfFupDays = [1, 2, 3, 4, 5, 6, 7, 14, 30];

	for (let i=0; i<arrayOfFupDays.length; i++)  //loop between 1 and X
	{
		try
		{
			document.getElementById("date-" + arrayOfFupDays[i]).addEventListener("click", async (event) => {
				
			document.getElementById("editorArea").focus();
			document.execCommand("insertText", false, "{date+" + arrayOfFupDays[i] + "}");
				
			if (!document.getElementById("contextmenu-date").className.includes("displaynone"))
			{
				document.getElementById("contextmenu-date").className = document.getElementById("contextmenu-date").className + " displaynone";
			}
			});
			
			document.getElementById("today-" + arrayOfFupDays[i]).addEventListener("click", async (event) => {
				
			document.getElementById("editorArea").focus();
			document.execCommand("insertText", false, "{in" + arrayOfFupDays[i] + "days}");
				
			if (!document.getElementById("contextmenu-today").className.includes("displaynone"))
			{
				document.getElementById("contextmenu-today").className = document.getElementById("contextmenu-today").className + " displaynone";
			}
			});
		}
		catch (e)
		{
			
		}
	}
	
}

//On first load, run these events
/* Populate the dropdown list
 * Set the size of the text area
 * Set the default template text (id = 0), and populate
 * Populate the template title of the selected element
 */
window.addEventListener("load", async (event) => {
	await populateOptionList(true);
	setResize();
	await setDefaultTemplateText();
	await populateTemplateTitle();
	//determineSelectedType();   //Is the current highlighted element a template, submenu, or separator
	//getSubmenuList();
	//setSubmenu();
	setDisabledSaveButton(true);
	//setDisabledChangeNameButton(false);
	//populateCollapseButtonStatus();
	//populateAddButtonStatus();
	//populateDeleteButtonStatus();
	//populateMoveButtonStatus();

});

//Triggers on resize events for the window
window.addEventListener("resize", (event) => {
	setResize();
});

//Javascript for correctly clicking the button that's hiding a label (this allows the keyboard to properly focus it, and perform the correct action to import a file)
//Technically it works without the javascript, except on the tiny 1px border of the button.  This allows for the border to be clicked as well, or if the keyboard is used.
if (document.getElementById("importbutton") !== null)
{
	document.getElementById("importbutton").addEventListener("click", (event) => {
		event.preventDefault();
		document.getElementById("import-file").click();
	});
}