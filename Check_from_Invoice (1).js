function Check_From_Invoice_Button(type,form,request)
{
	if(type=="view")
	{
		try
		{
			var url = nlapiResolveURL("RECORD","check");
			
			url += "&record.entity=" + nlapiGetFieldValue("entity") + "&record.subsidiary=" + nlapiGetFieldValue("subsidiary") + "&record.custbody_invoice=" + nlapiGetRecordId();
			
			form.addButton("custpage_new_check","Create Check","window.location.href='" + url + "';");
		}
		catch(err)
		{
			nlapiLogExecution("error","Error Showing Create Check Button","Details: " + err.message);
		}
	}
}

function Check_From_Invoice_PI()
{
	try
	{
		var invoice = nlapiGetFieldValue("custbody_invoice");
		nlapiLogExecution("debug","Linked Invoice",invoice);
		
		if(invoice!=null && invoice!="")
		{
			var transactionnumber = nlapiGetFieldValue("transactionnumber");
			nlapiLogExecution("debug","Transaction Number",transactionnumber);
			
			if(transactionnumber=="To Be Generated")
			{
				var advanceSize = nlapiLookupField("invoice",invoice,"custbody_advance_size");
				nlapiLogExecution("debug","Advance Size",advanceSize);
				
				if(advanceSize!=null && advanceSize!="")
				{
					nlapiSelectNewLineItem("expense");
					nlapiSetCurrentLineItemValue("expense","account","427",true,true); //4300 Revenue : Advances Paid
					nlapiSetCurrentLineItemValue("expense","amount",advanceSize,true,true);
					nlapiCommitLineItem("expense");
				}
			}
		}
	}
	catch(err)
	{
		nlapiLogExecution("error","Error Creating Default Check Lines for Advance","Details: " + err.message);
	}
}
