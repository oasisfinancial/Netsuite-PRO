function Prospectives(request,response)
{
	var today = new Date();
	var daysAgo30 = nlapiAddDays(today,-30);
	nlapiLogExecution("debug","30 days ago",daysAgo30);
	
	var form = nlapiCreateForm("Prospectives");
	
	form.setScript("customscript_prospectives_cs");
	
	var list = form.addSubList("custpage_deals","inlineeditor","Deals");
	var fld = list.addField("custpage_customer_internalid","text","Customer Internal ID");
	fld.setDisplayType("hidden");
	fld = list.addField("custpage_customer_link","checkbox","Go To App");
	fld = list.addField("custpage_customer_first_name","text","First Name");
	fld = list.addField("custpage_customer_last_name","text","Last Name");
	fld = list.addField("custpage_estate_internalid","text","Estate Internal ID");
	fld.setDisplayType("hidden");
	fld = list.addField("custpage_decedent_name","text","Decedent Name");
	fld.setDisplayType("hidden");
	list.addField("custpage_marketing_channel","select","Marketing Channel","campaign");
	fld = list.addField("custpage_county","select","County","customrecord173");
	fld = list.addField("custpage_phone","phone","Phone");
	fld = list.addField("custpage_email","email","Email");
	fld = list.addField("custpage_last_update","text","Last Update");
	fld.setDisplayType("disabled");
	fld = list.addField("custpage_last_update_by","text","Updated By");
	fld.setDisplayType("disabled");
	fld = list.addField("custpage_case_status_internalid","select","Case Status Internal ID","customrecord_case_status");
	fld.setDisplayType("hidden");
	list.addField("custpage_case_status","select","Case Status","customlist_case_statuses");
	fld = list.addField("custpage_notes","textarea","Notes");
	fld.setDisplayType("entry");
	fld.setDisplaySize(25,2);
	
	var customerIds = [];
	
	var statuses = [];
	
	var search = nlapiLoadSearch("customrecord_case_status","customsearch_prospective_customers");
	
	///////// New Change to add filter ///////////

	var filterArray = [];
	filterArray.push(["created",'onorafter', "thirtydaysago"]);
	search.filterExpression = filterArray;
	var filters = search.filterExpression;
	
	//////////////////////////////////////////////
	
	var searchId = 0;
	
	var resultSet = search.runSearch();
	var results;
	
	do{
		results = resultSet.getResults(searchId,searchId+1000);
		nlapiLogExecution("debug","# Results",results.length);
		
		if(results)
		{
			for(var x=0; x < results.length; x++)
			{
				var cols = results[x].getAllColumns();
				var statusIdCol = null;
				
				for(var i=0; i < cols.length; i++)
				{
					//nlapiLogExecution("debug","Column[" + i + "]","Label: " + cols[i].getLabel());
					
					if(cols[i].getLabel()=="Status ID")
					{
						statusIdCol = cols[i];
						break;
					}
				}
				
				if(results[x].getValue(statusIdCol)=="1")
				{
					customerIds.push(results[x].getValue("custrecord_case_status_customer",null,"group"));
					
					var lastModified = results[x].getValue("created",null,"max");
					lastModified = nlapiStringToDate(lastModified);
					
					//nlapiLogExecution("debug","Last Modified Date",lastModified);
					
					if(lastModified >= daysAgo30)
					{
						statuses.push({
							customer : results[x].getValue("custrecord_case_status_customer",null,"group"),
							status : results[x].getValue(statusIdCol),
							statusId : results[x].getValue("internalid",null,"max"),
							notes : results[x].getValue("custrecord_case_status_notes",null,"max"),
							last_modified : results[x].getValue("lastmodified",null,"max"),
							last_modified_by : results[x].getValue("lastmodifiedby",null,"max")
						});
					}
				}
				
				searchId++;
			}
		}
		
	}while(results.length >= 1000);
	
	//nlapiLogExecution("debug","Status JSON",JSON.stringify(statuses));
	
	if(customerIds!=null && customerIds.length > 0)
	{
		var data = [];
		
		var customerUrl = nlapiResolveURL("SUITELET","customscript_new_customer_application","customdeploy_new_customer_application");
		
		var filters = [];
		filters.push(new nlobjSearchFilter("internalid",null,"anyof",customerIds));
		var cols = [];
		cols.push(new nlobjSearchColumn("parent"));
		cols.push(new nlobjSearchColumn("firstname"));
		cols.push(new nlobjSearchColumn("lastname"));
		cols.push(new nlobjSearchColumn("custentity_last_notes_from_cust_contact"));
		cols.push(new nlobjSearchColumn("leadsource"));
		cols.push(new nlobjSearchColumn("phone"));
		cols.push(new nlobjSearchColumn("email"));
		cols.push(new nlobjSearchColumn("firstname","parentcustomer"));
		cols.push(new nlobjSearchColumn("lastname","parentcustomer"));
		cols.push(new nlobjSearchColumn("custentity2","parentcustomer"));
		cols.push(new nlobjSearchColumn("firstname","parentcustomer"));
		
		var search = nlapiCreateSearch("customer",filters,cols);
		var searchId = 0;
		var resultSet = search.runSearch();
		
		do{
			var results = resultSet.getResults(searchId,searchId+1000);
			
			if(results)
			{
				nlapiLogExecution("debug","# Customers",results.length);
				
				for(var x=0; x < results.length; x++)
				{
					var customerId = results[x].getId();
					var estateId = results[x].getValue("parent");
					
					var lineLink = customerUrl + "&customer=" + customerId + "&estate=" + estateId;
					
					var status = "", statusInternalId = "", notes = "", modified = "", modified_by = "";
					
					for(var i=0; i < statuses.length; i++)
					{
						if(statuses[i].customer == customerId)
						{
							status = statuses[i].status;
							statusInternalId = statuses[i].statusId;
							notes = statuses[i].notes;
							modified = statuses[i].last_modified;
							modified_by = statuses[i].last_modified_by;
							break;
						}
					}
					
					data.push({
						custpage_customer_internalid : customerId,
						//custpage_customer_link : "<a href='" + lineLink + "' target='_blank'>App</a>",
						custpage_customer_first_name : results[x].getValue("firstname"),
						custpage_customer_last_name : results[x].getValue("lastname"),
						custpage_estate_internalid : results[x].getValue("parent"),
						custpage_email : results[x].getValue("email"),
						custpage_phone : results[x].getValue("phone"),
						custpage_decedent_name : results[x].getValue("firstname","parentcustomer") + " " + results[x].getValue("lastname","parentcustomer"),
						custpage_marketing_channel : results[x].getValue("leadsource"),
						custpage_county : results[x].getValue("custentity2","parentcustomer"),
						custpage_notes : notes,
						custpage_case_status : status,
						custpage_case_status_internalid : statusInternalId,
						custpage_last_update : modified,
						custpage_last_update_obj : nlapiStringToDate(modified),
						custpage_last_update_by : modified_by
					});
				
				searchId++;
				
				}
			}
		}while(results.length >= 1000);
		
		if(data.length > 0)
		{
			data.sort(function(a,b){
				var date1 = new Date(a.custpage_last_update_obj), date2 = new Date(b.custpage_last_update_obj);
				return date2 - date1;
			});
		}
		
		var cleanData = [];
		
		for(var x=0; x < data.length; x++)
		{
			if(data[x].custpage_last_update!="" && data[x].custpage_last_update!=null)
			{
				cleanData.push(data[x]);
			}
		}
		
		list.setLineItemValues(cleanData);
	}
	
	response.writePage(form);
}