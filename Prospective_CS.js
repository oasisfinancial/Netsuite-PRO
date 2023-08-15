function Prospective_CS_FC(type,name,linenum)
{
	if(type=="custpage_deals" && name=="custpage_marketing_channel")
	{
		try
		{
			var marketingChannel = nlapiGetCurrentLineItemValue("custpage_deals","custpage_marketing_channel");
			
			var customerId = nlapiGetCurrentLineItemValue("custpage_deals","custpage_customer_internalid");
			
			if(customerId!=null && customerId!="")
				nlapiSubmitField("customer",customerId,"leadsource",marketingChannel);
		}
		catch(err)
		{
			nlapiLogExecution("error","Error Updating Marketing Channel","Details: " + err.message);
			console.log("Error - " + err.message);
		}
	}
	else if(type=="custpage_deals" && (name=="custpage_customer_first_name" || name=="custpage_customer_last_name" || name=="custpage_phone" || name=="custpage_email"||name=="custpage_sales_rep"))
	{
		try
		{
			var fieldValue = nlapiGetCurrentLineItemValue("custpage_deals",name);
			var customerId = nlapiGetCurrentLineItemValue("custpage_deals","custpage_customer_internalid");
			
			var fieldToUpdate = null;
			switch(name)
			{
				case "custpage_customer_first_name":
					fieldToUpdate = "firstname";
					break;
				case "custpage_customer_last_name":
					fieldToUpdate = "lastname";
					break;
				case "custpage_phone":
					fieldToUpdate = "phone";
					break;
				case "custpage_email":
					fieldToUpdate = "email";
					break;
                case "custpage_sales_rep":
					fieldToUpdate = "custentity_sales_rep";
					break;
			}
			
			if(customerId!=null && customerId!="")
				nlapiSubmitField("customer",customerId,fieldToUpdate,fieldValue);
		}
		catch(err)
		{
			nlapiLogExecution("error","Error Updating Customer Fields","Details: " + err.message);
			console.log("Error - " + err.message);
		}
	}
	else if(type=="custpage_deals" && name=="custpage_sales_person")
	{
		try
		{
			var salesRep = nlapiGetCurrentLineItemValue("custpage_deals","custpage_sales_person");
			
			var quoteId = nlapiGetCurrentLineItemValue("custpage_deals","custpage_quote_internalid");
			
			if(quoteId!=null && quoteId!="")
			{
				var quote = nlapiLoadRecord("estimate",quoteId);
			
				for(var x=0; x < quote.getLineItemCount("salesteam"); x++)
				{
					quote.removeLineItem("salesteam",x+1);
					x--;
				}
				
				quote.selectNewLineItem("salesteam");
				quote.setCurrentLineItemValue("salesteam","employee",salesRep);
				quote.setCurrentLineItemValue("salesteam","isprimary","T");
				quote.commitLineItem("salesteam");
				
				nlapiSubmitRecord(quote,true,true);
			}
			
		}
		catch(err)
		{
			nlapiLogExecution("error","Error Updating Sales Rep","Details: " + err.message);
			console.log("Error - " + err.message);
		}
	}
	else if(type=="custpage_deals" && name=="custpage_case_status")
	{
		try
		{
			var caseStatus = nlapiGetCurrentLineItemValue("custpage_deals","custpage_case_status");
			var caseStatusRec = nlapiGetCurrentLineItemValue("custpage_deals","custpage_case_status_internalid");
			
			if(caseStatusRec!=null && caseStatusRec!="")
				nlapiSubmitField("customrecord_case_status",caseStatusRec,"custrecord_case_status_status",caseStatus);
			
			nlapiSetCurrentLineItemValue("custpage_deals","custpage_last_update_by",nlapiGetContext().getName());
			
			var now = new Date();
			now = nlapiDateToString(now,"datetime");
			nlapiSetCurrentLineItemValue("custpage_deals","custpage_last_update",now);
		}
		catch(err)
		{
			nlapiLogExecution("error","Error Updating Case Status","Details: " + err.message);
			console.log("Error - " + err.message);
		}
	}
	else if(type=="custpage_deals" && name=="custpage_notes")
	{
		try
		{
			var caseNotes = nlapiGetCurrentLineItemValue("custpage_deals","custpage_notes");
			//var caseStatusRec = nlapiGetLineItemValue("custpage_deals","custpage_case_status_internalid",linenum);
			var caseStatus = nlapiGetCurrentLineItemValue("custpage_deals","custpage_case_status");
			var customer = nlapiGetCurrentLineItemValue("custpage_deals","custpage_customer_internalid");
			
			//Create new case status note
			if(customer!=null && customer!="")
			{
				var caseStatusRec = nlapiCreateRecord("customrecord_case_status");
				caseStatusRec.setFieldValue("custrecord_case_status_status",caseStatus);
				caseStatusRec.setFieldValue("custrecord_case_status_notes",caseNotes);
				caseStatusRec.setFieldValue("custrecord_case_status_customer",customer);
				var caseStatusRecId = nlapiSubmitRecord(caseStatusRec,true,true);
				
				nlapiSetCurrentLineItemValue("custpage_deals","custpage_last_update_by",nlapiGetContext().getName());
				
				var now = new Date();
				now = nlapiDateToString(now,"datetime");
				nlapiSetCurrentLineItemValue("custpage_deals","custpage_last_update",now);
			}
			
			//nlapiSubmitField("customrecord_case_status",caseStatusRec,"custrecord_case_status_notes",caseNotes);
		}
		catch(err)
		{
			nlapiLogExecution("error","Error Updating Case Status Notes","Details: " + err.message);
			console.log("Error - " + err.message);
		}
	}
	else if(type=="custpage_deals" && name=="custpage_customer_link")
	{
		var customer_id = nlapiGetCurrentLineItemValue("custpage_deals","custpage_customer_internalid");
		var estate_id = nlapiGetCurrentLineItemValue("custpage_deals","custpage_estate_internalid");
		
		var customerUrl = nlapiResolveURL("SUITELET","customscript_new_customer_application","customdeploy_new_customer_application");
		customerUrl = customerUrl + "&customer=" + customer_id + "&estate=" + estate_id;
		
		window.open(customerUrl,"_blank");
	}
}

