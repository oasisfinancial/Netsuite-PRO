/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Feb 2021     Administrator
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	var file_id = nlapiGetContext().getSetting('SCRIPT', 'custscript_borrowingbase_report') || '';
	// get all estate
	var estates = [];
	search = nlapiCreateSearch("customer", 
				[['category', 'is', '2']], 
			[
			 	new nlobjSearchColumn("internalid", null,null),
			 	new nlobjSearchColumn("entityid", null,null),
			 	new nlobjSearchColumn("firstname", null,null),
			 	new nlobjSearchColumn("lastname", null,null),
			 	new nlobjSearchColumn("billstate", null,null),
			 	new nlobjSearchColumn("custentity_specific_bequests_due_to_heir", null,null),
			 	new nlobjSearchColumn("custentity_specific_bequest_due_to_cust", null,null),
			 	new nlobjSearchColumn("custentity_advance_to_value_ratio", null,null),
			 	new nlobjSearchColumn("custentity_percent_estate_due_to_custome", null,null),
			]
		) || [];

	searchResults = search.runSearch();
	resultIndex = 0; resultStep = 1000, rowIndex = 1; tmp = []; 
	do {    
		tmp = searchResults.getResults(resultIndex, resultIndex + resultStep);
		for (var j = 0; j < tmp.length; j++) {
			var id = tmp[j].getValue('internalid');
			estates[id] = tmp[j];
		}
		resultIndex = resultIndex + resultStep;
	} while (tmp.length > 0 );
	nlapiLogExecution("debug","Get Estate");
	
	// calculate property, accounts, claims
	var properties = [],  assets = [], claims = [], c_leins = [], e_leins = [], c_existing_assignments = [], e_existing_assignments = [];
	search = nlapiCreateSearch("customrecord_existing_assignment", 
			[], 
			[
				 	new nlobjSearchColumn("custrecord_existing_assignment_customer", null,null).setSort(),
				 	new nlobjSearchColumn("custrecord_existing_assignment_estate", null,null),
				 	new nlobjSearchColumn("internalid", "custrecord_existing_assignment_invoice", null),
				 	new nlobjSearchColumn("custrecord_existing_assignment_amount", null,null),
				 	new nlobjSearchColumn("custrecord_existing_assignment_priority", null,null).setSort(),
				 	new nlobjSearchColumn("custrecord_existing_assignment_date", null,null).setSort(),
			]
		) || [];

	searchResults = search.runSearch();
	resultIndex = 0; resultStep = 1000, rowIndex = 1;
	tmp = []; 
	do {    
		tmp = searchResults.getResults(resultIndex, resultIndex + resultStep);
		for (var j = 0; j < tmp.length; j++) {
			var customer = tmp[j].getValue('custrecord_existing_assignment_customer');
			var estate = tmp[j].getValue('custrecord_existing_assignment_estate');
			if (!( customer in c_existing_assignments)) {
				c_existing_assignments[customer] = [];
			}
			var assign_obj = {
				invoice: tmp[j].getValue('internalid', 'custrecord_existing_assignment_invoice'),
				date: tmp[j].getValue('custrecord_existing_assignment_date'), 
				priority: tmp[j].getValue('custrecord_existing_assignment_priority'), 
				amount: tmp[j].getValue('custrecord_existing_assignment_amount') 
			};
			
			c_existing_assignments[customer].push(assign_obj);
		}
		resultIndex = resultIndex + resultStep;
	} while (tmp.length > 0 );
		//nlapiLogExecution("debug","Calc Existing Assignment");
		
	totalFld = new nlobjSearchColumn("custrecord_property_total", null, 'sum');
	estateFld = new nlobjSearchColumn("custrecord_property_estate", null, 'group');
	search = nlapiCreateSearch("customrecord_property", [], [estateFld, totalFld]) || [];
	searchResults = search.runSearch();
	resultIndex = 0; resultStep = 1000, rowIndex = 1; tmp = []; 
	do {    
		tmp = searchResults.getResults(resultIndex, resultIndex + resultStep);
		for (var j = 0; j < tmp.length; j++) {
			var estate = tmp[j].getValue(estateFld);
			properties[estate] = { total: tmp[j].getValue(totalFld) };
		}
		resultIndex = resultIndex + resultStep;
	} while (tmp.length > 0 );
	//nlapiLogExecution("debug","Calc Property");
	
	totalFld = new nlobjSearchColumn("custrecord_asset_value", null, 'sum');
	estateFld = new nlobjSearchColumn("custrecord_asset_estate", null, 'group');
	search = nlapiCreateSearch("customrecord_asset", [], [estateFld, totalFld]) || [];
	searchResults = search.runSearch();
	resultIndex = 0; resultStep = 1000, rowIndex = 1; tmp = []; 
	do {    
		tmp = searchResults.getResults(resultIndex, resultIndex + resultStep);
		for (var j = 0; j < tmp.length; j++) {
			var estate = tmp[j].getValue(estateFld);
			assets[estate] = { value: tmp[j].getValue(totalFld) };
		}
		resultIndex = resultIndex + resultStep;
	} while (tmp.length > 0 );
	//nlapiLogExecution("debug","Calc Asset");
	
	totalFld = new nlobjSearchColumn("custrecord_claim_value", null, 'sum');
	estateFld = new nlobjSearchColumn("custrecord_claim_estate", null, 'group');
	search = nlapiCreateSearch("customrecord_claim", [], [estateFld, totalFld]) || [];
	searchResults = search.runSearch();
	resultIndex = 0; resultStep = 1000, rowIndex = 1; tmp = []; 
	do {    
		tmp = searchResults.getResults(resultIndex, resultIndex + resultStep);
		for (var j = 0; j < tmp.length; j++) {
			var estate = tmp[j].getValue(estateFld);
			claims[estate] = { value: tmp[j].getValue(totalFld) };
		}
		resultIndex = resultIndex + resultStep;
	} while (tmp.length > 0 );
	//nlapiLogExecution("debug","Calc Claim");
	
	totalFld = new nlobjSearchColumn("custrecord_lein_judgement_amount", null, 'sum');
	customerFld = new nlobjSearchColumn("custrecord_lein_judgement_customer", null, 'group');
	search = nlapiCreateSearch("customrecord_lein_judgement", [], [totalFld, customerFld]) || [];
	searchResults = search.runSearch();
	resultIndex = 0; resultStep = 1000, rowIndex = 1; tmp = []; 
	do {    
		tmp = searchResults.getResults(resultIndex, resultIndex + resultStep);
		for (var j = 0; j < tmp.length; j++) {
			var customer = tmp[j].getValue(customerFld);
			c_leins[customer] = { value: tmp[j].getValue(totalFld) };
		}
		resultIndex = resultIndex + resultStep;
	} while (tmp.length > 0 );
	
	var total_due_pres = [];
	var today = new Date();
	search = nlapiCreateSearch("invoice", [['amountremainingisabovezero', 'is', 'T'], 'and', ['mainline', 'is', 'T']], 
			[
			 	new nlobjSearchColumn("internalid", null,null),
			 	new nlobjSearchColumn("tranid", null,null),
			 	new nlobjSearchColumn("trandate", null,null),
			 	new nlobjSearchColumn("entity", null,null),
			 	new nlobjSearchColumn("custbody_advance_size", null, null),
			 	new nlobjSearchColumn("custbody_assignment_size", null, null),
			 	new nlobjSearchColumn("custbody_assignment_size", null, null),
			 	new nlobjSearchColumn("amountpaid", null, null),
			 	new nlobjSearchColumn("amountremaining", null, null),
			 	new nlobjSearchColumn("custbody_estimated_default", null, null),
			 	new nlobjSearchColumn("custbody_holdback", null, null),
				
			 	new nlobjSearchColumn("parent", 'customer', null),
			 	new nlobjSearchColumn("entityid", 'customer', null),
			 	new nlobjSearchColumn("billstate", 'customer', null),
			 	new nlobjSearchColumn("custentity_specific_bequest_due_to_cust", 'customer', null),
			 	new nlobjSearchColumn("custentity_advance_to_value_ratio", 'customer', null),
			 	new nlobjSearchColumn("custentity_percent_estate_due_to_custome", 'customer', null),
			]
		) || [];
	
	var totals = [], customer_advance = [], estate_advance = [];
	searchResults = search.runSearch();
	resultIndex = 0; resultStep = 1000, rowIndex = 1;
	var invs = [], report_detail = []; 
	do {    
		invs = searchResults.getResults(resultIndex, resultIndex + resultStep);
		for (var j = 0; j < invs.length; j++) {
			var id = invs[j].getValue('internalid');
			var customer = invs[j].getValue('entity');
			var estate = invs[j].getValue('parent', 'customer');
			
			// calc Total Due to Customer From Estate Pre-Assignments
			if (!(customer in total_due_pres)) {
				specific_bequests_due_to_heir = estates[estate].getValue('custentity_specific_bequests_due_to_heir');
				specific_bequest_due_to_cust = invs[j].getValue('custentity_specific_bequest_due_to_cust', 'customer');	//customer
				advance_to_value_ratio = invs[j].getValue('custentity_advance_to_value_ratio', 'customer');	//customer
				percent_estate_due_to_custome = invs[j].getValue('custentity_percent_estate_due_to_custome', 'customer');	//customer

				if(specific_bequests_due_to_heir == "" || specific_bequests_due_to_heir == null)	specific_bequests_due_to_heir = 0;
				if(specific_bequest_due_to_cust == "" || specific_bequest_due_to_cust == null)	specific_bequest_due_to_cust = 0;
				if(advance_to_value_ratio == "" || advance_to_value_ratio == null)	
					advance_to_value_ratio = 33;
				else
					advance_to_value_ratio = parseFloat(advance_to_value_ratio);

				if(percent_estate_due_to_custome == "" || percent_estate_due_to_custome == null)
					percent_estate_due_to_custome = 100;
				else
					percent_estate_due_to_custome = parseFloat(percent_estate_due_to_custome);

				if (estate in properties){ 
					property_sum = properties[estate].total;
				}else{
					property_sum = 0; 
				}
				if (estate in assets) 
					asset_sum = assets[estate].value;
				else
					asset_sum = 0;
				
				if (estate in claims) 
					claim_sum = claims[estate].value;
				else
					claim_sum = 0;
				
				if (customer in e_leins) 
					lein_sum = c_leins[customer].value;
				else
					lein_sum = 0;
				
				//nlapiLogExecution("debug","Calcing", 'property_sum='+property_sum+', asset_sum='+asset_sum+', claim_sum='+claim_sum+', lein_sum='+lein_sum);

				attorneyFee = parseInt( ( parseInt(property_sum) + parseInt(asset_sum) ) * 0.06); 
				if(attorneyFee < 3000)	attorneyFee = 3000;
				
				net_equity_value = parseInt(property_sum) + parseInt(asset_sum) - parseInt(claim_sum) - parseInt(specific_bequests_due_to_heir) - parseInt(parseInt(property_sum)*0.06) - parseInt(attorneyFee);
				residue_equity_due = parseInt(net_equity_value * percent_estate_due_to_custome / 100);
				total_due = parseInt(residue_equity_due) + parseInt(specific_bequest_due_to_cust);
				total_due_pres[customer] = parseInt(total_due) - parseInt(lein_sum);
				total_due_pre = total_due_pres[customer];
			}else
				total_due_pre = total_due_pres[customer];

			// calc total of customer advance, old of customer advance 
			if (!(customer in customer_advance)) {
				old_advance = 0;
				customer_advance[customer] = parseInt(invs[j].getValue('custbody_advance_size'));
			}else{
				old_advance = parseInt(customer_advance[customer]);
				customer_advance[customer] = parseInt(customer_advance[customer]) + parseInt(invs[j].getValue('custbody_advance_size'));
			}

			// calc total of estate advance
			if (!(estate in estate_advance)) {
				estate_advance[estate] = parseInt(invs[j].getValue('custbody_advance_size'));
			}else
				estate_advance[estate] = parseInt(estate_advance[estate]) + parseInt(invs[j].getValue('custbody_advance_size'));
				
			competitor_sum = 0; 
			if (customer in c_existing_assignments){
				sel_priority = 0;
				for( var i in c_existing_assignments[customer]){
					assign_invoice = Math.abs(c_existing_assignments[customer][i].invoice);
					assign_priority = Math.abs(c_existing_assignments[customer][i].priority);
					if( assign_invoice == id && assign_invoice ){
						sel_priority = assign_priority;
					}
				} 
				//nlapiLogExecution("debug","Calcing", 'sel_priority = '+sel_priority);
				for( var i in c_existing_assignments[customer]){
					assign_invoice = Math.abs(c_existing_assignments[customer][i].invoice);
					assign_priority = Math.abs(c_existing_assignments[customer][i].priority);
					assign_date = Math.abs(c_existing_assignments[customer][i].date);
					assign_amount = Math.abs(c_existing_assignments[customer][i].amount);
					
					g1 = new Date(assign_date); 
					g2 = new Date(invs[j].getValue('trandate')); 

					if( sel_priority && sel_priority > assign_priority && !assign_invoice){
						competitor_sum += assign_amount;
					}else
					if( !sel_priority && g2.getTime() > g1.getTime() && !assign_invoice){
						competitor_sum += assign_amount;	
					}
				} 
				//nlapiLogExecution("debug","Calcing", 'competitor_sum = '+competitor_sum);
			}
			
			//calc Net Size of Inheritance
			net_size = total_due_pre - competitor_sum;
			//calc allowed
			borrowing_allowed = parseInt(net_size * 0.6);
			//calc ltv
			ltv_val = parseInt(invs[j].getValue('custbody_advance_size')); 
			ltv_val = ltv_val - Math.min(ltv_val, borrowing_allowed-old_advance);
			//calc 48M
			var invoice_date = new Date(invs[j].getValue('trandate'));
			var diff_time = today.getTime() - invoice_date.getTime();  
			var diff_days = diff_time / (1000 * 3600 * 24); 
			if( diff_days > 1460)	
				val_48M = invs[j].getValue('custbody_advance_size')
			else
				val_48M = 0;
			
			//calc conc
			cust_conc= Math.min(Math.max(0, customer_advance[customer]-350000), parseInt(invs[j].getValue('custbody_advance_size'))); 
			est_conc= Math.min(Math.max(0, estate_advance[estate]-600000), parseInt(invs[j].getValue('custbody_advance_size')));
			
			if( invs[j].getValue('custbody_estimated_default') == '' || invs[j].getValue('custbody_estimated_default') == null )
				estimated_defaul = 0;
			else
				estimated_defaul = invs[j].getValue('custbody_estimated_default');
			
			in_rcv = Math.max(ltv_val, estimated_defaul);
			el_rcv = parseInt(invs[j].getValue('custbody_advance_size')) - in_rcv;
			if( el_rcv < 0 )	el_rcv = 0;
			
			//Set LineItem
			var row_detail = {};
			row_detail['tranid'] = invs[j].getValue('tranid');
			row_detail['trandate'] = invs[j].getValue('trandate');
			row_detail['estate'] = invs[j].getText('parent', 'customer');
			row_detail['customer'] = invs[j].getText('entity');
			row_detail['state'] = invs[j].getText('billstate', 'customer');
			row_detail['advance'] = invs[j].getValue('custbody_advance_size');
			row_detail['assignment'] = invs[j].getValue('custbody_assignment_size');
			row_detail['outstanding'] = invs[j].getValue('amountremaining');
			row_detail['customer_advance'] = customer_advance[customer];
			row_detail['estate_advance'] = estate_advance[estate];
			row_detail['net'] = net_size;
			row_detail['total_due_pre'] = total_due_pre;
			row_detail['competitor_sum'] = competitor_sum;
			row_detail['borrowing_multi'] = '60%';
			row_detail['borrowing_allowed'] = borrowing_allowed;
			row_detail['old_advance'] = old_advance;
			row_detail['ltv'] = ltv_val;
			row_detail['val48M'] = val_48M;
			row_detail['cust_conc'] = cust_conc;
			row_detail['est_conc'] = est_conc;
			row_detail['holdback'] = invs[j].getValue('custbody_holdback');
			row_detail['estimated_default'] = invs[j].getValue('custbody_estimated_default');
			row_detail['in_rcv'] = in_rcv;
			row_detail['el_rcv'] = el_rcv;
			row_detail['payment'] = invs[j].getValue('amountpaid');

			report_detail.push(row_detail);
		}
		resultIndex = resultIndex + resultStep;
	} while (invs.length > 0 );

	nlapiLogExecution("debug","End getting report");
	saveReportAsXls(file_id, report_detail);
}

