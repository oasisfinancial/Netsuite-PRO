function Deal_Backlog(request,response)
{
	var form = nlapiCreateForm("Deal Backlog");

	form.setScript("customscript_deal_backlog_cs");

	var context = nlapiGetContext();

	var list = form.addSubList("custpage_deals","list","Deals");
	var fld = list.addField("custpage_customer_internalid","text","Customer Internal ID");
	fld.setDisplayType("hidden");
	list.addField("custpage_customer_first_name","text","First Name");
	list.addField("custpage_customer_last_name","text","Last Name");
	fld = list.addField("custpage_estate_internalid","text","Estate Internal ID");
	fld.setDisplayType("hidden");
	list.addField("custpage_decedent_name","text","Decedent Name");
	list.addField("custpage_marketing_channel","select","Marketing Channel","campaign");
	fld.setDisplaySize(12);

	//list.addField("custpage_state","text","State");
	list.addField("custpage_county","text","County");
	fld = list.addField("custpage_quote_internalid","text","Quote Internal ID");
	fld.setDisplayType("hidden");
	list.addField("custpage_advance_size","currency","Advance Size");
	//list.addField("custpage_option_1","currency","Option 1");
	//list.addField("custpage_option_2","currency","Option 2");
	//list.addField("custpage_option_3","currency","Option 3");
	//list.addField("custpage_assignment","currency","Assignment");
	list.addField("custpage_diligence","select","Diligence Assignee","employee");
	list.addField("custpage_last_update","text","Last Update");
	fld = list.addField("custpage_case_status_internalid","select","Case Status Internal ID","customrecord_case_status");
	fld.setDisplayType("hidden");
	list.addField("custpage_case_status","select","Case Status","customlist_case_statuses");
	fld = list.addField("custpage_notes","textarea","Notes");
	fld.setDisplayType("entry");
	fld.setDisplaySize(25,2);
	list.addField("custpage_sales_person","select","Sales Person","employee");

	nlapiLogExecution("debug","Usage after form objects",context.getRemainingUsage());

	var customerIds = [];

	var statuses = [];

	//var results = nlapiSearchRecord("customrecord_case_status","customsearch_deal_backlog_customers");
	var search = nlapiLoadSearch("customrecord_case_status","customsearch_deal_backlog_customers");


	var resultSet = search.runSearch();
	var searchId = 0;

	do{
		var results = resultSet.getResults(searchId,searchId+1000);

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

			searchId++;

			if(results[x].getValue(statusIdCol)=="1" || results[x].getValue(statusIdCol)=="8" || results[x].getValue(statusIdCol)=="9" || results[x].getValue(statusIdCol)=="10")
				continue;

			customerIds.push(results[x].getValue("custrecord_case_status_customer",null,"group"));

			statuses.push({
				customer : results[x].getValue("custrecord_case_status_customer",null,"group"),
				status : results[x].getValue(statusIdCol),
				statusId : results[x].getValue("internalid",null,"max"),
				notes : results[x].getValue("custrecord_case_status_notes",null,"max"),
				last_modified : results[x].getValue("lastmodified",null,"max")
			});
		}

	}while(results.length >= 1000);

	nlapiLogExecution("debug","Usage after status search",context.getRemainingUsage());

	nlapiLogExecution("debug","Status JSON",JSON.stringify(statuses));

	if(customerIds!=null && customerIds.length > 0)
	{
		var data = [];

		var customerUrl = nlapiResolveURL("SUITELET","customscript_new_customer_application","customdeploy_new_customer_application");

		var quoteCustomers = [];

		var filters = [];
		filters.push(new nlobjSearchFilter("entity",null,"anyof",customerIds));
		filters.push(new nlobjSearchFilter("mainline",null,"is","T"));
		filters.push(new nlobjSearchFilter("custbody_preferred_quote",null,"is","T"));
		filters.push(new nlobjSearchFilter("status",null,"noneof",["Estimate:B","Estimate:C","Estimate:V"]));
		var cols = [];
		cols.push(new nlobjSearchColumn("custbody_option_1_pricing"));
		cols.push(new nlobjSearchColumn("custbody_option_2_pricing"));
		cols.push(new nlobjSearchColumn("custbody_option_3_pricing"));
		cols.push(new nlobjSearchColumn("custbody_advance_size"));
		cols.push(new nlobjSearchColumn("custbody_assignment_size"));
		cols.push(new nlobjSearchColumn("salesrep"));
		cols.push(new nlobjSearchColumn("entity"));
		cols.push(new nlobjSearchColumn("custbody_county"));
		cols.push(new nlobjSearchColumn("custbody_state_of_case"));
		cols.push(new nlobjSearchColumn("custbody_decedent_name"));
		cols.push(new nlobjSearchColumn("parent","customer"));
		cols.push(new nlobjSearchColumn("firstname","customer"));
		cols.push(new nlobjSearchColumn("lastname","customer"));
		cols.push(new nlobjSearchColumn("custentity_last_notes_from_cust_contact","customer"));
		cols.push(new nlobjSearchColumn("leadsource","customer"));
		cols.push(new nlobjSearchColumn("custentity_diligence_assignee","customer"));
		var results = nlapiSearchRecord("estimate",null,filters,cols);
		if(results)
		{
			nlapiLogExecution("debug","# Estimates",results.length);

			for(var x=0; x < results.length; x++)
			{
				var customerId = results[x].getValue("entity");
				quoteCustomers.push(customerId);

				var estateId = results[x].getValue("parent","customer");

				var lineLink = customerUrl + "&customer=" + customerId + "&estate=" + estateId;

				var status = "", statusInternalId = "", notes = "", modified = "";

				for(var i=0; i < statuses.length; i++)
				{
					if(statuses[i].customer == customerId)
					{
						status = statuses[i].status;
						statusInternalId = statuses[i].statusId;
						notes = statuses[i].notes;
						modified = statuses[i].last_modified;
						break;
					}
				}

				data.push({
					custpage_customer_internalid : results[x].getValue("entity"),
					custpage_customer_first_name : "<a href='" + lineLink + "' target='_blank'>" + results[x].getValue("firstname","customer") + "</a>",
					custpage_customer_last_name : "<a href='" + lineLink + "' target='_blank'>" + results[x].getValue("lastname","customer") + "</a>",
					custpage_estate_internalid : results[x].getValue("parent","customer"),
					custpage_decedent_name : results[x].getValue("custbody_decedent_name"),
					custpage_marketing_channel : results[x].getValue("leadsource","customer"),
					custpage_state : results[x].getText("custbody_state_of_case"),
					custpage_county : results[x].getText("custbody_county"),
					custpage_notes : notes,
					custpage_quote_internalid : results[x].getId(),
					custpage_advance_size : results[x].getValue("custbody_advance_size"),
					custpage_diligence: results[x].getValue("custentity_diligence_assignee","customer"),
					//custpage_option_1 : results[x].getValue("custbody_option_1_pricing"),
					//custpage_option_2 : results[x].getValue("custbody_option_2_pricing"),
					//custpage_option_3 : results[x].getValue("custbody_option_3_pricing"),
					//custpage_assignment : results[x].getValue("custbody_assignment_size"),
					custpage_sales_person : results[x].getValue("salesrep"),
					custpage_case_status : status,
					custpage_case_status_internalid : statusInternalId,
					custpage_last_update : modified
				});
			}
		}

		nlapiLogExecution("debug","Usage after estimate search",context.getRemainingUsage());

		var filters = [];
		filters.push(new nlobjSearchFilter("internalid",null,"anyof",customerIds));
		filters.push(new nlobjSearchFilter("internalid",null,"noneof",quoteCustomers));
		var cols = [];
		cols.push(new nlobjSearchColumn("custentity2","parentcustomer"));
		cols.push(new nlobjSearchColumn("custentity3","parentcustomer"));
		cols.push(new nlobjSearchColumn("altname","parentcustomer"));
		cols.push(new nlobjSearchColumn("parent"));
		cols.push(new nlobjSearchColumn("firstname"));
		cols.push(new nlobjSearchColumn("lastname"));
		cols.push(new nlobjSearchColumn("custentity_last_notes_from_cust_contact"));
		cols.push(new nlobjSearchColumn("leadsource"));
		cols.push(new nlobjSearchColumn("salesrep"));
		cols.push(new nlobjSearchColumn("custentity_diligence_assignee"));
		var results = nlapiSearchRecord("customer",null,filters,cols);
		if(results)
		{
			nlapiLogExecution("debug","# Customers",results.length);

			for(var x=0; x < results.length; x++)
			{
				var customerId = results[x].getId();
				var estateId = results[x].getValue("parent");

				var lineLink = customerUrl + "&customer=" + customerId + "&estate=" + estateId;

				var status = "", statusInternalId = "", notes = "", modified = "";

				for(var i=0; i < statuses.length; i++)
				{
					if(statuses[i].customer == customerId)
					{
						status = statuses[i].status;
						statusInternalId = statuses[i].statusId;
						notes = statuses[i].notes;
						modified = statuses[i].last_modified;
						break;
					}
				}

				data.push({
					custpage_customer_internalid : results[x].getId(),
					custpage_customer_first_name : "<a href='" + lineLink + "' target='_blank'>" + results[x].getValue("firstname") + "</a>",
					custpage_customer_last_name : "<a href='" + lineLink + "' target='_blank'>" + results[x].getValue("lastname") + "</a>",
					custpage_estate_internalid : results[x].getValue("parent"),
					custpage_decedent_name : results[x].getValue("altname","parentcustomer"),
					custpage_marketing_channel : results[x].getValue("leadsource"),
					custpage_state : results[x].getText("custentity3","parentcustomer"),
					custpage_county : results[x].getText("custentity2","parentcustomer"),
					custpage_notes : notes,
					custpage_quote_internalid : "",
					custpage_advance_size : "",
					custpage_diligence: results[x].getValue("custentity_diligence_assignee"),
					//custpage_option_1 : "",
					//custpage_option_2 : "",
					//custpage_option_3 : "",
					//custpage_assignment : "",
					custpage_sales_person : results[x].getValue("salesrep"),
					custpage_case_status : status,
					custpage_case_status_internalid : statusInternalId,
					custpage_last_update : modified
				});
			}
		}

		nlapiLogExecution("debug","Usage after customer search",context.getRemainingUsage());

		list.setLineItemValues(data);
	}

	response.writePage(form);
}