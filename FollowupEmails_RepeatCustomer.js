/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */

define([ 'N/record', 'N/search', 'N/file', 'N/email' ,'N/format', 'N/runtime'], 
	function(record, search, file, email, format, runtime) {
	function execute(context) {
		try{
			var scriptObj = runtime.getCurrentScript();
		    var DefaultSender = scriptObj.getParameter({name:'custscript_followup_defaultsender_repeat'});
		    var emailSubject = scriptObj.getParameter({name:'custscript_email_subject'});
          
            log.debug("DefaultSender",DefaultSender);
			log.debug("emailSubject",emailSubject);
			
		  var DefaultSenderText = 'Matt Milim';
          var DefaultEmail = 'matt@probateadvance.com';
		   
			
	//----------- Repeat Customer --------------
	
	var emailBody = '';
	
			var customerSearchObj = search.create({
   type: "customer",
   filters:
   [
      ["custentity_follow_up_type","anyof","3"], 
      "AND", 
      ["email","isnotempty",""],
	  "AND",
	  ["systemnotes.newvalue","is","Repeat Customer"]
   ],
   columns:
   [
      search.createColumn({
         name: "entityid",
         sort: search.Sort.ASC,
         label: "ID"
      }),
	  search.createColumn({name: "internalid", label: "Internaid"}),
      search.createColumn({name: "altname", label: "Name"}),
      search.createColumn({name: "custentity_follow_up_type", label: "Follow Up Type"}),
      search.createColumn({
         name: "formulatext",
         formula: "TRUNC({today}-TO_DATE({systemnotes.date}))",
         label: "Formula (Text)"
      }),
      search.createColumn({name: "firstname", label: "First Name"}),
      search.createColumn({name: "lastname", label: "Last Name"}),
	  search.createColumn({name: "custentity_date_created", label: "Date Created"})
   ]
});
var searchResultCount = customerSearchObj.runPaged().count;
				log.debug("customerSearchObj result count",searchResultCount);
		if(searchResultCount)
		{
			
			var startCount = 0;
			do{
				var searchResults = customerSearchObj.run().getRange({start: startCount,end: startCount+1000});
				startCount += 1000;

				for(var r=0; r<searchResults.length; r++){
					var id=searchResults[r].getValue({name: "internalid", label: "Internaid"});
					var entity_id=searchResults[r].getValue({name: "entityid",sort: search.Sort.ASC,label: "ID"});
					var firstname=searchResults[r].getValue({name: "firstname", label: "First Name"});
					var lastname=searchResults[r].getValue({name: "lastname", label: "Last Name"});
					var customer_email=searchResults[r].getValue({name: "email", label: "Email"});
					var followup_type=searchResults[r].getValue({name: "custentity_follow_up_type", label: "Follow Up Type"});
					var day=searchResults[r].getValue({name: "formulatext",formula: "TRUNC({today}-TO_DATE({systemnotes.date}))"});
					var dateCreated = searchResults[r].getValue({name: "custentity_date_created", label: "Date Created"});
					
					var date1 = new Date(dateCreated);
                    var today = new Date();
                    var diffTime = Math.abs(today - date1);
                    var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
					
					if(day == 0 || diffDays == 30)
					{
					   
	                   emailBody=file.load({
				                   id:4420
			                        }).getContents(); 
					emailBody=emailBody.replace('{firstName}',firstname);
					emailBody=emailBody.replace('{sender}',DefaultSenderText);
                     log.debug("emailBody",emailBody);
					
					   if(emailSubject && emailBody && DefaultSender && id)
                       {
                         log.debug("emailSubject",emailSubject);
                         log.debug("emailBody",emailBody);
                         log.debug("DefaultSender",DefaultSender);
                         log.debug("id",id);
                         
					 email.send({
				    author: DefaultSender,
				    recipients: id,
				    subject: emailSubject,
				    body: emailBody,
				  replyTo : DefaultEmail
				});	
				record.submitFields({
                       type: record.Type.CUSTOMER,
                       id: id,
                       values: {
                        custentity_date_created: today
                             },
                        options: {
                        enableSourcing: false,
                    ignoreMandatoryFields : true
                                }
					   });
					   
					   }
				   
					}
			
			
				}
			}while(searchResults.length==1000);
		}
		
// -------------- Referral Email------------------------------------

var referralEmailbody = '';


var searchObj = search.create({
   type: "customer",
   filters:
   [
      ["custentity_follow_up_type","anyof","4"], 
      "AND", 
      ["email","isnotempty",""],
	  "AND",
	  ["systemnotes.newvalue","is","Referral Email"]
   ],
   columns:
   [
      search.createColumn({
         name: "entityid",
         sort: search.Sort.ASC,
         label: "ID"
      }),
      search.createColumn({name: "altname", label: "Name"}),
      search.createColumn({name: "custentity_follow_up_type", label: "Follow Up Type"}),
      search.createColumn({
         name: "formulatext",
         formula: "TRUNC({today}-TO_DATE({systemnotes.date}))",
         label: "Formula (Text)"
      }),
      search.createColumn({name: "firstname", label: "First Name"}),
      search.createColumn({name: "lastname", label: "Last Name"}),
      search.createColumn({name: "custentity_date_created", label: "Date Created"})
   ]
});
var searchResult = searchObj.runPaged().count;
				log.debug("SearchObj result count",searchResult);
		if(searchResult)
		{
			var searchResultArray = new Array();
			var startCount = 0;
			do{
				var searchResults = searchObj.run().getRange({start: startCount,end: startCount+1000});
				startCount += 1000;

				for(var r=0; r<searchResults.length; r++){
					var id=searchResults[r].getValue({name: "internalid", label: "Internaid"});
					var entity_id=searchResults[r].getValue({name: "entityid",sort: search.Sort.ASC,label: "ID"});
					var firstname=searchResults[r].getValue({name: "firstname", label: "First Name"});
					var lastname=searchResults[r].getValue({name: "lastname", label: "Last Name"});
					var customer_email=searchResults[r].getValue({name: "email", label: "Email"});
					var followup_type=searchResults[r].getValue({name: "custentity_follow_up_type", label: "Follow Up Type"});
					var day=searchResults[r].getValue({name: "formulatext",formula: "TRUNC({today}-TO_DATE({systemnotes.date}))"});
					
				if(day == 0)
                  {
	                  
	                  referralEmailbody=file.load({
				                 id:4421
			                   }).getContents(); 
							   
					  referralEmailbody = referralEmailbody.replace('{firstName}',firstname);
                      referralEmailbody = referralEmailbody.replace('{lastName}',lastname);
                      referralEmailbody = referralEmailbody.replace('{sender}',DefaultSenderText);	
	
                   } 
                if(day == 30)
                 {
	              
	              referralEmailbody=file.load({
				                 id:4422
			                   }).getContents(); 
							   
					  referralEmailbody = referralEmailbody.replace('{firstName}',firstname);
                      referralEmailbody = referralEmailbody.replace('{lastName}',lastname);
                      referralEmailbody = referralEmailbody.replace('{sender}',DefaultSenderText);
	
                 } 	
               if(emailSubject && referralEmailbody && DefaultSender && id)
			   {
				   email.send({
				    author: DefaultSender,
				    recipients: id,
				    subject: emailSubject,
				    body: referralEmailbody,
					replyTo : DefaultEmail
				});	
			   }				   
					
				}

			}while(searchResults.length==1000);
		}

		} catch (e) {
			log.error('Error', e);
		}
		}
		return {
      execute: execute
  };
});