function Deal_Backlog_CS_FC(type,name,linenum)
{
	if(type=="custpage_deals" && name=="custpage_marketing_channel")
	{
		try
		{
			var marketingChannel = nlapiGetLineItemValue("custpage_deals","custpage_marketing_channel",linenum);
			
			var customerId = nlapiGetLineItemValue("custpage_deals","custpage_customer_internalid",linenum);
			
			nlapiSubmitField("customer",customerId,"leadsource",marketingChannel);
		}
		catch(err)
		{
			nlapiLogExecution("error","Error Updating Marketing Channel","Details: " + err.message);
		}
	}
	else if(type=="custpage_deals" && name=="custpage_sales_person")
	{
		try
		{
			var salesRep = nlapiGetLineItemValue("custpage_deals","custpage_sales_person",linenum);
			
			var quoteId = nlapiGetLineItemValue("custpage_deals","custpage_quote_internalid",linenum);
			console.log("Quote ID: " + quoteId);
			
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
			else
			{
				var customerId = nlapiGetLineItemValue("custpage_deals","custpage_customer_internalid",linenum);
				
				var customer = nlapiLoadRecord("customer",customerId);
			
				for(var x=0; x < customer.getLineItemCount("salesteam"); x++)
				{
					customer.removeLineItem("salesteam",x+1);
					x--;
				}
				
				customer.selectNewLineItem("salesteam");
				customer.setCurrentLineItemValue("salesteam","employee",salesRep);
				customer.setCurrentLineItemValue("salesteam","isprimary","T");
				customer.commitLineItem("salesteam");
				
				nlapiSubmitRecord(customer,true,true);
			}
		}
		catch(err)
		{
			nlapiLogExecution("error","Error Updating Sales Rep","Details: " + err.message);
		}
	}
	else if(type=="custpage_deals" && name=="custpage_case_status")
	{
		try
		{
			var caseStatus = nlapiGetLineItemValue("custpage_deals","custpage_case_status",linenum);
			var caseStatusRec = nlapiGetLineItemValue("custpage_deals","custpage_case_status_internalid",linenum);
			
			nlapiSubmitField("customrecord_case_status",caseStatusRec,"custrecord_case_status_status",caseStatus);
		}
		catch(err)
		{
			nlapiLogExecution("error","Error Updating Case Status","Details: " + err.message);
		}
	}
	else if(type=="custpage_deals" && name=="custpage_notes")
	{
		try
		{
			var caseNotes = nlapiGetLineItemValue("custpage_deals","custpage_notes",linenum);
			//var caseStatusRec = nlapiGetLineItemValue("custpage_deals","custpage_case_status_internalid",linenum);
			var caseStatus = nlapiGetLineItemValue("custpage_deals","custpage_case_status",linenum);
			var customer = nlapiGetLineItemValue("custpage_deals","custpage_customer_internalid",linenum);
			
			//Create new case status note
			var caseStatusRec = nlapiCreateRecord("customrecord_case_status");
			caseStatusRec.setFieldValue("custrecord_case_status_status",caseStatus);
			caseStatusRec.setFieldValue("custrecord_case_status_notes",caseNotes);
			caseStatusRec.setFieldValue("custrecord_case_status_customer",customer);
			var caseStatusRecId = nlapiSubmitRecord(caseStatusRec,true,true);
			
			//nlapiSubmitField("customrecord_case_status",caseStatusRec,"custrecord_case_status_notes",caseNotes);
		}
		catch(err)
		{
			nlapiLogExecution("error","Error Updating Case Status Notes","Details: " + err.message);
		}
	}
}
