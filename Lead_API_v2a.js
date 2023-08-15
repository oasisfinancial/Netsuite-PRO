function Lead_API(datain)
{
	var rtnObj = {
		success : true,
		message : "connection successful"
	};
	var data = datain;
	nlapiLogExecution("debug","Incoming Data",JSON.stringify(datain));
	send_email(data);
	try
	{

		//Lookup marketing campaign if provided
		var campaign = "";
		var customerId;
		if(datain.adgroup!=null && datain.adgroup!="")
		{
			var filters = [];
			filters.push(new nlobjSearchFilter("custrecord_pub_id",null,"is",datain.adgroup));
			var cols = [];
			cols.push(new nlobjSearchColumn("custrecord_ns_lead_source"));
			var results = nlapiSearchRecord("customrecord_pub_id_mapping",null,filters,cols);
			if(results)
			{
				campaign = results[0].getValue("custrecord_ns_lead_source");
			}
		}
		
		var estate = nlapiCreateRecord("customer");
		estate.setFieldValue("subsidiary","2");
		estate.setFieldValue("isperson","F");
		estate.setFieldValue("companyname","[TEMP] " + datain.firstname + " " + datain.lastname);
		estate.setFieldValue("category","2");
        estate.setFieldValue("custentity_source",'web services');
		estateId = nlapiSubmitRecord(estate,true,true);
		nlapiLogExecution("debug","Created estate record...",estateId);
		
		var customer = nlapiCreateRecord("customer",{recordmode:"dynamic"});
		customer.setFieldValue("subsidiary","2");
		customer.setFieldValue("isperson","T");
		customer.setFieldValue("firstname",datain.firstname);
		customer.setFieldValue("lastname",datain.lastname);
		customer.setFieldValue("phone",datain.phone);
		customer.setFieldValue("email",datain.email);
		customer.setFieldValue("category","1");
		customer.setFieldValue("custentity_infusionsoft_id",datain.infusionsoft_id);
		customer.setFieldValue("custentity_campaign",formatNull(datain.campaign));
		customer.setFieldValue("custentity_adgroup",formatNull(datain.adgroup));
		customer.setFieldValue("custentity_keyword",formatNull(datain.keyword));
		customer.setFieldValue("custentity_click_id",formatNull(datain.click_id));
		customer.setFieldValue("custentity_creative",formatNull(datain.creative));
		customer.setFieldValue("custentity_device",formatNull(datain.device));
		customer.setFieldValue("custentity_matchtype",formatNull(datain.matchtype));
		customer.setFieldValue("leadsource",campaign);
		customer.setFieldValue("parent",estateId);
      	customer.setFieldValue("custentity_source",'web services');
      try {
         customerId = nlapiSubmitRecord(customer,true,true);
		nlapiLogExecution("debug","Created customer record...",customerId);
      } catch (err) {
        nlapiLogExecution("error","Error Creating Customer","Details: " + err.message);
      }
	if(customerId){
		var caseStatusRec = nlapiCreateRecord("customrecord_case_status");
		caseStatusRec.setFieldValue("custrecord_case_status_status","1"); //Prospective
		caseStatusRec.setFieldValue("custrecord_case_status_customer",customerId);
		caseStatusRec.setFieldValue("custrecord_case_status_notes",formatNull(datain.about_case));
		var caseStatusRecId = nlapiSubmitRecord(caseStatusRec,true,true);
      nlapiLogExecution("debug",'caseStatusRecId',caseStatusRecId);
      }
	}
	catch(err)
	{
		nlapiLogExecution("error","Error Creating Customer/Estate","Details: " + err.message);
		
		rtnObj.success = false;
		rtnObj.message = err.message;
	}
	
	return rtnObj;
}

function formatNull(value)
{
	if(value==null || value=="null" || value=="" || value==undefined)
	{
		return "";
	}
	else
	{
		return value;
	}
}

function send_email(data){
	try{
		var emailBodyFile = nlapiGetContext().getSetting('SCRIPT', 'custscript_email_body_file01');
		var emailSubject = nlapiGetContext().getSetting('SCRIPT', 'custscript_lead_email_subject01');
		var customerEmail = data.email;
		var DefaultSenderText = 'Probate Advance';
	//	var empEmail = 'referral@probateadvance.com';
    	var empEmail = 'newapplication@probateadvance.com';
		var senderId;
		var emailBody=nlapiLoadFile(emailBodyFile).getValue();
		emailBody=emailBody.replace('{firstName}',data.firstname);
		emailBody=emailBody.replace('{lastName}',data.lastname);
		emailBody=emailBody.replace('{sender}',DefaultSenderText);
		senderId = 751981;
		nlapiSendEmail(senderId,[customerEmail,empEmail],emailSubject,emailBody,null,null,null,null);	
		nlapiLogExecution("debug",'email sent',customerEmail);
	}  
	catch(err){
		nlapiLogExecution("error","Error Email Send","Details: " + err.message);
	}	 
}