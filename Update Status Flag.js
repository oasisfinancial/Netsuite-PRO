/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Sep 2021     osanjekar
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type){

	try
	{
		var customerVal=nlapiGetFieldValue('custrecord_case_status_customer');

		var customrecord_case_statusSearch = nlapiSearchRecord("customrecord_case_status",null,
				[
					["custrecord_case_status_customer","anyof",customerVal], 
					"AND", 
					["custrecord_latest_status","is","T"]
					], 
					[
						new nlobjSearchColumn("scriptid").setSort(false), 
						new nlobjSearchColumn("custrecord_case_status_status"), 
						new nlobjSearchColumn("custrecord_case_status_notes")
						]
		);
		if(customrecord_case_statusSearch)
		{
			nlapiSubmitField(nlapiGetRecordType(),customrecord_case_statusSearch[0].getId(),'custrecord_latest_status','F');
			nlapiLogExecution('DEBUG','old Status removed');
		}

		var customrecord_case_statusSearch = nlapiSearchRecord("customrecord_case_status",null,
				[
					["custrecord_case_status_customer","anyof",customerVal]
					], 
					[
						new nlobjSearchColumn("internalid").setSort(true)
					]
		);

		if(customrecord_case_statusSearch)
		{
			nlapiSubmitField(nlapiGetRecordType(),customrecord_case_statusSearch[0].getId(),'custrecord_latest_status','T');
			nlapiLogExecution('DEBUG','Latest Status Updated');
		}

	}catch(e)
	{
		nlapiLogExecution('ERROR','Error occured',e);
	}

}
