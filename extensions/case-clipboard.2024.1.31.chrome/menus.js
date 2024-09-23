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

/**
 * This file will contain the context menus in an object array.  
 * Goal is to make this the main file to add to each main menu, and each submenu, with object arrays of objects 
 */

import {key,link1,link2,link3,link4,link5,cpformat1,DEFAULT_SHARED_TEMPLATE} from './constants.js';

//MAIN MENU
/*
 * Shared Template >
 * My Templates >
 * Template Editor...
 * Advanced Template Editor
 * --------------------------------
 * Copy Selected Text
 * Copy URL
 * Copy Title and URL
 * Copy Title, URL and Selected Text
 * Copy URL and Selected Text
 * Copy Case Number
 * ---------------------------------
 * LINK 1
 * LINK 2
 * LINK 3
 * LINK 4
 * LINK 5
 * ---------------------------------
 * Copy Citrix <-> Ecurep Path
 * Copy UNIX Path
 * Copy Citrix Path
 * Copy EAC_Access Path
 * ---------------------------------
 * Sort Tabs
 */
export let mainMenu = [
	{
	    id: "sharedtemplate",
	    title: "Shared Templates",
	    contexts: ["all"],
	},
	
	{
	    id: "mytemplate",
	    title: "My Templates",
	    contexts: ["all"],
	},
	
	{
		id: "pastetemplatetotextarea",
		title: "Automatically Paste Templates",
		contexts: ["all"],
		type: "checkbox",
		checked: false,
	},
	
	{
	    id: "mytemplate-update",
	    title: "✏️ Template Editor...",
	    contexts: ["all"],
	},

	{
	    id: "mytemplate-update-advanced",
	    title: "🖊️ Advanced Template Editor...",
	    contexts: ["all"],
	},
	
	{
	    id: "open-options",
	    title: "⚙️ Options...",
	    contexts: ["all"],
	},
	
	{
	    id: "sep-copytext",
	    type: "separator",
	    contexts: ["all"],
	},
	
	{
	    id: "copy-selected-text",
	    title: "Copy Selected Text",
	    contexts: ["selection"],
	},
	
	{
	    id: "copy-url-only-to-clipboard",
	    title: "Copy URL",
	    contexts: ["all"],
	},
	
	{
	    id: "copy-url-to-clipboard",
	    title: "Copy Title and URL",
	    contexts: ["all"],
	},
	
	{
	    id: "copy-url-text-to-clipboard",
	    title: "Copy Title, URL and Selected Text",
	    contexts: ["selection"],
	},
	
	{
	    id: "copy-url-notitle-text-to-clipboard",
	    title: "Copy URL and Selected Text",
	    contexts: ["selection"],
	},
	
	{
	    id: "copy-case-no",
	    title: "Copy Case Number",
	    contexts: ["all"],
	},
	
	{
	    id: "sep-1",
	    type: "separator",
	    contexts: ["all"],
	},
	
	{
	    id: link1.id,
	    title: "🔗 " + link1.name,
	    contexts: ["all"],
	},
	
	{
	    id: link2.id,
	    title: "🔗 " + link2.name,
	    contexts: ["all"],
	},
	
	{
	    id: link3.id,
	    title: "🔗 " + link3.name,
	    contexts: ["all"],
	},
	
	{
	    id: link4.id,
	    title: "🔗 " + link4.name,
	    contexts: ["all"],
	},
	
	{
	    id: link5.id,
	    title: "🔗 " + link5.name,
	    contexts: ["all"],
	},
	
	{
	    id: "sep-paths",
	    type: "separator",
	    contexts: ["all"],
	},
	
	{
	    id: "copy-changed-path",
	    title: "Copy Citrix <-> Ecurep path",
	    contexts: ["audio"],
	},
	
	{
	    id: "copy-unix-path",
	    title: "Copy UNIX case path",
	    contexts: ["all"],
	},
	
	{
	    id: "copy-citrix-path",
	    title: "Copy Citrix case path",
	    contexts: ["all"],
	},

        {
            id: "copy-bd-path",
            title: "Copy Blue Diamond case path",
            contexts: ["all"],
        },
	
	{
	    id: "copy-eacaccess-path",
	    title: "Copy eac_access path",
	    contexts: ["all"],
	},
	
	{
	    id: "sep-2",
	    type: "separator",
	    contexts: ["all"],
	},
	
	{
	    id: "sort-tabs",
	    title: "⥱ Sort Browser Tabs",
	    contexts: ["all"],
	},

];

