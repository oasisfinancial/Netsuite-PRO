/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */

define(["N/record","N/search","N/format","N/runtime"],function(record,search,format,runtime){
	
	function getInputData(context)
	{
		var script = runtime.getCurrentScript();
		var customer = script.getParameter({name:"custscript_est_distr_cust"});
		
		if(customer==null || customer=="")
		{
			return search.create({
				type: "customer",
				filters: [
					["custentity_est_date_of_distribution","isnotempty",null]
				],
				columns: [
					"custentity_est_date_of_distribution"
				]
			});
		}
		else
		{
			return search.create({
				type: "customer",
				filters: [
					["custentity_est_date_of_distribution","isnotempty",null],
					"and",
					["internalid","is",customer]
				],
				columns: [
					"custentity_est_date_of_distribution"
				]
			});
		}
	}
	
	function map(context)
	{
		log.debug("Context",context);
		
		try
		{
			var searchResult = JSON.parse(context.value);
			var customerId = searchResult.id;
			
			var estDateDistr = searchResult.values.custentity_est_date_of_distribution;
			
			var invoiceSearch = search.create({
				type: "invoice",
				filters: [
					["mainline","is",true],
					"and",
					["customer.parent","is",customerId]
				]
			});
			
			invoiceSearch.run().each(function(result){
				record.submitFields({
					type: "invoice",
					id: result.id,
					values: {
						custbody_est_date_of_repayment: estDateDistr
					}
				});
				
				return true;
			})
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
