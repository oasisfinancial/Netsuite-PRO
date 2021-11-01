function userEventAfterSubmit(type)
{
if(type == 'create' || type == 'edit')
{
	var recid = nlapiGetRecordId();
	
	var customerSearch = nlapiSearchRecord("customer",null,
[
   ["stage","anyof","CUSTOMER"], 
   "AND", 
   ["internalid","anyof",recid], 
   "AND", 
   ["systemnotes.newvalue","is","Repeat Customer"],
   "AND", 
   ["custentity_follow_up_type","anyof","3"]
], 
[
   new nlobjSearchColumn("date","systemNotes",null)
]
);
  if(customerSearch)
    {
var createdDate = customerSearch[0].getValue("date","systemNotes",null);
nlapiLogExecution('DEBUG','createdDate',createdDate);
if(createdDate)
{
	var createdDateSplit = createdDate.split(' ');
	nlapiLogExecution('DEBUG','createdDate[0]',createdDateSplit[0]);
  if(createdDateSplit[0])
	nlapiSubmitField('customer',recid,'custentity_date_created',createdDateSplit[0]);
}
    }
}

}