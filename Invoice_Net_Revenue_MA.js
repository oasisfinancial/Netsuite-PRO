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
				columns: ["total","amountremaining"]
			});
			
			var invoiceTotal = parseFloat(invoiceFields.total);
			log.debug("Invoice Total",invoiceTotal);
			
			var invoiceDue = parseFloat(invoiceFields.amountremaining);
			if(invoiceDue==null || invoiceDue=="")
				invoiceDue = 0.00;
			log.debug("Invoice Due",invoiceDue);
			
			var paymentTotal = 0;
			var discountTotal = 0;
			var rebateTotal = 0;
			
			//Find associated payments with invoice
			var paymentSearch = search.create({
				type: "customerpayment",
				filters: [
					["appliedtotransaction","is",invoiceId],
					"and",
					["paidtransaction","is",invoiceId]
				],
				columns: [
					{name: "paidamount"},
					{name: "paidamountisdiscount"}
				]
			});
			
			paymentSearch.run().each(function(result){
				
				log.debug("Is Discount?",result.getValue({name:"paidamountisdiscount"}));
				
				if(result.getValue({name:"paidamountisdiscount"})==true)
					discountTotal += parseFloat(result.getValue({name:"paidamount"}));
				else
					paymentTotal += parseFloat(result.getValue({name:"paidamount"}));
				
				return true;
			});
			
			discountTotal = discountTotal * -1;
			
			log.debug("Total Payments",paymentTotal);
			log.debug("Total Discounts",discountTotal);
			
			//Find total cash advanced on invoice
			var cashAdvanced = 0;
			var invoiceSearch = search.create({
				type: "invoice",
				filters: [
					["internalid","is",invoiceId],
					"and",
					["item","is",7]
				],
				columns: ["amount"]
			});
			
			invoiceSearch.run().each(function(result){
				cashAdvanced += parseFloat(result.getValue({name:"amount"}));
				return true;
			});
			
			cashAdvanced = cashAdvanced * -1;
			
			log.debug("Total Cash Advanced",cashAdvanced);
			
			//Find associated rebates with invoice
			var rebateSearch = search.create({
				type: "journalentry",
				filters: [
					["custcol_invoice","is",invoiceId],
					"and",
					["account","is",231]
				],
				columns: [
					{name: "amount"}
				]
			});
			
			rebateSearch.run().each(function(result){
				rebateTotal += parseFloat(result.getValue({name:"amount"}));
				return true;
			});
			
			rebateTotal = rebateTotal * -1;
			log.debug("Total Rebates",rebateTotal);
			
			var badDebtTotal = 0;
			
			//Find associated payments with invoice
			var badDebtSearch = search.create({
				type: "customerpayment",
				filters: [
					["appliedtotransaction","is",invoiceId],
					"and",
					["paidtransaction","is",invoiceId],
					"and",
					["accountmain","is",260]
				],
				columns: [
					{name: "paidamount"}
				]
			});
			
			badDebtSearch.run().each(function(result){
				badDebtTotal += parseFloat(result.getValue({name:"paidamount"}));
				return true;
			});
			
			log.debug("Total Bad Debt",badDebtTotal);
			
			var additionalDeposits = 0;
			
			//Find additional deposits for this invoice
			var depositSearch = search.create({
				type: "deposit",
				filters: [
					["custbody_invoice","is",invoiceId],
					"and",
					["mainline","is",true]
				],
				columns: [
					{name: "amount"}
				]
			});
			
			depositSearch.run().each(function(result){
				additionalDeposits += parseFloat(result.getValue({name:"amount"}));
				return true;
			});
			
			log.debug("Total Additional Deposits",additionalDeposits);
			
			var netRevenue = (invoiceTotal - invoiceDue) + cashAdvanced + discountTotal + rebateTotal - badDebtTotal + additionalDeposits;
			log.debug("Net Revenue",netRevenue);
			
			record.submitFields({
				type: "invoice",
				id: invoiceId,
				values: {
					custbody_net_revenue: netRevenue
				}
			});
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
