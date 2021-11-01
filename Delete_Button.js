function Delete_Button(type,form)
{
	if(type=="view")
	{
		try
		{
			var url = nlapiResolveURL("SUITELET","customscript_delete_customer","customdeploy_delete_customer");
				url+= "&customer=" + nlapiGetRecordId();
				
			form.addButton("custpage_delete","Delete","window.location.href='" + url + "';");
		}
		catch(err)
		{
			nlapiLogExecution("error","Error Showing Delete Button","Details: " + err.message);
		}
	}
}

function Delete_Customer_SL(request,response)
{
	var customerId = request.getParameter("customer");
	
	//Find and delete any sub-customers
	var filters = [];
	filters.push(new nlobjSearchFilter("parent",null,"is",customerId));
	filters.push(new nlobjSearchFilter("parent",null,"noneof","@NONE@"));
	var results = nlapiSearchRecord("customer",null,filters);
	if(results)
	{
		for(var x=0; x < results.length; x++)
		{
			nlapiDeleteRecord("customer",results[x].getId());
		}
	}
	
	//Find and delete any contacts
	var filters = [];
	filters.push(new nlobjSearchFilter("company",null,"is",customerId));
	var results = nlapiSearchRecord("contact",null,filters);
	if(results)
	{
		for(var x=0; x < results.length; x++)
		{
			nlapiDeleteRecord("contact",results[x].getId());
		}
	}
	
	//Delete main customer
	nlapiDeleteRecord("customer",customerId);
	
	response.sendRedirect("TASKLINK","LIST_CUSTJOB");
}
