function clientPageInit(type){
	//jQuery("#div__label").remove();
	var form_obj = jQuery("#custpage_reportsublist_form");
	var div_obj = jQuery("#custpage_reportsublist_div");
	var tbl_obj = jQuery("#custpage_reportsublist_splits");

	// hearder
	new_html = '<div style="position:relative;" class="uir_list_header"><div id="div__label_c" class="scrollarea" style="width: auto !important; margin: 0px; visibility: visible; overflow: hidden; left: 0px;">';
	new_html += '<table id="div__labtab" style="table-layout: fixed" border="0" cellspacing="0" class="listtable listborder openList uir-list-table" cellpadding="0" width="100%"><thead><tr class="uir-list-headerrow noprint">';
	td_num = 0;
	tbl_obj.find('tbody tr').each(function(i){
		if( i == 0 ){
			jQuery(this).find('td').each(function(j){
				td_width = jQuery(this).css('width'); 
				td_label = jQuery(this).data('label'); 
				td_num = parseInt(j)+1;
				old_td = jQuery(this).html();
				new_td = '<td height="100%" style="cursor: pointer; width: 100px; text-align:left;" id="div__lab'+td_num+'" class="listheadertd listheadertextb uir-list-header-td uir-list-header-align-rt" onclick="" data-label="'+td_label+'">'+old_td+'</td>';
				new_html += new_td;
			});
			//jQuery(this).remove();
			return false;
		}
	});

	new_html += '<td id="div__scrollbarSpacer" class="listheadertd listheadertextb uir-list-header-td" style="width:0px; padding:0px;"></td></tr></thead></table></div><div id="div__labend" class="borderbox listborder listheadertd listheadertextb uir-list-header-td uir-list-header-align-rt" style="display: none !important; width: 17px; position: absolute; right: 0px; top: 0px; border-width: 1px; height: 42px;"><div class="listheader" style="padding:0px;"></div></div></div>';
	header_w = td_num*100; 

	//Body
	new_html += '<div id="div__body_c" class="uir-listpage-body scrollarea listborder" onscroll="scrollDivC();" style="width: auto !important; border-width: 0px 0px 1px; margin: 0px; visibility: visible; position: relative; height: 400px;"><table id="div__bodytab" border="0" cellspacing="0" cellpadding="0" style="width:'+header_w+'px;"><tbody>';
	new_html += '';

	tbl_obj.find('tbody tr').each(function(i){
		if( i != 0 ){
			if( i % 2 == 1 )
				new_tr = '<tr class="uir-list-row-tr uir-list-row-even" id="row'+(i-1)+'">';
			else
				new_tr = '<tr class="uir-list-row-tr uir-list-row-odd" id="row'+(i-1)+'">';

			jQuery(this).find('td').each(function(j){
				//td_width = jQuery(this).css('width'); 
				//td_label = jQuery(this).data('label'); 
				//td_num = parseInt(j)+1;
				old_td = jQuery(this).text();
				new_td = '<td valign="top" class="listtext uir-list-row-cell" style="width: 100px;">'+old_td+'</td>';
				new_tr += new_td;
			});
			new_tr += '</tr>';
		}else{
			new_tr = '<tr class="printonly">';
			jQuery(this).find('td').each(function(j){
				//td_width = jQuery(this).css('width'); 
				//td_label = jQuery(this).data('label'); 
				td_num = parseInt(j)+1;
				old_td = jQuery(this).text();
				new_td = '<td height="0" style="width:100px;" id="div__labprintcol'+td_num+'" class="listheadertdleft listheadertextb uir-list-header-td uir-list-header-align-ctr"><div class="listheader">'+old_td+'</div></td>';
				new_tr += new_td;
			});
			new_tr += '</tr>';
		}
		new_html += new_tr;
	});

	new_html += '</tbody></table></div>';
	div_obj.remove();
	form_obj.append(new_html);
	form_obj.append("<script type='text/javascript'> function scrollDivC(){  if( document.getElementById('div__label_c') ) document.getElementById('div__label_c').scrollLeft = document.getElementById('div__body_c').scrollLeft;}</script>");
	//var clone_table = jQuery("#custpage_reportsublist_splits").clone(true);
	//clone_table.find('tbody tr').each(function(i){
	//	if( i != 0 )	jQuery(this).remove();
	//});

	//div_obj.prepend(clone_table);
	//tbl_obj.css('margin-top', '-50px');
}

