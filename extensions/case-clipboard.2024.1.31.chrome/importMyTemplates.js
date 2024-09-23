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

//import {setTemplateName,getTemplateName,getTemplateNames,setTemplateText,getTemplateText,getAllTemplates,isBeImportedTemplates,saveAllTemplates} from './template-helper.js';
import * as templateHelper from './template-helper.js';
import {getTemplateMax,key,link1,link2,link3,link4,link5,cpformat1,DEFAULT_SHARED_TEMPLATE,TEMPLATE_FILE} from './constants.js';
import {setMyTemplatesSyncInProgress, setMyTemplatesSyncCompleted} from './menus.js';

/* 
 * Adds an event listener to determine if import-file file input menu has a new file selected.
 * Import template from text file includes JSON array. Array size needs to be same with getTemplateMax.
 * Sample JSON data is at https://github.ibm.com/KENOI/case-clipboard-template.
 */
document.getElementById('import-file-mytemplate').addEventListener('change', async (event) => {
	document.getElementById("message").textContent="";
	
	var importfile = event.target;
	if (importfile.files.length > 0) {
                await setMyTemplatesSyncInProgress();
		var file = importfile.files[0];
		var reader = new FileReader();
		reader.readAsText(file);
		reader.onload = async function() { 
			
			try {
				
				var temp = JSON.parse(reader.result);
				if (await templateHelper.isBeImportedTemplates(temp)) {
					let message = await templateHelper.saveAllTemplates(temp);	
					
					if (message === "")
					{
						//Perform repairs on the imported data to remove incorrectly positioned submenus and submenu items.
						await templateHelper.repairSubmenus();
						
						if (await templateHelper.checkRebuild() === true)
						{
							await chrome.storage.local.set({doRebuildMyTemplates: true,});
						}
						
						document.getElementById("message").textContent="Your templates have been imported successfully.";
                                                await new Promise(resolve => setTimeout(resolve, 100));
                                                await setMyTemplatesSyncCompleted();
					}
					else
					{
						document.getElementById("message").textContent="Error: " + message;
                                                await setMyTemplatesSyncCompleted();
	
					}
					
				} else {
						document.getElementById("message").textContent="Error: Check your JSON file. Array size needs to be " + await getTemplateMax();
                                                await setMyTemplatesSyncCompleted();
				}
			}
			catch (event)
			{
				document.getElementById("message").textContent="Error: JSON file could not be imported, "+ event;
                                await setMyTemplatesSyncCompleted();
			}
			finally
			{
				await setMyTemplatesSyncCompleted();
			}
		}

	}
});

document.getElementById('import-file-mytemplate').addEventListener('click', (event) => {
	document.getElementById("message").textContent="";

});

document.getElementById('closewindow').addEventListener('click', (event) => {
	window.close();
});
