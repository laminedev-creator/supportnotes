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

export var TEMPLATE_ARRAY_DEFAULT_SIZE = 99;
export var templateMax = 99;
export async function getTemplateMax() {
        return templateMax;
}

export var key = new Object();
key.sep = "------";
key.owner = "**Change Owner Value in the Extension's Options**";
key.team = "**Change Team Value in the Extension's Options**";
key.schedule = "**Change Schedule Value in the Extension's Options**";
key.altowner = "";
key.altteam = "";

export var link1 = new Object();
link1.id = "case-link-1";
link1.url = "https://ibmsf.my.salesforce.com/search/SearchResults?search=Search&sen=500&str=";
link1.name = "Salesforce";

export var link2 = new Object();
link2.id = "case-link-2";
link2.url = "https://ecurep.mainz.de.ibm.com/ae5/#id=";
link2.name = "Ecurep";

export var link3 = new Object();
link3.id = "case-link-3";
link3.url = "https://w3.ibm.com/tools/caseviewer/case/";
link3.name = "Case Viewer";

export var link4 = new Object();
link4.id = "case-link-4";
link4.url = "https://windebug.mainz.de.ibm.com/Citrix/Hop1StoreWeb/{nocase}";
link4.name = "Citrix Workspace";

export var link5 = new Object();
link5.id = "case-link-5";
link5.url = "https://mscictx.svl.ibm.com/{nocase}";
link5.name = "Blue Diamond";

export var defaultDateFormat = "%A, %B %d, %Y";

export var cpformat1 = "[{title}]\\n( {url} )";

export const UNIX_PATH_PREFIX = "/ecurep/sf";

export const SPECIAL_SEQUENCES = [
	"\t", "tab",
	"{sep}", "sep",
	"{owner}", "owner",
	"{team}", "team",
	"{schedule}", "schedule",
	"{alt-owner}", "alt-owner",
	"{alt-team}", "alt-team",
	"{case-no}", "case-no",
        "{case-contact}", "case-contact",
        "{case-phone}", "case-phone",
        "{case-account}", "case-account",
        "{case-subject}", "case-subject",
        "{case-description}", "case-description"
	];

export const TEMPLATE_FILE = "mytemplate.json";
export const SHARED_TEMPLATE_FILE = "sharedtemplate.json";

