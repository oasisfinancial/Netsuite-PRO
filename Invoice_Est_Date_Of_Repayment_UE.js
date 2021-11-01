/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */

define(["N/record","N/search"],function(record,search){
	
	function afterSubmit(context)
	{
		if(context.type="create" || context.type=="edit")
		{
			try
			{
				var customer = context.newRecord;
				var estDateDistr = customer.getValue({fieldId:"custentity_est_date_of_distribution"});
				
				if((context.type=="create" && estDateDistr!=null && estDateDistr!="") || (context.type=="edit" && estDateDistr!=context.oldRecord.getValue({fieldId:"custentity_est_date_of_distribution"})))
				{
					var invoiceSearch = search.create({
						type: "invoice",
						filters: [
							["mainline","is",true],
							"and",
							["customer.parent","is",context.newRecord.id]
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
					});
				}
			}
			catch(err)
			{
				log.error("Error Syncing Est Date of Repayment (ID: " + context.newRecord.id + ")","Details: " + err.message);
			}
		}
	}
	
	return {
		afterSubmit: afterSubmit
	}
})
