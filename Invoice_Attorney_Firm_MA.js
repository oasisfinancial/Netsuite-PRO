/**
 * @NApiVersion 2.x
 * @NScriptType MassUpdateScript
 */

define(["N/record","N/search"],function(record,search){
	
	function each(context)
	{
		try
		{
			var invoiceId = context.id;
			log.debug("Invoice Record ID",invoiceId);
			
			var invoiceFields = search.lookupFields({
				type: "invoice",
				id: invoiceId,
				columns: ["customer.parent"]
			});
			
			var estate = invoiceFields["customer.parent"][0].value;
			log.debug("Estate",estate);
			
			if(estate!=null && estate!="")
			{
				//Find linked attorney to estate
				var attorneySearch = search.create({
					type: "contact",
					filters: [
						["company","is",estate],
						"and",
						["category","is","1"]
					]
				});
				
				var attorneyId = "";
				
				attorneySearch.run().each(function(result){
					attorneyId = result.id;
					return false;
				});
				
				log.debug("Attorney ID",attorneyId);
				
				var estateFields = search.lookupFields({
					type: "customer",
					id: estate,
					columns: ["custentity_filing_date"]
				});
				
				var filingDate = estateFields.custentity_filing_date;
				log.debug("Filing Date",filingDate);
				
				record.submitFields({
					type: "invoice",
					id: invoiceId,
					values: {
						custbody_attorney: attorneyId,
						custbody_ct_filing_date: filingDate
					}
				});
			}
			
			
		}
		catch(err)
		{
			log.error("Error Updating Invoice Net Revenue","Details: " + err.message);
		}
	}
	
	return {
		each: each
	}
})
