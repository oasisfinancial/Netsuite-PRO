function Diligence_List(request,response)
{
	try{
	var form = nlapiCreateForm("Diligence List");
	
	form.setScript("customscript_deal_backlog_cs");
				form.addButton( 'custpage_download_csv', 'Download CSV', "onDownload()" );

	var list = form.addSubList("custpage_deals","list","Deals");
	
	var fld = list.addField("custpage_customer_internalid","text","Customer Internal ID");
	fld.setDisplayType("hidden");
	
	fld = list.addField("custpage_estate_internalid","text","Estate Internal ID");
	fld.setDisplayType("hidden");
	fld = list.addField("custpage_decedent_name_text","text","Decedent Name");
	fld.setDisplayType("hidden");
	fld = list.addField("custpage_decedent_name","text","Decedent Name....................................");
	fld.setDisplaySize(75);
	
	fld = list.addField("custpage_total_assignment","currency","Total Assignment");
	fld.setDisplaySize(75);
	
	fld = list.addField("custpage_est_date_of_distr","date","Est Date of Distr");
	fld.setDisplaySize(50);
	fld = list.addField("custpage_invoice_list_text","textarea","List of Invoices");
	fld.setDisplaySize(75);
    fld.setDisplayType("hidden");
	fld = list.addField("custpage_invoice_list","textarea","List of Invoices...............................................................");
	fld.setDisplaySize(75);

    //fld = list.addField("custpage_stamped_assignment", "text", "Stamped assignment");
	
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
	 
	 ////// New Fields //////////
	 
	fld = list.addField("custpage_dot", "text", "DOT");
	fld = list.addField("custpage_escrow", "text", "Escrow");
	fld = list.addField("custpage_blocked_account", "text", "BLOCKED ACCOUNT LETTER");
	fld = list.addField("custpage_problem_case", "text", "PROBLEM CASE");
   //fld = list.addField("custpage_stamped_assignment", "text", "Stamped assignment");

	var estateIds = [];
	
	var data = [];
	
	var customerUrl = nlapiResolveURL("SUITELET","customscript_new_customer_application","customdeploy_new_customer_application");
	
	var searchId = 0;
	
	var filters = [];
	filters.push(new nlobjSearchFilter("mainline",null,"is","T"));
	filters.push(new nlobjSearchFilter("status",null,"anyof","CustInvc:A"));
  	//filters.push(new nlobjSearchFilter("name",null,"anyof",287));

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
	////// New Columns  ///////
	cols.push(new nlobjSearchColumn("custentity_blocked_account_letter","customer"));
	cols.push(new nlobjSearchColumn("custentity_problem_case","customer"));
	cols.push(new nlobjSearchColumn("custentity_dot","customer"));
	cols.push(new nlobjSearchColumn("custentity_escrow","customer"));
	
  
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
					//nlapiLogExecution('emergency',results[x].getText("parent","customer"))
					if(results[x].getText("parent","customer") != '20741 Gale Blankenship'){
						data.push({
						estateId : results[x].getValue("parent","customer"),
						decedent_name : results[x].getText("parent","customer"),
						county : results[x].getText("custbody_county"),
					   estate_status_part : results[x].getText("custbody_estate_status_part"),
						invoice_total : "",
						invoice_link : "",
                        invoice_link_text : "",
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
						est_date_of_distr : "",
						
						////// Un comment if you need child customer values
						/* "blocked_account":results[x].getValue("custentity_blocked_account_letter","customer"),
						"problem_case":results[x].getValue("custentity_problem_case","customer"),
						"dot":results[x].getValue("custentity_dot","customer"),
						"escrow":results[x].getValue("custentity_escrow","customer") */
						
						////// comment if you need child customer values
						"blocked_account":"F",
						"problem_case":"F",
						"dot":"F",
						"escrow":"F"
					});
				}
				
			}
		}
		
	}while(results.length >= 1000);
	
	for(var x=0; x < data.length; x++)
	{
		var invoice_link = "";
        var invoice_link_text=[];
		var invoice_total = 0.00;
        var invoice_estate = "";
		var invoice_ids=[];
		for(var i=0; i < data[x].invoices.length; i++)
		{
			invoice_link += "<a href='/app/accounting/transactions/custinvc.nl?id=" + data[x].invoices[i].internalid + "' target='_blank'>" + data[x].invoices[i].customerName + " - " + data[x].invoices[i].tranid + " (" + data[x].invoices[i].amount + ") </a><br/>"
		invoice_link_text.push(data[x].invoices[i].customerName + " - " + data[x].invoices[i].tranid + " (" + data[x].invoices[i].amount +")");
          invoice_total += parseFloat(data[x].invoices[i].amount);
          invoice_ids.push(data[x].invoices[i].internalid)
          //  invoice_estate += data[x].invoices[i].estate_status_part;
         //  invoice_estate += data[x].invoices[i].estate + "<br/>"; 
          invoice_estate = data[x].invoices[i].estate + "<br/>"; 
		}
		data[x].invoice_id = invoice_ids.toString();
		data[x].invoice_link = invoice_link;
      data[x].invoice_link_text=invoice_link_text.toString();
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
		cols.push(new nlobjSearchColumn("custentity_blocked_account_letter"));
		cols.push(new nlobjSearchColumn("custentity_problem_case"));
		cols.push(new nlobjSearchColumn("custentity_dot"));
		cols.push(new nlobjSearchColumn("custentity_escrow"));
		
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
						
						if(data[i].blocked_account=='F')
						{
							data[i].blocked_account=results[x].getValue("custentity_blocked_account_letter");
						}
						if(data[i].problem_case=='F')
						{
							data[i].problem_case=results[x].getValue("custentity_problem_case");
						}
						if(data[i].dot=='F')
						{
							data[i].dot=results[x].getValue("custentity_dot");
						}
						if(data[i].escrow=='F')
						{
							data[i].escrow=results[x].getValue("custentity_escrow");
						}
						
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
						//nlapiLogExecution("debug","Match Found!");
						
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
	 var createPDFURL = nlapiResolveURL('SUITELET', 'customscript_sl_stamped_assignment', 'customdeploy_sl_stamped_assignment', false);
	  //pass the internal id of the current record
	 
	for(var x=0; x < data.length; x++)
	{
      var pdfURL=createPDFURL+'&invoices='+ data[x].invoice_id ;
       
		sublistData.push({
          custpage_decedent_name_text:data[x].decedent_name,
			custpage_decedent_name : "<a href='/app/site/hosting/scriptlet.nl?script=180&deploy=1&compid=5295340&estate=" + data[x].estateId + "&native=T' target='_blank'>" + data[x].decedent_name + "</a>",
			custpage_county : data[x].county,
          custpage_invoice_list_text:data[x].invoice_link_text,
			custpage_invoice_list : data[x].invoice_link,
			custpage_total_assignment : data[x].invoice_total,
			custpage_last_phone_date : data[x].last_phone_call_date,
			custpage_last_phone_subject : data[x].last_phone_call_subject,
			custpage_last_phone_message : data[x].last_phone_call_message,
			custpage_next_event_date : data[x].next_event_date,
			custpage_next_event_subject : data[x].next_event_subject,
			custpage_est_date_of_distr : data[x].est_date_of_distr,
			custpage_estate_status_part : data[x].estate_status_part,
			custpage_blocked_account : data[x].blocked_account=='T' ? "Yes" :"No",
			custpage_problem_case : data[x].problem_case=='T' ? "Yes" :"No",
			custpage_dot:data[x].dot=='T' ? "Yes" :"No",
			custpage_escrow:data[x].escrow=='T' ? "Yes" :"No",
            custpage_stamped_assignment : "<a href="+pdfURL+" target='top'>Print</a>",

         //custpage_estate_status_part : data[x].invoice_estate
		});
	}
	
	list.setLineItemValues(sublistData);
	
	response.writePage(form);
	}
	catch(e)
	{
		nlapiLogExecution('debug','Error',e)
	}
}