function onDownload(){
	var sel_action = nlapiGetFieldValue('custpage_action');
	var lineCount = nlapiGetLineItemCount("custpage_reportsublist");
    if (lineCount > 0) {
    	var xmlString = 'Invoice Number,Date of Invoice,Advance Amount,Assignment Amount,Outstanding Invoice Amount,Estate Name,Customer Name,State,Total Advanced to Customer Through This Invoice,Total Advanced to Estate Through This Invoice,Total Due to Customer From Estate Pre-Assignments,Competitor Assignments Ahead of Invoice,Net Size of Inheritance,Borrowing Base Multiple,Allowed Under Borrowing Base,Total Prior Probate Advance Fundings,Ineligable - LTV,Ineligable - Aged>48M,Ineligable - Cust Conc,Ineligable - Est Conc,Ineligable - Holdback,Ineligable - Est. Default,Total Ineligable Receivable,Eligible Receivable,Partial Payment\n'; 
    	if( sel_action == 2 )
    		xmlString = 'Estate Name,Customer Name,State,Assignment Amount,Outstanding Amount,Total Advanced to Customer,Total Advanced to Estate,Total Due to Customer From Estate Pre-Assignments,Competitor Assignments Ahead of Invoice,Net Size of Inheritance,Borrowing Base Multiple,Allowed Under Borrowing Base,Total Prior Probate Advance Fundings,Ineligable - LTV,Ineligable - Aged>48M,Ineligable - Cust Conc,Ineligable - Est Conc,Ineligable - Holdback,Ineligable - Est. Default,Total Ineligable Receivable,Eligible Receivable,Partial Payment\n'; 
    	else
		if( sel_action == 3 )
			xmlString = 'Estate Name,State,Assignment Amount,Outstanding Amount,Total Advanced to Estate,Total Due to Customer From Estate Pre-Assignments,Competitor Assignments Ahead of Invoice,Net Size of Inheritance,Borrowing Base Multiple,Allowed Under Borrowing Base,Total Prior Probate Advance Fundings,Ineligable - LTV,Ineligable - Aged>48M,Ineligable - Cust Conc,Ineligable - Est Conc,Ineligable - Holdback,Ineligable - Est. Default,Total Ineligable Receivable,Eligible Receivable,Partial Payment\n'; 
    	else
		if( sel_action == 4 )
			xmlString = 'State,Assignment Amount,Outstanding Amount,Total Advanced to Customer,Total Due to Customer From Estate Pre-Assignments,Competitor Assignments Ahead of Invoice,Net Size of Inheritance,Borrowing Base Multiple,Allowed Under Borrowing Base,Total Prior Probate Advance Fundings,Ineligable - LTV,Ineligable - Aged>48M,Ineligable - Cust Conc,Ineligable - Est Conc,Ineligable - Holdback,Ineligable - Est. Default,Total Ineligable Receivable,Eligible Receivable,Partial Payment\n'; 
    	
	    for (var line = 1; line <= lineCount; line++) {
	    	var row = [];
	    	if( sel_action == 1 )
		    	row = [
		    	           	nlapiGetLineItemValue("custpage_reportsublist", "custpage_invoice_num", line),
		    	           	nlapiGetLineItemValue("custpage_reportsublist", "custpage_invoice_date", line), 
		    	           	nlapiGetLineItemValue("custpage_reportsublist", "custpage_advance", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_assignment", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_outstanding", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_estate_name", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_customer_name", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_state", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_customer_advance", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_estate_advance", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_due", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_competitor", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_net", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_borrowing_multi", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_borrowing_allowed", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_prior", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_ltv", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_48m", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_cust_conc", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_est_conc", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_holdback", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_est_default", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_in_receivable", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_el_receivable", line),
			           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_payment", line),
	           		]; 
       		else
       		if( sel_action == 2 )
				row = [
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_estate_name", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_customer_name", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_state", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_assignment", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_outstanding", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_customer_advance", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_estate_advance", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_due", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_competitor", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_net", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_borrowing_multi", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_borrowing_allowed", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_prior", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_ltv", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_48m", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_cust_conc", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_est_conc", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_holdback", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_est_default", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_in_receivable", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_el_receivable", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_payment", line),
           		];
       		else
       		if( sel_action == 3 )
				row = [
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_estate_name", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_state", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_assignment", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_outstanding", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_estate_advance", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_due", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_competitor", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_net", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_borrowing_multi", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_borrowing_allowed", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_prior", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_ltv", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_48m", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_cust_conc", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_est_conc", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_holdback", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_est_default", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_in_receivable", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_el_receivable", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_payment", line),
           		];  
       		else
       			row = [
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_state", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_assignment", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_outstanding", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_customer_advance", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_due", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_competitor", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_net", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_borrowing_multi", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_borrowing_allowed", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_prior", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_ltv", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_48m", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_cust_conc", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_est_conc", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_holdback", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_est_default", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_in_receivable", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_el_receivable", line),
		           		nlapiGetLineItemValue("custpage_reportsublist", "custpage_payment", line),
           		];  

	    	row = row.map(function(field) {
	    			field = field.replace(/,/g, ' ');
	    			return '' + field.replace(/"/g, '""') + '';
    			});
	    	
    		xmlString = xmlString + row.join() + '\n';
	    }
    }
	var element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(xmlString));
    element.setAttribute('download', "BorrowingBaseReport.csv");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}