/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */

define(["N/record","N/search","N/format"],function(record,search,format){
	
	function getInputData(context)
	{
		return search.create({
			type: "invoice",
			filters: [
				["mainline","is",true],
				"and",
				["status","is","CustInvc:A"],
				"and",
				[
					["custbody_rebate_1_month","isnotempty",null],
					"or",
					["custbody_rebate_2_month","isnotempty",null],
					"or",
					["custbody_rebate_3_month","isnotempty",null]
				]
			],
			columns: [
				"trandate",
				"custbody_rebate_1_month",
				"custbody_rebate_2_month",
				"custbody_rebate_3_month",
				"custbody_rebate_1_amount",
				"custbody_rebate_2_amount",
				"custbody_rebate_3_amount",
				"custbody_advance_size",
				"total"
			]
		});
	}
	
	function map(context)
	{
		log.debug("Context",context);
		
		try
		{
			var searchResult = JSON.parse(context.value);
			var invoiceId = searchResult.id;
			
			var today = new Date();
			
			var invoiceDate = format.parse({value:searchResult.values.trandate,type:format.Type.DATE});
			log.debug("Invoice Date",invoiceDate);
			
			var invoiceTotal = parseFloat(searchResult.values.total);
			log.debug("Invoice Total",invoiceTotal);
			
			var cashAdvanced = parseFloat(searchResult.values.custbody_advance_size);
			log.debug("Cash Advanced",cashAdvanced);
			
			var netEstRevenue = null;
			
			if(searchResult.values.custbody_rebate_1_month!=null && searchResult.values.custbody_rebate_1_month!="")
			{
				log.debug("Rebate 1 Month",parseInt(searchResult.values.custbody_rebate_1_month.value));
				
				var rebate1Date = invoiceDate.setMonth(invoiceDate.getMonth() + parseInt(searchResult.values.custbody_rebate_1_month.value));
				log.debug("Rebate 1 Date",rebate1Date);
				
				if(today <= rebate1Date)
				{
					var rebate1Amt = parseFloat(searchResult.values.custbody_rebate_1_amount);
					log.debug("Rebate 1 Amount",rebate1Amt);
					
					netEstRevenue = invoiceTotal - cashAdvanced - rebate1Amt;
				}
			}
			
			if(searchResult.values.custbody_rebate_2_month!=null && searchResult.values.custbody_rebate_2_month!="")
			{
				var rebate2Date = invoiceDate.setMonth(invoiceDate.getMonth() + parseInt(searchResult.values.custbody_rebate_2_month.value));
				
				if(today <= rebate2Date)
				{
					var rebate2Amt = parseFloat(searchResult.values.custbody_rebate_2_amount);
					log.debug("Rebate 2 Amount",rebate2Amt);
					
					netEstRevenue = invoiceTotal - cashAdvanced - rebate2Amt;
				}
			}
				
				
			if(searchResult.values.custbody_rebate_3_month1!=null && searchResult.values.custbody_rebate_3_month1!="")
			{
				var rebate3Date = invoiceDate.setMonth(invoiceDate.getMonth() + parseInt(searchResult.values.custbody_rebate_3_month.value));
				
				if(today <= rebate3Date)
				{
					var rebate3Amt = parseFloat(searchResult.values.custbody_rebate_3_amount);
					log.debug("Rebate 3 Amount",rebate3Amt);
					
					netEstRevenue = invoiceTotal - cashAdvanced - rebate3Amt;
				}
			}
			
			log.debug("Net Estimated Revenue",netEstRevenue);
			
			if(netEstRevenue!=null)
			{
				record.submitFields({
					type: "invoice",
					id: invoiceId,
					values: {
						custbody_net_est_revenue: netEstRevenue
					}
				});
			}
		}
		catch(err)
		{
			log.error("Error Creating WO (SO  Line: " + searchResult.values.line + ")","Details: " + err.message);
		}
	}
	
	function summarize(context)
	{
		
	}
	
	return {
		getInputData: getInputData,
		map: map,
		summarize: summarize
	}
})
