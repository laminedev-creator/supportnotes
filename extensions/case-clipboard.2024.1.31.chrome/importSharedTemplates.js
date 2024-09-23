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

import {setTemplateName,getTemplateName,getTemplateNames,setTemplateText,getTemplateText,getAllTemplates,isBeImportedTemplates,saveAllTemplates,setSharedTemplate,getSharedURL} from './template-helper.js';
import {getTemplateMax,key,link1,link2,link3,link4,link5,cpformat1,DEFAULT_SHARED_TEMPLATE,SHARED_TEMPLATE_FILE} from './constants.js';
import {setSharedTemplatesSyncInProgress, setSharedTemplatesSyncCompleted} from './menus.js';

/* 
 * Adds an event listener to determine if import-file file input menu has a new file selected.
 * Import template from text file includes JSON array. Array size needs to be same with getTemplateMax.
 * Sample JSON data is at https://github.ibm.com/KENOI/case-clipboard-template.
 */
document.getElementById('import-file-sharedtemplate').addEventListener('change', async (event) => {
	document.getElementById("message").textContent="";
	
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
					document.getElementById("message").textContent="Your templates have been imported successfully.";

				} else {
                                        await setSharedTemplatesSyncCompleted();
					document.getElementById("message").textContent="Error: Check your JSON file. Array size needs to be " + await getTemplateMax();
				}
				
			}
			catch (event)
			{
                                await setSharedTemplatesSyncCompleted();
				document.getElementById("message").textContent="Error: JSON file could not be imported, "+ event;
			}
		}

	}
});

document.getElementById('import-file-sharedtemplate').addEventListener('click', (event) => {
	document.getElementById("message").textContent="";

});

document.getElementById('closewindow').addEventListener('click', (event) => {
	window.close();
});

/*window.addEventListener('load', async (event) => {
	var linkElement = document.getElementById("sharedtemplateurl");
	linkElement.href = await getSharedURL();
	linkElement.textContent="Shared Templates Repository";
});*/