function Prospective_CS_VL(type)
{
	if(type=="custpage_deals")
	{
		var customer_id = nlapiGetCurrentLineItemValue("custpage_deals","custpage_customer_internalid");
		if(customer_id!=null && customer_id!="")
			return true;
			
		try
		{
			var customer = nlapiCreateRecord("customer");
			customer.setFieldValue("subsidiary","2");
			customer.setFieldValue("isperson","T");
			customer.setFieldValue("firstname",nlapiGetCurrentLineItemValue("custpage_deals","custpage_customer_first_name"));
			customer.setFieldValue("lastname",nlapiGetCurrentLineItemValue("custpage_deals","custpage_customer_last_name"));
			customer.setFieldValue("phone",nlapiGetCurrentLineItemValue("custpage_deals","custpage_phone"));
			customer.setFieldValue("email",nlapiGetCurrentLineItemValue("custpage_deals","custpage_email"));
			customer.setFieldValue("leadsource",nlapiGetCurrentLineItemValue("custpage_deals","custpage_marketing_channel"));
			customer.setFieldValue("category","1");
			
			var estate = nlapiCreateRecord("customer");
			estate.setFieldValue("subsidiary","2");
			estate.setFieldValue("isperson","F");
			estate.setFieldValue("companyname","[TEMP] " + nlapiGetCurrentLineItemValue("custpage_deals","custpage_customer_first_name") + " " + nlapiGetCurrentLineItemValue("custpage_deals","custpage_customer_last_name"));
			estate.setFieldValue("category","2");
			estate.setFieldValue("custentity2",nlapiGetCurrentLineItemValue("custpage_deals","custpage_county"));
			estateId = nlapiSubmitRecord(estate,true,true);
			
			console.log("Created estate record...");
			
			nlapiSetCurrentLineItemValue("custpage_deals","custpage_estate_internalid",estateId,false,true);
			console.log("Updated estate internal ID in sublist...");
				
			customer.setFieldValue("parent",estateId);
			
			customerId = nlapiSubmitRecord(customer,true,true);
			console.log("Created customer record...");
			
			nlapiSetCurrentLineItemValue("custpage_deals","custpage_customer_internalid",customerId,false,true);
			console.log("Updated customer internal ID in sublist...");	
			
			//Create case status record
			var caseStatus = nlapiGetCurrentLineItemValue("custpage_deals","custpage_case_status");
			var caseNotes = nlapiGetCurrentLineItemValue("custpage_deals","custpage_notes");
			
			if(caseStatus!=null && caseStatus!="")
			{
				var caseStatusRec = nlapiCreateRecord("customrecord_case_status");
				caseStatusRec.setFieldValue("custrecord_case_status_status",caseStatus);
				caseStatusRec.setFieldValue("custrecord_case_status_notes",caseNotes);
				caseStatusRec.setFieldValue("custrecord_case_status_customer",customerId);
				var caseStatusRecId = nlapiSubmitRecord(caseStatusRec,true,true);
				
				console.log("Created case status record...");
				
				nlapiSetCurrentLineItemValue("custpage_deals","custpage_case_status_internalid",caseStatusRecId,true,true);	
			}
			
			return true;
		}
		catch(err)
		{
			console.log("Error creating new estate/customer: " + err.message);
			
			return true;
		}
	}
	
	return true;
}