export const DEFAULT_MY_TEMPLATE = "WwogIHsKICAgICJ0aXRsZSI6ICJOb3JtYWwgSW50cm9kdWN0aW9uIiwKICAgICJjbGlwdGV4dCI6ICJIZWxsbyxcblxuTXkgbmFtZSBpcyB7b3duZXJ9LCB7dGVhbX0uIEkgd2lsbCBiZSB0aGUgcHJpbWFyeSBjb250YWN0IGFzc2lzdGluZyB5b3Ugd2l0aCB0aGlzIGNhc2UuIEkgYW0gZ2VuZXJhbGx5IGF2YWlsYWJsZSBNb25kYXktRnJpZGF5IHtzY2hlZHVsZX0uXG5cblRoYW5rcyxcbntvd25lcn0iLAogICAgInR5cGUiOiAiVEVNUExBVEUiLAogICAgInBhcmVudElkIjogIm15dGVtcGxhdGUiDQogIH0sCiAgewogICAgInRpdGxlIjogIlNldjEgSW50cm9kdWN0aW9uIiwKICAgICJjbGlwdGV4dCI6ICJIZWxsbyxcblxuTXkgbmFtZSBpcyB7b3duZXJ9LCB7dGVhbX0uICBJIGFtIG5vcm1hbGx5IGF2YWlsYWJsZSB7c2NoZWR1bGV9XG5cbkkgd2lsbCBiZSB0aGUgcHJpbWFyeSBjb250YWN0IGFzc2lzdGluZyB5b3Ugd2l0aCB0aGlzIHNldmVyaXR5IDEge2Nhc2Utbm99LiBJIGFtIGdlbmVyYWxseSBhdmFpbGFibGUgTW9uZGF5LUZyaWRheSB7c2NoZWR1bGV9LiBQbGVhc2Ugbm90ZSB0aGF0IHdlIGdlbmVyYWxseSByZXNlcnZlIG91ciBzZXZlcml0eSAxIHN0YXR1cyBmb3IgcHJvZHVjdGlvbiBzeXN0ZW0gb3V0YWdlcyB3aXRoIGhpZ2ggZmluYW5jaWFsIG9yIGJ1c2luZXNzIGltcGFjdC4gSWYgdGhpcyBkb2VzIG5vdCBkZXNjcmliZSB5b3VyIHNpdHVhdGlvbiwgcGxlYXNlIGFkanVzdCB0aGUgc2V2ZXJpdHkgdG8gYSByZWFzb25hYmxlIGxldmVsIHNvIHRoYXQgd2UgbWF5IGNvbnRpbnVlIHRvIGFzc2lzdCB5b3UgZHVyaW5nIG91ciBub3JtYWwgaG91cnMgb2YgYnVzaW5lc3MuXG5cblRoYW5rcyBmb3IgdXNpbmcgSUJNLFxue293bmVyfSIsCiAgICAidHlwZSI6ICJURU1QTEFURSIsCiAgICAicGFyZW50SWQiOiAibXl0ZW1wbGF0ZSIKICB9LAogIHsKICAgICJ0aXRsZSI6ICJTaWduYXR1cmUiLAogICAgImNsaXB0ZXh0IjogIlRoYW5rcyBmb3IgdXNpbmcgSUJNIVxue293bmVyfVxue3RlYW19XG5JQk0gU3VwcG9ydCBXZWJwYWdlXG5odHRwczovL3d3dy5pYm0uY29tL215c3VwcG9ydC9zLz9sYW5ndWFnZT1lbl9VUyIsCiAgICAidHlwZSI6ICJURU1QTEFURSIsCiAgICAicGFyZW50SWQiOiAibXl0ZW1wbGF0ZSIKICB9LAogIHsKICAgICJ0aXRsZSI6ICJDYXNlIEluZm9ybWF0aW9uIiwKICAgICJjbGlwdGV4dCI6ICJDYXNlIE51bWJlciA6IHtjYXNlLW5vfVxuQ29udGFjdCBOYW1lIDoge2Nhc2UtY29udGFjdH1cbkNvbnRhY3QgUGhvbmUgOiB7Y2FzZS1waG9uZX1cbkFjY291bnQgTmFtZSA6IHtjYXNlLWFjY291bnR9XG5TdWJqZWN0IDoge2Nhc2Utc3ViamVjdH1cbntzZXB9XG5EZXNjcmlwdGlvbiA6XG57Y2FzZS1kZXNjcmlwdGlvbn0iLAogICAgInR5cGUiOiAiVEVNUExBVEUiLAogICAgInBhcmVudElkIjogIm15dGVtcGxhdGUiCiAgfSwKICB7CiAgICAidGl0bGUiOiAiTmV3IFRlbXBsYXRlIiwKICAgICJjbGlwdGV4dCI6ICIiLAogICAgInR5cGUiOiAiVEVNUExBVEUiLAogICAgInBhcmVudElkIjogIm15dGVtcGxhdGUiCiAgfSwKICB7CiAgICAidGl0bGUiOiAiTmV3IFRlbXBsYXRlIiwKICAgICJjbGlwdGV4dCI6ICIiLAogICAgInR5cGUiOiAiVEVNUExBVEUiLAogICAgInBhcmVudElkIjogIm15dGVtcGxhdGUiCiAgfSwKICB7CiAgICAidGl0bGUiOiAiTmV3IFRlbXBsYXRlIiwKICAgICJjbGlwdGV4dCI6ICIiLAogICAgInR5cGUiOiAiVEVNUExBVEUiLAogICAgInBhcmVudElkIjogIm15dGVtcGxhdGUiCiAgfSwKICB7CiAgICAidGl0bGUiOiAiTmV3IFRlbXBsYXRlIiwKICAgICJjbGlwdGV4dCI6ICIiLAogICAgInR5cGUiOiAiVEVNUExBVEUiLAogICAgInBhcmVudElkIjogIm15dGVtcGxhdGUiCiAgfSwKICB7CiAgICAidGl0bGUiOiAiTmV3IFRlbXBsYXRlIiwKICAgICJjbGlwdGV4dCI6ICIiLAogICAgInR5cGUiOiAiVEVNUExBVEUiLAogICAgInBhcmVudElkIjogIm15dGVtcGxhdGUiCiAgfSwKICB7CiAgICAidGl0bGUiOiAiTmV3IFRlbXBsYXRlIiwKICAgICJjbGlwdGV4dCI6ICIiLAogICAgInR5cGUiOiAiVEVNUExBVEUiLAogICAgInBhcmVudElkIjogIm15dGVtcGxhdGUiCiAgfSwKICB7CiAgICAidGl0bGUiOiAiTmV3IFRlbXBsYXRlIiwKICAgICJjbGlwdGV4dCI6ICIiLAogICAgInR5cGUiOiAiVEVNUExBVEUiLAogICAgInBhcmVudElkIjogIm15dGVtcGxhdGUiCiAgfSwKICB7CiAgICAidGl0bGUiOiAiTmV3IFRlbXBsYXRlIiwKICAgICJjbGlwdGV4dCI6ICIiLAogICAgInR5cGUiOiAiVEVNUExBVEUiLAogICAgInBhcmVudElkIjogIm15dGVtcGxhdGUiCiAgfSwKICB7CiAgICAidGl0bGUiOiAiTmV3IFRlbXBsYXRlIiwKICAgICJjbGlwdGV4dCI6ICIiLAogICAgInR5cGUiOiAiVEVNUExBVEUiLAogICAgInBhcmVudElkIjogIm15dGVtcGxhdGUiCiAgfSwKICB7CiAgICAidGl0bGUiOiAiTmV3IFRlbXBsYXRlIiwKICAgICJjbGlwdGV4dCI6ICIiLAogICAgInR5cGUiOiAiVEVNUExBVEUiLAogICAgInBhcmVudElkIjogIm15dGVtcGxhdGUiCiAgfSwKICB7CiAgICAidGl0bGUiOiAiTmV3IFRlbXBsYXRlIiwKICAgICJjbGlwdGV4dCI6ICIiLAogICAgInR5cGUiOiAiVEVNUExBVEUiLAogICAgInBhcmVudElkIjogIm15dGVtcGxhdGUiCiAgfSwKICB7CiAgICAidGl0bGUiOiAiTmV3IFRlbXBsYXRlIiwKICAgICJjbGlwdGV4dCI6ICIiLAogICAgInR5cGUiOiAiVEVNUExBVEUiLAogICAgInBhcmVudElkIjogIm15dGVtcGxhdGUiCiAgfSwKICB7CiAgICAidGl0bGUiOiAiTmV3IFRlbXBsYXRlIiwKICAgICJjbGlwdGV4dCI6ICIiLAogICAgInR5cGUiOiAiVEVNUExBVEUiLAogICAgInBhcmVudElkIjogIm15dGVtcGxhdGUiCiAgfSwKICB7CiAgICAidGl0bGUiOiAiTmV3IFRlbXBsYXRlIiwKICAgICJjbGlwdGV4dCI6ICIiLAogICAgInR5cGUiOiAiVEVNUExBVEUiLAogICAgInBhcmVudElkIjogIm15dGVtcGxhdGUiCiAgfSwKICB7CiAgICAidGl0bGUiOiAiTmV3IFRlbXBsYXRlIiwKICAgICJjbGlwdGV4dCI6ICIiLAogICAgInR5cGUiOiAiVEVNUExBVEUiLAogICAgInBhcmVudElkIjogIm15dGVtcGxhdGUiCiAgfSwKICB7CiAgICAidGl0bGUiOiAiTmV3IFRlbXBsYXRlIiwKICAgICJjbGlwdGV4dCI6ICIiLA0KICAgICJ0eXBlIjogIlRFTVBMQVRFIiwNCiAgICAicGFyZW50SWQiOiAibXl0ZW1wbGF0ZSIKICB9Cl0K";

