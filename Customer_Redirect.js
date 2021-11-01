function Customer_Redirect(type,form,request)
{
	if(type=="create" || type=="edit" || type=="view")
	{
		try
		{
			if(request.getParameter("native")=="T")
				return true;
			
			if(type=="create")
				nlapiSetRedirectURL("SUITELET","customscript_new_customer_application","customdeploy_new_customer_application",null);
			else
			{
				var category = nlapiGetFieldValue("category");
				var paramName;
				switch(category)
				{
					case "1":
						paramName = "customer";
						break;
					case "2":
						paramName = "estate";
						break;
				}
				
				var params = new Array();
				params[paramName] = nlapiGetRecordId();
				
				nlapiSetRedirectURL("SUITELET","customscript_new_customer_application","customdeploy_new_customer_application",null,params);
			}
		}
		catch(err)
		{
			nlapiLogExecution("error","Error Redirect to Customer Application","Details: " + err.message);
		}
	}
}