/**
 * SUBMENU - Shared Templates
 */
export let sharedtemplatesMenu = [

	{
	    id: "sep-sharedtemplate-1",
	    parentId: "sharedtemplate",
	    type: "separator",
	    contexts: ["all"],
	},
	
	{
      id: "sharedtemplate-check",
      parentId: "sharedtemplate",
      title: "⇊ Sync with Shared Templates URL",
      contexts: ["all"],
	},
/*	
	{
      id: "sharedtemplate-import-file",
      parentId: "sharedtemplate",
      title: "Import All from File...",
      contexts: ["all"],
	},
	
	
	{
	    id: "sharedtemplate-export-clipboard",
	    parentId: "sharedtemplate",
	    title: "Export All to Clipboard",
	    contexts: ["all"],
	},
	
	{
      id: "sharedtemplate-import-clipboard",
      parentId: "sharedtemplate",
      title: "Import All from Clipboard",
      contexts: ["all"],
	},
*/

];


/**
 * SUBMENU - My Templates
 */
export let mytemplatesMenu = [
	
	
	// TEMPLATE MENU
	{
	    id: "sep-mytemplate-1",
	    parentId: "mytemplate",
	    type: "separator",
	    contexts: ["all"],
	},
	
/*	{
	    id: "mytemplate-update",
	    parentId: "mytemplate",
	    title: "Template Editor...",
	    contexts: ["all"],
	},
*/
	{
	    id: "rebuild-mytemplates",
	    parentId: "mytemplate",
	    title: "🔄️ Rebuld My Templates",
	    contexts: ["all"],
	},
	
	{
	    id: "sep-mytemplate-2",
	    parentId: "mytemplate",
	    type: "separator",
	    contexts: ["all"],
	},

/*	
	{
	    id: "mytemplate-export",
	    parentId: "mytemplate",
	    title: "Export All to Clipboard",
	    contexts: ["all"],
	},
	
	{
	    id: "mytemplate-import",
	    parentId: "mytemplate",
	    title: "Import All from Clipboard",
	    contexts: ["all"],
	},
	
	{
	    id: "mytemplate-export-file",
	    parentId: "mytemplate",
	    title: "Export All to File...",
	    contexts: ["all"],
	},
	
	{
	    id: "mytemplate-import-file",
	    parentId: "mytemplate",
	    title: "Import All from File...",
	    contexts: ["all"],
	},
*/	
];

export async function setSharedTemplatesCheckTitle(isSync) {
	if (!isSync) {
		await chrome.contextMenus.update('sharedtemplate-check', {
			title: "🔗 Open Shared Templates URL",
		});
	} else {
                await chrome.contextMenus.update('sharedtemplate-check', {
                        title: "⇊ Sync with Shared Templates URL",
                });
	}
}

/*
 * set SharedTemplates sync in progress
 */
export async function setSharedTemplatesSyncInProgress() {
        await chrome.contextMenus.update('sharedtemplate', {
                title: "Shared Templates (sync in progress)"
            });
}

/*
 * set SharedTemplates sync completed
 */
export async function setSharedTemplatesSyncCompleted() {
        await chrome.contextMenus.update('sharedtemplate', {
                title: "Shared Templates"
            });
}

/*
 * set MyTemplates sync in progress
 */
export async function setMyTemplatesSyncInProgress() {
        await chrome.contextMenus.update('mytemplate', {
                title: "My Templates (sync in progress)"
            });
}

/*
 * set MyTemplates sync completed
 */
export async function setMyTemplatesSyncCompleted() {
        await chrome.contextMenus.update('mytemplate', {
                title: "My Templates"
            });
}
