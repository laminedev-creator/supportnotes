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

/*
 * Retrieve case number,contact,account,subject and description from HTML
 */
export async function getCaseInformation(tab, caseno) {
	async function injectedFunction(caseno) {
		var caseInfo = new Object();
		var articles = document.querySelectorAll("article:not(.slds-card)");
		var isCaseMatch = false;
		for(var i=0; i< articles.length; i++) {
			var labels = articles[i].querySelectorAll("span.test-id__field-label");
			for (var j=0; j<labels.length; j++) {
				if (labels[j].textContent === 'Case Number') {
					var number = labels[j].parentElement.parentElement.querySelector("span.uiOutputText");
					if (number.textContent === caseno)  {
						isCaseMatch = true;
						break;
					}
				}
    			}
			if(isCaseMatch) {
				for (var j=0; j<labels.length; j++) {
					if(labels[j].textContent === 'Subject') {
						var subject = labels[j].parentElement.parentElement.querySelector("span.uiOutputText");
						if (subject !== null) {
							caseInfo.subject = subject.textContent;
						} else {
							caseInfo.subject = "**Please input case subject**";
						}
					} else if (labels[j].textContent === 'Contact Name') {
						var contact = labels[j].parentElement.parentElement.querySelector("a.forceOutputLookup");
						if (contact !== null) {
							caseInfo.contact = contact.textContent;
						} else {
							caseInfo.contact = "**Please input case contact name**";
						}
					} else if (labels[j].textContent === 'Description') {
						var description = labels[j].parentElement.parentElement.querySelector("span.uiOutputTextArea");
						if (description !== null) {
							caseInfo.description = description.textContent;
						} else {
							caseInfo.description = "**Please input case description**";
						}
					} else if (labels[j].textContent === 'Account Name') {
                                                var account = labels[j].parentElement.parentElement.querySelector("a.forceOutputLookup");
                                                if (account !== null) {
							caseInfo.account = account.textContent;
                                                } else {
							caseInfo.account = "**Please input account name**";
						}
                                        } else if (labels[j].textContent === 'Contact Phone') {
                                                var phone = labels[j].parentElement.parentElement.querySelector("span.forceOutputPhone");
                                                if (phone !== null) {
                                                        caseInfo.phone = phone.textContent;
                                                } else {
                                                        caseInfo.phone = "**Please input phone number**";
                                                }
                                        } else if (labels[j].textContent === 'Parent Case') {
                                                var parent = labels[j].parentElement.parentElement.querySelector("a.forceOutputLookup");
                                                if (parent !== null) {
                                                        caseInfo.parent = parent.textContent;
                                                } else {
                                                        caseInfo.parent = "**Please input parent case number**";
                                                }
                                        } else if (labels[j].textContent === 'Case Owner') {
                                                var caseOwner = labels[j].parentElement.parentElement.querySelector("a.forceOutputLookup");
                                                if (caseOwner !== null) {
                                                        caseInfo.caseOwner = caseOwner.textContent;
                                                } else {
                                                        caseInfo.caseOwner = "**Please input case owner name**";
                                                }
                                        }
				}
				break;
			}
		}
		return caseInfo;
	}
// ONLY CHROME START
	return await chrome.scripting.executeScript({
		target: {tabId: tab.id},
		func: injectedFunction,
		args: [caseno]
	}).then(caseInfo => {
		return caseInfo[0].result;
	});
}

/**
 * This method get case number from active inner tab of salesforce browser tab.
 * @param tab - current tab (browser tab in the window)
 */
export async function getCaseNumberFromCloseTab(tab) {
    async function injectedFunction() {
        var title = document.querySelectorAll("a.tabHeader.slds-context-bar__label-action");
        var caseno = null;
        for(var i=0; title.length; i++) {
            if(title[i].ariaSelected == "true") {
                caseno = title[i].title;
                return caseno;
            }
        }
    }
// ONLY CHROME START
    return await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: injectedFunction,
    }).then(caseno => {
        return caseno[0].result;
    });
}

/*
 * Chrome info.selectedText does not incluedes \n. So we need other way to get selected text with new lines.
 * https://bugs.chromium.org/p/chromium/issues/detail?id=116429
 */
export async function getSelectedTextWithNewLines(tab) {
  async function injectedFunction() {
      return window.getSelection().toString();
  }
  return await chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: injectedFunction,
  }).then(selected => {
        return selected[0].result;
  });
}

// This function must be called in a visible page, such as a browserAction popup
// or a content script. Calling it in a background page has no effect!
export function copyToClipboard(tab, text) {
  function injectedFunction(text) {
    try {
      navigator.clipboard.writeText(text);
      //console.log('successfully');
    } catch (e) {
      //console.log('failed');
    }
  }
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: injectedFunction,
    args: [text]
  });
}
// ONLY CHROME END


/**
 * This method injects a method to paste to an editable text box
 * @param info - context menu information (onClickedData usually)
 * @param tab - current tab
 * @param text - Text to paste (template text)
 * @returns nothing
 */
