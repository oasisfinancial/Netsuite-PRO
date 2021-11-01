function Document_Uploader(request,response)
{
	if(request.getMethod()=="GET")
	{
		var form = nlapiCreateForm("Upload Stamped Assignment",true);
		
		var fld = form.addField("custpage_file","file","Select File");
		fld.setMandatory(true);
		
		fld = form.addField("custpage_invoice","select","Invoice","invoice");
		fld.setDefaultValue(request.getParameter("invoice"));
		fld.setDisplayType("hidden");
		
		form.addSubmitButton("Upload");
		
		response.writePage(form);
	}
	else
	{
		//Get file from form, add folder, and submit
		var fileObj = request.getFile("custpage_file");
		fileObj.setFolder(195);
		var fileId = nlapiSubmitFile(fileObj);
		
		//Attach file to estate record
		nlapiAttachRecord("file",fileId,"invoice",request.getParameter("custpage_invoice"));
		
		nlapiSubmitField("invoice",request.getParameter("custpage_invoice"),"custbody_stamped_assignment",fileId);
		
		//Callback to requesting form to update sublist
		var script = "<script>";
			script+= "window.opener.fileUploadCallback();";
			script+= "this.close();";
			script+= "</script>";
			
		response.write(script);
	}
}