export const DEFAULT_SHARED_URL = "https://pages.github.ibm.com/KENOI/case-clipboard-template/sharedtemplates.json";

export const DEFAULT_SHARED_TEMPLATE = "W3sidGl0bGUiOiJOZXcgQ2FzZSBJbnRyb2R1Y3Rpb24gd2l0aCBkZXNjcmlwdGlvbiIsImNsaXB0ZXh0IjoiSGVsbG8gLFxuXG5JIGFtIHtvd25lcn0gd2l0aCB7dGVhbX0sIGFzc2lzdGluZyB5b3Ugb25cblxuQ2FzZSBOdW1iZXIgOiB7Y2FzZS1ub31cblxuTXkgbm9ybWFsIHdvcmtkYXkgYXZhaWxhYmlsaXR5IGlzIGZyb20ge3NjaGVkdWxlfS4gSWYgeW91IHdvdWxkIHByZWZlciB0byB3b3JrIHdpdGggc29tZW9uZSB3aG8gaGFzIGEgZGlmZmVyZW50IHdvcmtkYXkgYXZhaWxhYmlsaXR5LCBwbGVhc2UgbGV0IHVzIGtub3cgd2hhdCBob3VycyB5b3UgcHJlZmVyIGFuZCBJIHdpbGwgYXNzaWduIHRoaXMgY2FzZSB0byBhIGNvbGxlYWd1ZSB3aG8gd29ya3MgdGhlIHJlcXVlc3RlZCBob3Vycy5cbkkgd2lsbCByZXZpZXcgdGhlIGluZm9ybWF0aW9uIHByb3ZpZGVkIGFuZCB1cGRhdGUgeW91IGFzYXAuIFxuXHRcbjxpZiB3ZSBoYXZlIHRoZSBkYXRhIHRvIHJldmlldz5cblxuPEFkZCBhbnkgcXVlc3Rpb25zIGJhc2VkIG9uIHByb2JsZW0gZGVzY3JpcHRpb24gYW5kIHJlcXVlc3Qgb2YgZG9jcyBpZiB0aGVyZSBhcmUgbm9uZT5cblxuTGV0IG1lIGtub3cgaWYgeW91IGhhdmUgYW55IHF1ZXN0aW9uc1xuVGhhbmtzIGFuZCBSZWdhcmRzXG57b3duZXJ9XG57dGVhbX1cbiJ9LHsidGl0bGUiOiJOZXcgQ2FzZSBJbnRyb2R1Y3Rpb24gc2ltcGxlIiwiY2xpcHRleHQiOiJIZWxsbyxcblxuTXkgbmFtZSBpcyB7b3duZXJ9LCB7dGVhbX0gRW5naW5lZXIuIEkgd2lsbCBiZSB0aGUgcHJpbWFyeSBjb250YWN0IGFzc2lzdGluZyB5b3Ugd2l0aCB0aGlzIGNhc2UuIEkgYW0gZ2VuZXJhbGx5IGF2YWlsYWJsZSBNb25kYXktRnJpZGF5IHtzY2hlZHVsZX0uXG5cblRoYW5rcyxcbntvd25lcn1cbiJ9LHsidGl0bGUiOiJTZXYxIEludHJvZHVjdGlvbiIsImNsaXB0ZXh0IjoiSGVsbG8sXG5cbk15IG5hbWUgaXMge293bmVyfSwge3RlYW19IEVuZ2luZWVyLlxuXG5JIHdpbGwgYmUgdGhlIHByaW1hcnkgY29udGFjdCBhc3Npc3RpbmcgeW91IHdpdGggdGhpcyBzZXZlcml0eSAxIGNhc2UuIEkgYW0gZ2VuZXJhbGx5IGF2YWlsYWJsZSBNb25kYXktRnJpZGF5IHtzY2hlZHVsZX0uIFBsZWFzZSBub3RlIHRoYXQgd2UgZ2VuZXJhbGx5IHJlc2VydmUgb3VyIHNldmVyaXR5IDEgc3RhdHVzIGZvciBwcm9kdWN0aW9uIHN5c3RlbSBvdXRhZ2VzIHdpdGggaGlnaCBmaW5hbmNpYWwgb3IgYnVzaW5lc3MgaW1wYWN0LiBJZiB0aGlzIGRvZXMgbm90IGRlc2NyaWJlIHlvdXIgc2l0dWF0aW9uLCBwbGVhc2UgYWRqdXN0IHRoZSBzZXZlcml0eSB0byBhIHJlYXNvbmFibGUgbGV2ZWwgc28gdGhhdCB3ZSBtYXkgY29udGludWUgdG8gYXNzaXN0IHlvdSBkdXJpbmcgb3VyIG5vcm1hbCBob3VycyBvZiBidXNpbmVzcy5cblxuVGhhbmtzIGZvciB1c2luZyBJQk0sXG57b3duZXJ9XG4ifSx7InRpdGxlIjoiRm9sbG93IFVwIHdpdGggY2FzZSBkZXNjcmlwdGlvbiIsImNsaXB0ZXh0IjoiSGVsbG8gLFxuXG5JIGFtIGZvbGxvd2luZyB1cCBvbiB0aGUgQ2FzZSBOdW1iZXI6IHtjYXNlLW5vfSAgICx3aGljaCB3YXMgb3BlbmVkIGZvciB7Y2FzZS1zdWJqZWN0fSAuIEkgd291bGQgYXBwcmVjaWF0ZSB5b3VyIHRpbWUgb24gcHJvdmlkaW5nIHN0YXR1cyBvZiB0aGUgY2FzZS5cbklmIHlvdSBoYXZlIGZ1cnRoZXIgcXVlc3Rpb25zIGxldCB1cyBrbm93LlxuXG5UaGFua3MgYW5kIFJlZ2FyZHNcbntvd25lcn1cbnt0ZWFtfVxuIn0seyJ0aXRsZSI6IkZvbGxvdyBVcCB3aXRoIGRhdGUiLCJjbGlwdGV4dCI6IkhlbGxvLFxuXG5Eb2VzIHlvdXIgdGVhbSBoYXZlIGFueSB1cGRhdGVzLCBxdWVzdGlvbnMsIG9yIGNvbmNlcm5zIHdpdGggcmVnYXJkIHRvIHRoaXMgaXNzdWU/XG5cbklmIEkgZG8gbm90IHJlY2VpdmUgYW4gdXBkYXRlIGZyb20geW91ciB0ZWFtIGJ5IFtGT0xMT1cgVVAgREFURV0sIEkgbXVzdCBhc3N1bWUgdGhhdCB5b3VyIHJlcG9ydGVkIGlzc3VlIGhhcyBiZWVuIHJlc29sdmVkIGFuZCB0aGF0IHlvdSBubyBsb25nZXIgcmVxdWlyZSBhc3Npc3RhbmNlIGZyb20gSUJNIHN1cHBvcnQuIFRoZSBjYXNlIHdpbGwgYmUgY2xvc2VkIGR1ZSB0byBleHRlbmRlZCBpbmFjdGl2aXR5LCBhbmQgbWF5IGJlIHJlb3BlbmVkIHdpdGhpbiAzMCBkYXlzIGlmIHlvdSBjaG9vc2UgdG8gY29udGludWUgdGhlIGludmVzdGlnYXRpb24uXG5cblRoYW5rcyxcbntvd25lcn1cbiJ9LHsidGl0bGUiOiJGb2xsb3cgVXAgc2ltcGxlIiwiY2xpcHRleHQiOiJIaSwgdGhpcyBpcyB7b3duZXJ9LCBmb2xsb3dpbmcgdXAgd2l0aCB5b3Ugb24gLlxuXG57Y2FzZS1ub31cblxuRG8geW91IG9uIGFueSB1cGRhdGVzIHlvdSBoYXZlIGZvciB1cyBvbiB0aGlzIGNhc2UsIGFzIGl0J3MgYmVlbiBzb21lIHRpbWUgc2luY2UgdGhlcmUgaGFkIGJlZW4gYW55IGNvcnJlc3BvbmRlbmNlIG9yIHVwZGF0ZXMuICBQbGVhc2UgcHJvdmlkZSBhbiB1cGRhdGUgd2hlbiB5b3UgaGF2ZSBhIG1vbWVudCBzbyB0aGF0IHdlIGNhbiBjb250aW51ZSB0byB3b3JrIHdpdGggeW91IHRvIHJlc29sdmUgdGhlIGlzc3VlcyByZXBvcnRlZC5cblxuSWYgdGhlIGNhc2UgaXMgbm90IHJlc3BvbmRlZCB0byB3aGVuIEkgY2hlY2sgYmFjayBpbiwgdGhlIGNhc2UgbWF5IGNsb3NlIHdpdGggYSAzMCBkYXkgcmV0ZW50aW9uIChpbiB3aGljaCB0aGUgY2FzZSBjYW4gYmUgcmVvcGVuZWQpLlxuXG5UaGFua3MgZm9yIHVzaW5nIElCTSFcbntvd25lcn1cbnt0ZWFtfVxuIn0seyJ0aXRsZSI6IkNsb3NlIE5vdGlmaWNhdGlvbiIsImNsaXB0ZXh0IjoiSGVsbG8ge2Nhc2UtY29udGFjdH0sXG5cbkkgYW0gY2xvc2luZyB0aGUgQ2FzZSBOdW1iZXI6IHtjYXNlLW5vfSAgICx3aGljaCB3YXMgb3BlbmVkIGZvciB7Y2FzZS1zdWJqZWN0fSBhcyBhZ3JlZWQgb3IgPHJlcGxhY2UgaWYgdGhpcyBpcyBpbmFjdGl2ZSBjYXNlOiBzaW5jZSB3ZSBkaWRuJ3QgaGVhciBiYWNrIGZyb20geW91IGZvciBsYXN0IHRocmVlIGZvbGxvd3VwJ3MgYXMgcGVyIHByb2Nlc3M+IC4gXG5cbkN1c3RvbWVyIHNhdGlzZmFjdGlvbiBpcyB0b3AgcHJpb3JpdHkgZm9yIElCTS4gSWYgZm9yIGFueSByZWFzb24geW91IGFyZSBub3QgY29tcGxldGVseSBzYXRpc2ZpZWQgd2l0aCB0aGUgcmVzb2x1dGlvbiBhbmQgc3VwcG9ydCB0aGF0IEkgcHJvdmlkZWQsIHBsZWFzZSBjb250YWN0IG1lIGltbWVkaWF0ZWx5IHNvIHRoYXQgd2UgbWF5IHJlc29sdmUgaXQgYXMgcXVpY2tseSBhcyBwb3NzaWJsZS4gQXMgcGVyIHlvdXIgdXBkYXRlLCBJIHdpbGwgc2VuZCB0aGlzIGNhc2UgZm9yIGNsb3N1cmUuIFlvdSBtYXkgYmUgcmVjZWl2aW5nIGEgc3VydmV5IHdpdGhpbiB0aGUgbmV4dCA3IGRheXMgZnJvbSBJQk0gY29uY2VybmluZyB5b3VyIHJlY2VudCBzdXBwb3J0IGV4cGVyaWVuY2UuIFdlIHdvdWxkIGdyZWF0bHkgYXBwcmVjaWF0ZSB5b3UgdGFraW5nIHRoZSB0aW1lIHRvIGNvbXBsZXRlIHRoaXMgc2hvcnQgc3VydmV5LiBJZiB3ZSBkaWQgcHJvdmlkZSB5b3Ugd2l0aCBleGNlbGxlbnQgc3VwcG9ydCBhbmQgY3VzdG9tZXIgY2FyZSwgcGxlYXNlIHJlY29tbWVuZCB1cyB0byBvdGhlcnMgeW91IGtub3cuIEl0J3MgdGhlIGJlc3QgY29tcGxpbWVudCB5b3UgY2FuIGdpdmUuXG5cbklmIHlvdSBoYXZlIGZ1cnRoZXIgcXVlc3Rpb25zIGxldCB1cyBrbm93LlxuXG5UaGFua3MgYW5kIFJlZ2FyZHNcbntvd25lcn1cbnt0ZWFtfVxuIn0seyJ0aXRsZSI6Ik5ldyBUZW1wbGF0ZSIsImNsaXB0ZXh0IjoiIn0seyJ0aXRsZSI6Ik5ldyBUZW1wbGF0ZSIsImNsaXB0ZXh0IjoiIn0seyJ0aXRsZSI6Ik5ldyBUZW1wbGF0ZSIsImNsaXB0ZXh0IjoiIn0seyJ0aXRsZSI6Ik5ldyBUZW1wbGF0ZSIsImNsaXB0ZXh0IjoiIn0seyJ0aXRsZSI6Ik5ldyBUZW1wbGF0ZSIsImNsaXB0ZXh0IjoiIn0seyJ0aXRsZSI6Ik5ldyBUZW1wbGF0ZSIsImNsaXB0ZXh0IjoiIn0seyJ0aXRsZSI6Ik5ldyBUZW1wbGF0ZSIsImNsaXB0ZXh0IjoiIn0seyJ0aXRsZSI6Ik5ldyBUZW1wbGF0ZSIsImNsaXB0ZXh0IjoiIn0seyJ0aXRsZSI6Ik5ldyBUZW1wbGF0ZSIsImNsaXB0ZXh0IjoiIn0seyJ0aXRsZSI6Ik5ldyBUZW1wbGF0ZSIsImNsaXB0ZXh0IjoiIn0seyJ0aXRsZSI6Ik5ldyBUZW1wbGF0ZSIsImNsaXB0ZXh0IjoiIn0seyJ0aXRsZSI6Ik5ldyBUZW1wbGF0ZSIsImNsaXB0ZXh0IjoiIn0seyJ0aXRsZSI6Ik5ldyBUZW1wbGF0ZSIsImNsaXB0ZXh0IjoiIn1dCg==";
