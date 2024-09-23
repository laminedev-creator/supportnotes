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
 * Asynchronous function to return the custom date option
 * @returns The date syntax or a blank string (null and undefined return blank) from storage
 */
export async function getCustomDate()
{

        const read = async () => {
              return new Promise((resolve) => {
                  chrome.storage.local.get({['customdate']: "" }, function(items)
        {
              for (const [key, value] of Object.entries(items)) {
                  if (key.startsWith('customdate')) {
					  
					  if (items[key] === undefined || items[key] == null)
					  { 
						  resolve("");
					  }
					  else
					  {
                     	resolve(items[key]);
                      }
                  }
              }
              
              //if no match is found, return a blank string.
              resolve("");
        });
        }
        )};

        const customDate = await read();

        return customDate;
}

/**
 * Asynchronous function to set the date syntax
 * @param dateformat The date format syntax to store (set in Options panel)
 */
export async function setCustomDate(dateformat) 
{
	//If the title is an empty string or just space or other related characters, set the template title to New Template
	//This avoids an issue on Chrome where the Templates Menu doesn't reload.  This is not an issue on Firefox but the code can remain for both
    if (dateformat === null || dateformat === undefined || dateformat === "" || dateformat.match(/^[ \t\r\n\f]*$/)) 
	{
		await chrome.storage.local.set({['customdate']:""});
	}
	else
	{
		await chrome.storage.local.set({['customdate']:dateformat});
	}
}

/**
 * Asynchronous function to return the custom date option
 * @returns The date syntax or a blank string (null and undefined return blank) from storage
 */
export async function getCustomLocale()
{

        const read = async () => {
              return new Promise((resolve) => {
                  chrome.storage.local.get({['customlocale']: navigator.language }, function(items)
        {
              for (const [key, value] of Object.entries(items)) {
                  if (key.startsWith('customlocale')) {
					  
					  if (items[key] === undefined || items[key] == null)
					  { 
						  resolve(navigator.language);
					  }
					  else
					  {
                     	resolve(items[key]);
                      }
                  }
              }
              
              //if no match is found, return a blank string.
              resolve(navigator.language);
        });
        }
        )};

        const customLocale = await read();

        return customLocale;
}

/**
 * Asynchronous function to set the locale
 * @param dateformat The locale to store (set in Options panel)
 */
export async function setCustomLocale(locale) 
{
	//If the title is an empty string or just space or other related characters, set the template title to New Template
	//This avoids an issue on Chrome where the Templates Menu doesn't reload.  This is not an issue on Firefox but the code can remain for both
    if (locale === null || locale === undefined || locale === "" || locale.match(/^[ \t\r\n\f]*$/)) 
	{
		await chrome.storage.local.set({['customlocale']:navigator.language});
	}
	else
	{
		await chrome.storage.local.set({['customlocale']:locale});
	}
}

/**
 * Function that replaces the date using the format string provided.  
 * @param indays 
 * @param locale (optional, leave as blank string or null if format is needed) (no check is done on the locale)
 * @param format (optional)
 */
export async function replaceDate(indays, locale, format)
{
	if (format === undefined || format == null)
	{
		format = await getCustomDate();
	}
	
	let date = new Date();
	
	if (indays === undefined || indays == null)
	{
		indays = 0;
	}
	
	if (indays < 0)
	{
		
		indays = 0;
	}
	
	if (locale === undefined || locale == null || locale === "" || locale.match(/^[ \t\r\n\f]*$/))
	{
		locale = navigator.language;
	}
	
    date.setDate(date.getDate() + indays);
    
//    if (getOnlyWorkdays())
//    {
	    if (date.getDay() == 6) //Saturday
	    {
			date.setDate(date.getDate() + 2)
		}
		
	    if (date.getDay() == 0) //Sunday
	    {
			date.setDate(date.getDate() + 1)
		}
	
//	}

    format = format.replace(/%A/g, date.toLocaleDateString(locale, { weekday: 'long' }));
    format = format.replace(/%a/g, date.toLocaleDateString(locale, { weekday: 'short' }));
    format = format.replace(/%B/g, date.toLocaleDateString(locale, { month: 'long' }));
    format = format.replace(/%b/g, date.toLocaleDateString(locale, { month: 'short' }));
    format = format.replace(/%m/g, ('0' + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/%d/g, ('0' + date.getDate()).slice(-2));
    format = format.replace(/%e/g, date.getDate());
    format = format.replace(/%H/g, ('0' + date.getHours()).slice(-2));
    format = format.replace(/%k/g, date.getHours());
    format = format.replace(/%M/g, ('0' + date.getMinutes()).slice(-2));
    format = format.replace(/%S/g, ('0' + date.getSeconds()).slice(-2));
    format = format.replace(/%Y/g, date.getFullYear());
    
    return format;
}

/**
 * Function that generates the date based on Javascript Date calls
 * @param locale The locale to use (NOTE: this function doesn't do validation on the locale)
 * @param indays The number of days after the current date to calculate (the function will skip forward for weekend days by default)
 * @returns
*/
export function getLocaleDateStringInDays(locale, indays) 
{
        var today = new Date();
        today.setDate(today.getDate() + indays);
        
	    if (locale === null || locale === undefined || locale === "" || locale.match(/^[ \t\r\n\f]*$/)) 
	    {
			locale = navigator.language;
		}

		if (indays === undefined || indays == null)
		{
			indays = 0;
		}
		
		if (indays < 0)
		{
			
			indays = 0;
		}
        
//    if (getOnlyWorkdays())
//    {
	    if (today.getDay() == 6) //Saturday
	    {
			today.setDate(today.getDate() + 2)
		}
		
	    if (today.getDay() == 0) //Sunday
	    {
			today.setDate(today.getDate() + 1)
		}
	
//	}

        return today.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });
}

/** Check if locale is supported by Date.toLocalDateString function
 * @param locale String representing a valid local like ja-JP or en-US
 * @returns Either the locale that was passed in, or navigator.language if not valid
 */
export function getValidLocale(locale)
{
	
	//If locale is not defined, null, or is a blank string, return navigator.language
	if (locale === undefined || locale == null || locale === "" || locale.match(/^[ \t\r\n\f]*$/))
	{
		return navigator.language;
	}
	
  try {
    if (locale.startsWith('locale')) {
      return navigator.language;
    }
    
    //This test will return an error if not valid, in which case we perform the catch statement to return navigator.language
    new Date().toLocaleDateString(locale);
  } catch (e) {
    return navigator.language;
  }
  return locale;
}