function Invoice_Rebate_Button(type,form,request)
{
	if(type=="view")
	{
		try
		{
			var url = nlapiResolveURL("RECORD","check");
				url+= "&record.custbody_invoice=" + nlapiGetRecordId();
				url+= "&record.custbody_is_rebate_check=T";
				
			form.addButton("custpage_rebate_check","Rebate Check","window.location.href='" + url + "';");
		}
		catch(err)
		{
			nlapiLogExecution("error","Error Showing Rebate Check Button","Details: " + err.message);
		}
	}
}

function Invoice_Rebate_Check(type)
{
	try
	{
		var tranid = nlapiGetFieldValue("transactionnumber");
		var invoice = nlapiGetFieldValue("custbody_invoice");
		var isRebateCheck = nlapiGetFieldValue("custbody_is_rebate_check");
		
		if(tranid=="To Be Generated" && invoice!=null && invoice!="" && isRebateCheck=="T")
		{
			var invoiceFields = nlapiLookupField("invoice",invoice,["entity"]);
			
			nlapiSetFieldValue("entity",invoiceFields.entity,true,true);
			
			for(var x=0; x < nlapiGetLineItemCount("expense"); x++)
			{
				nlapiRemoveLineItem("expense",x+1);
				x--;
			}
			
			nlapiSelectNewLineItem("expense");
			nlapiSetCurrentLineItemValue("expense","account","231",true,true);
			nlapiSetCurrentLineItemValue("expense","amount","1",true,true);
			nlapiCommitLineItem("expense");
			
			nlapiSetFieldValue("memo","Rebate from Probate Advance",true,true);
		}
	}
	catch(err)
	{
		nlapiLogExecution("error","Error Setting Rebate Defaults","Details: " + err.message);
	}
}

function Invoice_Rebate_Check_UE(type)
{
	if(type=="create")
	{
		try
		{
			var check = nlapiGetNewRecord();
			var invoiceId = check.getFieldValue("custbody_invoice");
			
			if(invoice!=null && invoice!="")
			{
				var rebateCheck = false;
				
				for(var x=0; x < check.getLineItemCount("expense"); x++)
				{
					var account = check.getLineItemValue("expense","account",x+1);
					if(account=="231")
					{
						rebateCheck = true;
						break;
					}
				}
				
				if(rebateCheck===true)
				{
					nlapiSubmitField("invoice",invoiceId,"custbody_rebate_check",nlapiGetRecordId());
				}
			}
		}
		catch(err)
		{
			nlapiLogExecution("error","Error Writing Rebate Check back to Invoice","Details: " + err.message);
		}
	}
}
