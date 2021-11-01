function Diligence_List(request,response)
{
	var form = nlapiCreateForm("Diligence List");
	
	form.setScript("customscript_deal_backlog_cs");
	
	var list = form.addSubList("custpage_deals","list","Deals");
	
	var fld = list.addField("custpage_customer_internalid","text","Customer Internal ID");
	fld.setDisplayType("hidden");
	
	fld = list.addField("custpage_estate_internalid","text","Estate Internal ID");
	fld.setDisplayType("hidden");
	
	fld = list.addField("custpage_decedent_name","text","Decedent Name....................................");
	fld.setDisplaySize(75);
	
	fld = list.addField("custpage_total_assignment","currency","Total Assignment");
	fld.setDisplaySize(75);
	
	fld = list.addField("custpage_est_date_of_distr","date","Est Date of Distr");
	fld.setDisplaySize(50);
	
	fld = list.addField("custpage_invoice_list","textarea","List of Invoices...............................................................");
	fld.setDisplaySize(75);
	
	fld = list.addField("custpage_county","text","County");
	fld.setDisplaySize(75);
	
	fld = list.addField("custpage_last_phone_date","date","Last Phone Call Date");
	fld.setDisplaySize(75);
	
	fld = list.addField("custpage_last_phone_subject","text","Subject....................");
	fld.setDisplaySize(75);
	
	fld = list.addField("custpage_last_phone_message","textarea","Message");
	fld.setDisplaySize(75);
	
	fld = list.addField("custpage_next_event_date","date","Next Event Date");
	fld.setDisplaySize(75);
	
	fld = list.addField("custpage_next_event_subject","text","Subject............................................");
	fld.setDisplaySize(75);
  
  fld = list.addField("custpage_estate_status_part", "textarea", "Estate Status");
     fld.setDisplaySize(75);
	
	var estateIds = [];
	
	var data = [];
	
	var customerUrl = nlapiResolveURL("SUITELET","customscript_new_customer_application","customdeploy_new_customer_application");
	
	var searchId = 0;
	
	var filters = [];
	filters.push(new nlobjSearchFilter("mainline",null,"is","T"));
	filters.push(new nlobjSearchFilter("status",null,"anyof","CustInvc:A"));
	var cols = [];
	cols.push(new nlobjSearchColumn("entity"));
	cols.push(new nlobjSearchColumn("tranid"));
	cols.push(new nlobjSearchColumn("trandate"));
	cols.push(new nlobjSearchColumn("amount"));
	cols.push(new nlobjSearchColumn("amountremaining"));
	cols.push(new nlobjSearchColumn("custbody_county"));
	cols.push(new nlobjSearchColumn("custbody_state_of_case"));
	cols.push(new nlobjSearchColumn("custbody_decedent_name"));
	cols.push(new nlobjSearchColumn("parent","customer"));
	cols.push(new nlobjSearchColumn("firstname","customer"));
	cols.push(new nlobjSearchColumn("lastname","customer"));
  cols.push(new nlobjSearchColumn("custbody_estate_status_part"));
  
	var search = nlapiCreateSearch("invoice",filters,cols);
	var resultSet = search.runSearch();
	var searchId = 0;
	
	do{
		var results = resultSet.getResults(searchId,searchId+1000);
		
		for(var x=0; x < results.length; x++)
		{
			searchId++;
			
			estateIds.push(results[x].getValue("parent","customer"));
			
			var found = false;
			
			for(var i=0; i < data.length; i++)
			{
				if(data[i].estateId == results[x].getValue("parent","customer"))
				{
					data[i].invoices.push({
						internalid : results[x].getId(),
						tranid : results[x].getValue("tranid"),
						customerId : results[x].getValue("entity"),
						customerName : results[x].getValue("firstname","customer") + " " + results[x].getValue("lastname","customer"),
						trandate : results[x].getValue("trandate"),
						amount : results[x].getValue("amountremaining"),
                      estate : results[x].getValue("custbody_estate_status_part")
					});
					
					found = true;
					break;
				}
			}
			
			if(!found)
			{
				data.push({
					estateId : results[x].getValue("parent","customer"),
					decedent_name : results[x].getText("parent","customer"),
					county : results[x].getText("custbody_county"),
                   estate_status_part : results[x].getText("custbody_estate_status_part"),
					invoice_total : "",
					invoice_link : "",
					invoices : [{
						internalid : results[x].getId(),
						tranid : results[x].getValue("tranid"),
						customerId : results[x].getValue("entity"),
						customerName : results[x].getValue("firstname","customer") + " " + results[x].getValue("lastname","customer"),
						trandate : results[x].getValue("trandate"),
						amount : results[x].getValue("amountremaining"),
                       estate : results[x].getValue("custbody_estate_status_part")
					}],
					last_phone_call_date : "",
					last_phone_call_subject : "",
					last_phone_call_message : "",
					next_event_date : "",
					next_event_subject : "",
					est_date_of_distr : ""
				});
			}
		}
		
	}while(results.length >= 1000);
	
	for(var x=0; x < data.length; x++)
	{
		var invoice_link = "";
		var invoice_total = 0.00;
        var invoice_estate = "";
		
		for(var i=0; i < data[x].invoices.length; i++)
		{
			invoice_link += "<a href='/app/accounting/transactions/custinvc.nl?id=" + data[x].invoices[i].internalid + "' target='_blank'>" + data[x].invoices[i].customerName + " - " + data[x].invoices[i].tranid + " (" + data[x].invoices[i].amount + ") </a><br/>"
			invoice_total += parseFloat(data[x].invoices[i].amount);
          //  invoice_estate += data[x].invoices[i].estate_status_part;
         //  invoice_estate += data[x].invoices[i].estate + "<br/>"; 
          invoice_estate = data[x].invoices[i].estate + "<br/>"; 
		}
		
		data[x].invoice_link = invoice_link;
		data[x].invoice_total = nlapiFormatCurrency(invoice_total);
    //  data[x].estate_status_part = invoice_estate;
    data[x].invoice_estate = invoice_estate;
	}
	
	if(estateIds.length > 0)
	{
		var filters = [];
		filters.push(new nlobjSearchFilter("internalid",null,"anyof",estateIds));
		var cols = [];
		cols.push(new nlobjSearchColumn("custentity2"));
		cols.push(new nlobjSearchColumn("custentity_est_date_of_distribution"));
      cols.push(new nlobjSearchColumn("custentity_est_status"));
		
		var search = nlapiCreateSearch("customer",filters,cols);
		var resultSet = search.runSearch();
		var searchId = 0;
		
		do{
			var results = resultSet.getResults(searchId,searchId+1000);
			
			for(var x=0; x < results.length; x++)
			{
				for(var i=0; i < data.length; i++)
				{
					if(results[x].getId() == data[i].estateId)
					{
						data[i].county = results[x].getText("custentity2");
						data[i].est_date_of_distr = results[x].getValue("custentity_est_date_of_distribution");
                      data[i].estate_status_part = results[x].getText("custentity_est_status");
						break;
					}
				}
				
				searchId++;
			}
		}while(results.length >= 1000);
		
		
		var filter = new nlobjSearchFilter("company",null,"anyof",estateIds);
		
		var search = nlapiLoadSearch("phonecall","customsearch_diligence_last_phone_call");
		search.addFilter(filter);
		var resultSet = search.runSearch();
		var searchId = 0;
		
		do{
			var results = resultSet.getResults(searchId,searchId+1000);
			
			for(var x=0; x < results.length; x++)
			{
				for(var i=0; i < data.length; i++)
				{
					if(results[x].getValue("company",null,"group") == data[i].estateId)
					{
						data[i].last_phone_call_date = results[x].getValue("startdate",null,"max");
						data[i].last_phone_call_subject = results[x].getValue("title",null,"max");
						data[i].last_phone_call_message = results[x].getValue("message",null,"max");
						break;
					}
				}
				
				searchId++;
			}
		}while(results.length >= 1000);
		
		var filter = new nlobjSearchFilter("attendee",null,"anyof",estateIds);
		
		var search = nlapiLoadSearch("calendarevent","customsearch_diligence_next_event_date");
		search.addFilter(filter);
		var resultSet = search.runSearch();
		var searchId = 0;
		
		do{
			var results = resultSet.getResults(searchId,searchId+1000);
			
			for(var x=0; x < results.length; x++)
			{
				for(var i=0; i < data.length; i++)
				{
					if(results[x].getValue("company",null,"group") == data[i].decedent_name)
					{
						nlapiLogExecution("debug","Match Found!");
						
						data[i].next_event_date = results[x].getValue("startdate",null,"min");
						data[i].next_event_subject = results[x].getValue("title",null,"min");
						break;
					}
				}
				
				searchId++;
			}
		}while(results.length >= 1000);
	}
	
	var sublistData = [];
	
	for(var x=0; x < data.length; x++)
	{
		sublistData.push({
			custpage_decedent_name : "<a href='/app/site/hosting/scriptlet.nl?script=180&deploy=1&compid=5295340&estate=" + data[x].estateId + "&native=T' target='_blank'>" + data[x].decedent_name + "</a>",
			custpage_county : data[x].county,
			custpage_invoice_list : data[x].invoice_link,
			custpage_total_assignment : data[x].invoice_total,
			custpage_last_phone_date : data[x].last_phone_call_date,
			custpage_last_phone_subject : data[x].last_phone_call_subject,
			custpage_last_phone_message : data[x].last_phone_call_message,
			custpage_next_event_date : data[x].next_event_date,
			custpage_next_event_subject : data[x].next_event_subject,
			custpage_est_date_of_distr : data[x].est_date_of_distr,
          custpage_estate_status_part : data[x].estate_status_part,
         // custpage_estate_status_part : data[x].invoice_estate
		});
	}
	
	list.setLineItemValues(sublistData);
	
	response.writePage(form);
}
