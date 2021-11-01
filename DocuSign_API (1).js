var accountId = "4059025";
var envelopeId = "9dbaa082-feff-4ef0-9434-daf78b104339";
var templateId = "af18e1b6-1ff7-4faf-9ee2-34707c463f76";

function DocuSign_API(request,response)
{
	//Authenticate to DocuSign and get Base URL
	var authPayload = {
		Username : "travis@ioncloudsolutions.com",
		Password : "Collin16**!",
		IntegratorKey : "0747e390-d970-4fed-ad83-ed2568b8f70d"
	};
	
	var url = "https://demo.docusign.net/restapi/v2/accounts/" + accountId + "/envelopes/";
	
	var headers = new Object();
	headers["X-DocuSign-Authentication"] = JSON.stringify(authPayload);
	headers["Content-Type"] = "application/json";
	headers["Accept"] = "*/*";
	
	var quoteId = request.getParameter("quote");
	
	var filters = [];
	filters.push(new nlobjSearchFilter("internalid",null,"is",quoteId));
	filters.push(new nlobjSearchFilter("mainline",null,"is","T"));
	var cols = [];
	cols.push(new nlobjSearchColumn("trandate"));
	cols.push(new nlobjSearchColumn("custbody_rebate_1_month"));
	cols.push(new nlobjSearchColumn("custbody_rebate_2_month"));
	cols.push(new nlobjSearchColumn("custbody_rebate_3_month"));
	cols.push(new nlobjSearchColumn("custbody_option_1_pricing"));
	cols.push(new nlobjSearchColumn("custbody_option_2_pricing"));
	cols.push(new nlobjSearchColumn("custbody_option_3_pricing"));
	cols.push(new nlobjSearchColumn("custbody_case_no"));
	cols.push(new nlobjSearchColumn("custbody_heir_first_name"));
	cols.push(new nlobjSearchColumn("custbody_heir_last_name"));
	cols.push(new nlobjSearchColumn("custbody_assignment_size"));
	cols.push(new nlobjSearchColumn("custbody_decedent_name"));
	cols.push(new nlobjSearchColumn("custbody_bill_address_1"));
	cols.push(new nlobjSearchColumn("custbody_bill_city"));
	cols.push(new nlobjSearchColumn("custbody_bill_state"));
	cols.push(new nlobjSearchColumn("custbody_bill_zip_code"));
	cols.push(new nlobjSearchColumn("custbody_advance_size"));
	var results = nlapiSearchRecord("estimate",null,filters,cols);
	
	var createPayload = {
		emailSubject : "Please sign this from Probate Advance",
		templateId : templateId,
		templateRoles : [{
			email : "travis@ioncloudsolutions.com",
			name : "Travis Buffington",
			roleName : "Customer",
			tabs : {
				textTabs : [
					{tabLabel:"probate_date",value:results[0].getValue("trandate")},
					{tabLabel:"probate_firstname_lastname",value:results[0].getValue("custbody_heir_first_name") + " " + results[0].getValue("custbody_heir_last_name")},
					{tabLabel:"probate_address",value:results[0].getValue("custbody_bill_address_1")},
					{tabLabel:"probate_city_state_zip",value:results[0].getValue("custbody_bill_city") + ", " + results[0].getValue("custbody_bill_state") + results[0].getValue("custbody_bill_zip_code")},
					{tabLabel:"probate_cash_amount",value:results[0].getValue("custbody_advance_size")},
					{tabLabel:"probate_decedent",value:results[0].getValue("custbody_decedent_name")},
					{tabLabel:"probate_case_number",value:results[0].getValue("custbody_case_no")}
				]
			}
		}],
		status : "sent",
		eventNotification : {
			url : "https://5295340.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=216&deploy=1&compid=5295340&h=bd0dec5ea3de48725f6a",
			includeDocumentFields : true,
			requireAcknowledgment : false,
			envelopeEvents : [{
				envelopeEventStatusCode: "completed"
			}]
		}
	}
	
	if(results[0].getValue("custbody_rebate_1_month")!=null && results[0].getValue("custbody_rebate_1_month")!="")
	{
		createPayload.templateRoles[0].tabs.textTabs.push({
			tabLabel : "probate_rebate_1_time",
			value : "Assign to Probate Advance, if paid within " + results[0].getValue("custbody_rebate_1_month") + " months"
		});
	}
	
	if(results[0].getValue("custbody_rebate_2_month")!=null && results[0].getValue("custbody_rebate_2_month")!="")
	{
		createPayload.templateRoles[0].tabs.textTabs.push({
			tabLabel : "probate_rebate_2_time",
			value : "Assign to Probate Advance, if paid within " + results[0].getValue("custbody_rebate_2_month") + " months"
		});
	}
	
	if(results[0].getValue("custbody_rebate_3_month")!=null && results[0].getValue("custbody_rebate_3_month")!="")
	{
		createPayload.templateRoles[0].tabs.textTabs.push({
			tabLabel : "probate_rebate_3_time",
			value : "Assign to Probate Advance, if paid within " + results[0].getValue("custbody_rebate_3_month") + " months"
		});
	}
	
	var cResp = nlapiRequestURL(url,JSON.stringify(createPayload),headers);
	
	nlapiLogExecution("debug","Response Code",cResp.getCode());
	nlapiLogExecution("debug","Response Body",cResp.getBody());
	
	if(cResp.getBody()!=null && cResp.getBody()!="")
	{
		var envelope = JSON.parse(cResp.getBody());
		
		//Handle looking up custom fields for credit card details and customer information
		
	}
}

function Docusign_Webhook(request,response)
{
	nlapiLogExecution("debug","METHOD",request.getMethod());
	nlapiLogExecution("debug","Response Body",request.getBody());
	
	//Log Parameters
	var params = request.getAllParameters();
	
	for(param in params)
	{
		nlapiLogExecution("debug","Parameter: " + param,"Value: " + params[param]);
	}
	
	//Log Header Values
	var headers = request.getAllHeaders();
	
	for(header in headers)
	{
		nlapiLogExecution("debug","Header: " + header,"Value: " + headers[header]);
	}
	
}