export async function pasteToTextarea(info, tab, text)
{
	
	async function pasteToTextareaInjected(info, text)
	{
		
		let whichNodeIsContentEditable = async (node) =>
		{
			let currentNode = node;
			let i=0;
			
			
			//Loop to determine if the node is contained within a contentEditable element
			//Loop ends after 10 iterations, or when the node is null or undefined
			//This is not intended to detect a textarea or input field.
			while (i < 10 && (currentNode != null && currentNode !== undefined))
			{
			
				// if the current node can be edited, return the current node.
				// We are strictly ignoring the "inherit" value.
				if (/*currentNode.isContentEditable*/ currentNode.contentEditable !== undefined && (currentNode.contentEditable === "" || currentNode.contentEditable === "true"))
				{
					return currentNode;
				}
				
				//Navigate up the DOM tree
				currentNode = currentNode.parentNode;
				
				//increment the counter
				i++;
				
			}
			
			return undefined;
		}
		
		//Determine the selection in the current window
		let selection = window.getSelection();
		let contentEditable = false;
		
		//From the selection, grab the end of the selection and determine it's element
		let element = null; 
		
		if (document.activeElement != null)
		{
			if (document.activeElement.tagName === "FRAME" || document.activeElement.tagName === "IFRAME")
			{
				// TODO: Logic for detecting frames/iframes
			}
			else if (document.activeElement.tagName === "TEXTAREA")
			{
				element = document.activeElement;
			}
		} 
		
		// If not a textarea OR a "frame", determine if the focusNode and anchorNode are within an editable element.
		if (element == null && selection != null) 
		{
			//First check the current node that is focused to see if it's editable.  
			//If it's not we also check the immediate parent node (as we may have focused on an inner element, like a <p>)
			//If neither are editable, element remains null and the code does not paste (and throws a warning to the console.log)
			if (selection.focusNode != null && selection.anchorNode != null)
			{
				// We run two loops to determine the content editable node that is a parent.
				// Checking for both the focus and anchor nodes.
				// To cut down on loop time for a failure, check focusNode first for undefined, then do the same for anchorNode
				
				//The focusNode represents where the user ended their selection (it may not be from left-to-right)
				let focusNodeParent = await whichNodeIsContentEditable(selection.focusNode);
				
				//The anchorNode represent where the user began their selection
				let anchorNodeParent = undefined; //this.whichNodeIsContentEditable(selection.anchorNode);
			
				if (focusNodeParent !== undefined) 
				{
					anchorNodeParent = await whichNodeIsContentEditable(selection.anchorNode);
					
					if (anchorNodeParent !== undefined)
					{
						//Check if the contentEditable element located by searching upward in the DOM tree are identical
						if (focusNodeParent === anchorNodeParent)
						{
							//NOTE: Selection is still used to replace/insert the template's text
							element = focusNodeParent;  //Sets the node to not-null, in this case the focusNode.
							contentEditable = true;  //Flag used later to represent the check for contentEditable is valid
						}
						else
						{
							console.log("WARNING: pasteToTextareaInjected(): The editable focus and anchor nodes do not match!");
						}	
					}
					else
					{
						console.log("WARNING: pasteToTextareaInjected(): The anchorNode validation for contentEditable element failed");						
					}
				}
				else
				{
					console.log("WARNING: pasteToTextareaInjected(): The focusNode validation for contentEditable element failed.");
				}
			}
		}
		
		
		//Perform the Paste Template Operation
		if (element != null)
		{
			//If the element is a <textarea>, use setRangeText to insert the text (if it's not disabled and not readonly).  
			if (element.tagName === "TEXTAREA")
			{
				if (!element.disabled && !element.readOnly)
				{
					element.setRangeText(text, element.selectionStart, element.selectionEnd, "end");
				}
			}
			// Check flag if the element is inside an editable element (that is not a TextArea)
			else if (contentEditable)
			{
				
				//Grabs the range from the 0th position in the selection
				let range = selection.getRangeAt(0);
				
				//Determines the current offset of the end of the selection
				//let offset = selection.focusOffset;
				
				if (!selection.isCollapsed)  // If the selection is not a single point
				{
					//delete the contents first before adding the text from the template selected
					range.deleteContents();
				}
				
				// Create a new text node containing the text, and then insert it into the selection area
				let pasteNode = document.createTextNode(text);
				
				//TODO: Possibly check for held SHIFT, CTRL, or ALT and change new-line characters accordingly.  

				range.insertNode(pasteNode);
				
				//Collapse the selection to the end
				//This doesn't work as expected when the selection wasn't a single point originally
				selection.collapseToEnd();
			
			}
			else 
			{
				console.log("WARNING: pasteToTextareaInjected(): Paste template aborted. Can only paste a template to an editable textarea or a contentEditable element.");
			}
		}
		else
		{
			console.log("WARNING: pasteToTextareaInjected(): Paste template aborted. The editable textarea or selected element could not be found!");
		}
	}
	
	//Inject the function into the page
	// ONLY CHROME START
	await chrome.scripting.executeScript({
		target: {tabId: tab.id},
		func: pasteToTextareaInjected,
		args: [info, text]
	});
	// ONLY CHROME END
	
	return;
}

export async function getShortLink(tab) {
        async function injectedFunction() {
                var link = document.querySelector("head > link[rel='shortlink']");
                var url = link ? link.href : document.URL;
                if(!url.includes("ibm.com/support/pages/")) {
                    url = document.URL;
                } else if (document.URL.includes("#")) {
                    url = url + document.URL.substring(document.URL.lastIndexOf("#"));
                }
                return url;
        }

        // ONLY CHROME START
        return await chrome.scripting.executeScript({
                target: {tabId: tab.id},
                func: injectedFunction
        }).then(url => {
                return url[0].result;
        });
        //ONLY CHROME END
}