function saveReportAsXls(fileId, report_data){
	// XML content of the file
	var xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
	    xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
	    xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
	    xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
	    xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
	    xmlStr += 'xmlns:html="http://www.w3.org/TR/REC-html40">';
	    xmlStr += '<Worksheet ss:Name="Sheet1">';
	    xmlStr += '<Table>' +
		    '<Row>' +
		    '<Cell><Data ss:Type="String"> Invoice Number </Data></Cell>' +
		    '<Cell><Data ss:Type="String"> Date of Invoice </Data></Cell>' +
		    '<Cell><Data ss:Type="String"> Advance Amount </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Assignment Amount </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Outstanding Invoice Amount </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Estate Name </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Customer Name </Data></Cell>' +
			'<Cell><Data ss:Type="String"> State </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Total Advanced to Customer Through This Invoice </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Total Advanced to Estate Through This Invoice </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Total Due to Customer From Estate Pre-Assignments </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Competitor Assignments Ahead of Invoice </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Net Size of Inheritance </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Borrowing Base Multiple </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Allowed Under Borrowing Base </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Total Prior Probate Advance Fundings </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Ineligable - LTV </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Ineligable - Aged>48M </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Ineligable - Cust Conc </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Ineligable - Est Conc </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Ineligable - Holdback </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Ineligable - Est. Default </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Total Ineligable Receivable </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Eligible Receivable </Data></Cell>' +
			'<Cell><Data ss:Type="String"> Partial Payment </Data></Cell>' +
		    '</Row>';

	for (var i = 0; i < report_data.length; i++) {
		 xmlStr += '<Row>' +
		    '<Cell><Data ss:Type="String">'+report_data[i].tranid+'</Data></Cell>' +
		    '<Cell><Data ss:Type="String">'+report_data[i].trandate+'</Data></Cell>' +
		    '<Cell><Data ss:Type="String">'+report_data[i].advance+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].assignment+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].outstanding+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].estate+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].customer+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].state+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].customer_advance+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].estate_advance+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].total_due_pre+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].competitor_sum+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].net+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].borrowing_multi+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].borrowing_allowed+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].old_advance+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].ltv+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].val48M+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].cust_conc+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].est_conc+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].holdback+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].estimated_default+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].in_rcv+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].el_rcv+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+report_data[i].payment+'</Data></Cell>' +
			'</Row>';
	}

	xmlStr += '</Table></Worksheet></Workbook>';

	var today = new Date();
    today = getFormatted(today.getFullYear())+getFormatted(today.getMonth() + 1)+getFormatted(today.getDate());
	var xlsFile = nlapiCreateFile('BorrowingBase_Report'+today+'.xls', 'EXCEL', nlapiEncrypt(xmlStr, 'base64'));
	xlsFile.setFolder(318);
	var fileID = nlapiSubmitFile(xlsFile);	
	
	nlapiLogExecution("debug","FileID", fileID);
}

function getFormatted(val){
	try{
		if(JSON.stringify(val).length == 1){
			return "0"+val;
		}else{
			return val;
		}
	}
	catch(e){
		nlapiLogExecution('get formatted catch',e);
	}
}



