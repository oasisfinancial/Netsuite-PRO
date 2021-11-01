function Address_Update(request,response)
{
	var recordType = request.getParameter("rectype");
	var recordId = request.getParameter("recid");
	
	var record = nlapiLoadRecord(recordType,recordId);
	
	//Remove exisiting address
	for(var x=0; x < record.getLineItemCount("addressbook"); x++)
	{
		record.removeLineItem("addressbook",x+1);
		x--;
	}
	
	//Add new address
	record.selectNewLineItem("addressbook");
	record.setCurrentLineItemValue("addressbook","defaultbilling","T");
	record.setCurrentLineItemValue("addressbook","defaultshipping","T");
	
	var subrecord = record.createCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
	subrecord.setFieldValue('country', 'US');
	subrecord.setFieldValue('addressee', request.getParameter("name"));
	subrecord.setFieldValue('addr1', request.getParameter("street"));
	subrecord.setFieldValue('city', request.getParameter("city"));
	subrecord.setFieldValue('state', request.getParameter("state"));
	subrecord.setFieldValue('zip', request.getParameter("zip"));
	subrecord.commit();

	record.commitLineItem("addressbook");
	
	recordId = nlapiSubmitRecord(record,true,true);
}
