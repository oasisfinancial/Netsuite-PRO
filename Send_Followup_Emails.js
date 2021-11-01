/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */

define([ 'N/record', 'N/search', 'N/file', 'N/email' ,'N/format', 'N/runtime'], 
	function(record, search, file, email, format, runtime) {
	function execute(context) {
		try{
			
		    var scriptObj = runtime.getCurrentScript();
		    var DefaultSender = scriptObj.getParameter({name:'custscript_followup_defaultsender'});
		    var emailSubject = scriptObj.getParameter({name:'custscript_followup_email_subject'});
			
			//log.debug("DefaultSender",DefaultSender);
			//log.debug("emailSubject",emailSubject);
			
		   var DefaultSenderText = 'Matt Milim';
          var DefaultEmail = 'matt@probateadvance.com';
		   var replyToEmp = '';
	
	
			 var emailBody ='';
             var senderId ='';
            var senderText ='';
// ------------ Prospective ---------------------------------

			var SearchObj = search.create({
				   type: "customer",
				   filters:
				   [
				      ["systemnotes.newvalue","is","Prospective"],
					  "AND", 
                    ["email","isnotempty",""],
                       "AND",
                    ["custentity_follow_up_type","anyof","1"]
				   ],
				   columns:
				   [
				      search.createColumn({name: "entityid",sort: search.Sort.ASC,label: "ID"}),
				      search.createColumn({name: "internalid", label: "Internaid"}),
				      search.createColumn({name: "custentity_follow_up_type", label: "Follow Up Type"}),
				      search.createColumn({name: "formulatext",formula: "TRUNC({today}-TO_DATE({systemnotes.date}))"}),
				      search.createColumn({name: "firstname", label: "First Name"}),
				      search.createColumn({name: "lastname", label: "Last Name"}),
				      search.createColumn({name: "email", label: "Email"})


				   ]
				});
				var searchResultCount = SearchObj.runPaged().count;
				//log.debug("SearchObj result count",searchResultCount);
		if(searchResultCount)
		{

			var startCount = 0;
			do{
				var searchResults = SearchObj.run().getRange({start: startCount,end: startCount+1000});
				startCount += 1000;

				for(var r=0; r<searchResults.length; r++){
					var customerId=searchResults[r].getValue({name: "internalid", label: "Internaid"});
					var entity_id=searchResults[r].getValue({name: "entityid",sort: search.Sort.ASC,label: "ID"});
					var firstname=searchResults[r].getValue({name: "firstname", label: "First Name"});
					var lastname=searchResults[r].getValue({name: "lastname", label: "Last Name"});
					var customer_email=searchResults[r].getValue({name: "email", label: "Email"});
					var followup_type=searchResults[r].getValue({name: "custentity_follow_up_type", label: "Follow Up Type"});
					var day=searchResults[r].getValue({name: "formulatext",formula: "TRUNC({today}-TO_DATE({systemnotes.date}))"});
                  
				  if(day==1||day==3||day==5||day==10||day==20||day==30)
				  {
                    emailBody ='';
					// search for sender 
					var customrecord_case_statusSearchObj = search.create({
                       type: "customrecord_case_status",
                       filters:
                       [
                          ["custrecord_case_status_customer","anyof",customerId]
                       ],
                       columns:
                       [
                          search.createColumn({name: "owner", label: "Owner"}),
                          search.createColumn({
                             name: "internalid",
                             sort: search.Sort.DESC,
                             label: "Internal ID"
                          })
                       ]
                    });
                    var searchResultCount = customrecord_case_statusSearchObj.runPaged().count;
                    //log.debug("customrecord_case_statusSearchObj result count",searchResultCount);
                    customrecord_case_statusSearchObj.run().each(function(result){
                       // .run().each has a limit of 4,000 results
                       senderId = result.getValue({name: "owner"});
                                 
                      senderText = result.getText({name: "owner"});
                      
                      if(!(senderId && senderText))
                        {
                          senderId = DefaultSender;
                          senderText = DefaultSenderText;
                          replyToEmp = DefaultEmail;
                        }
                      	else{
                          var employeeSearchObj = search.create({
                             type: "employee",
                             filters:
                             [
                                ["internalid","anyof",senderId]
                             ],
                             columns:
                             [
                                search.createColumn({name: "email", label: "Email"})
                             ]
                          });
                          var searchResultCount = employeeSearchObj.runPaged().count;
                          //log.debug("employeeSearchObj result count",searchResultCount);
                          employeeSearchObj.run().each(function(result){
                            	replyToEmp = result.getValue({name: "email"});
                          });
                      }
                       //return true;
                    });  
                  	
                    if(day == 1)
                    {
                        emailBody=file.load({
                          id:4413
                        }).getContents(); 
						
                      	emailBody=emailBody.replace('{firstName}',firstname);
                        emailBody=emailBody.replace('{sender}',senderText);
                      //log.debug("emailBody1",emailBody);

                    }
                    if(day == 3)
                    {
                         emailBody=file.load({
                                    id:4414
                                }).getContents(); 
                                
                      emailBody=emailBody.replace('{firstName}',firstname);
                      emailBody=emailBody.replace('{lastName}',lastname);
                      emailBody=emailBody.replace('{sender}',senderText);
					  //log.debug("emailBody3",emailBody);

                    } 
                    if(day == 5)
                    {
                         emailBody=file.load({
                                    id:4415
                                }).getContents(); 
                      emailBody=emailBody.replace('{firstName}',firstname);
                      emailBody=emailBody.replace('{sender}',senderText);
                    //log.debug("emailBody5",emailBody);
                    } 
                    if(day == 10)
                    {
                         emailBody=file.load({
                                    id:4416
                                }).getContents(); 
                        emailBody=emailBody.replace('{firstName}',firstname);
                      emailBody=emailBody.replace('{lastName}',lastname);
                      emailBody=emailBody.replace('{sender}',senderText);
                       //log.debug("emailBody10",emailBody);
                    } 
                    if(day == 20)
                    {
                         emailBody=file.load({
                                    id:4417
                                }).getContents(); 

                      emailBody=emailBody.replace('{firstName}',firstname);
                      emailBody=emailBody.replace('{lastName}',lastname);
                      emailBody=emailBody.replace('{sender}',senderText);
                     //log.debug("emailBody20",emailBody);
                    } 
                    if(day == 30)
                    {
                          emailBody=file.load({
                                    id:4418
                                }).getContents();
                      emailBody=emailBody.replace('{firstName}',firstname);
                      emailBody=emailBody.replace('{lastName}',lastname);
                      emailBody=emailBody.replace('{sender}',senderText);			
                   //log.debug("emailBody30",emailBody);
                    } 
             if(emailSubject && emailBody && senderId && customerId)
              {
	      log.debug("email send", emailSubject + ':'  + day + ': sender-'+senderId+': receiver-' + customerId );
	              email.send({
				    author: senderId,
				    recipients:  [senderId,customerId],
				    subject: emailSubject,
				    body: emailBody,
                  replyTo : replyToEmp
				});	



				}
				}
				}
              
              }while(searchResults.length==1000);

		}
// -------------- Contract sent --------------------------

 var customerSearchObj = search.create({
   type: "customer",
   filters:
   [
      ["custentity_follow_up_type","anyof","2"], 
      "AND", 
      ["email","isnotempty",""]
	  
   ],
   columns:
   [
      search.createColumn({
         name: "entityid",
         sort: search.Sort.ASC,
         label: "ID"
      }),
      search.createColumn({name: "altname", label: "Name"}),
      search.createColumn({name: "internalid", label: "Internaid"}),
      search.createColumn({name: "firstname", label: "First Name"}),
      search.createColumn({name: "lastname", label: "Last Name"})
   ]
});
var searchResult = customerSearchObj.runPaged().count;
				//log.debug("customerSearchObj result count",searchResult);
		if(searchResult)
		{
	
			var start = 0;
			do{
				var contractSearchResults = customerSearchObj.run().getRange({start: start,end: start+1000});
				start += 1000;

				for(var r=0; r<contractSearchResults.length; r++){
					var id=contractSearchResults[r].getValue({name: "internalid", label: "Internaid"});
					var entity_id=contractSearchResults[r].getValue({name: "entityid",sort: search.Sort.ASC,label: "ID"});
					var firstname=contractSearchResults[r].getValue({name: "firstname", label: "First Name"});
					var lastname=contractSearchResults[r].getValue({name: "lastname", label: "Last Name"});

					
		// -------- Search for sender ---------------------
		var sender = '';
		var senderName = '';
		var replyToMail = '';
		
		var estimateSearchObj = search.create({
   type: "estimate",
   filters:
   [
      ["type","anyof","Estimate"], 
      "AND", 
      ["name","anyof",id], 
      "AND", 
      ["systemnotes.type","is","T"], 
      "AND", 
      ["mainline","is","T"]
   ],
   columns:
   [
      search.createColumn({
         name: "internalid",
         sort: search.Sort.DESC,
         label: "Internal ID"
      }),
      search.createColumn({name: "tranid", label: "Document Number"}),
      search.createColumn({
         name: "name",
         join: "systemNotes",
         label: "Set by"
      })
   ]
});
var searchResultCount = estimateSearchObj.runPaged().count;
//log.debug("estimateSearchObj result count",searchResultCount);
estimateSearchObj.run().each(function(result){
   // .run().each has a limit of 4,000 results
 sender = result.getValue({name: "name",join: "systemNotes",label: "Set by"});
 
 senderName = result.getText({name: "name",join: "systemNotes",label: "Set by"});
                      
                      if(!(sender && senderName))
                        {
                          sender = DefaultSender;
                          senderName = DefaultSenderText;
                          replyToMail = DefaultEmail;
                        }
                      	else{
                          var employeeSearchObj = search.create({
                             type: "employee",
                             filters:
                             [
                                ["internalid","anyof",sender]
                             ],
                             columns:
                             [
                                search.createColumn({name: "email", label: "Email"})
                             ]
                          });
                          var searchResultCount = employeeSearchObj.runPaged().count;
                          //log.debug("employeeSearchObj result count",searchResultCount);
                          employeeSearchObj.run().each(function(result){
                            	replyToMail = result.getValue({name: "email"});
                          });
						}
                       });


var emailContractBody=file.load({
				id:4419
			}).getContents(); 
 emailContractBody = emailContractBody.replace('{firstName}',firstname);
 emailContractBody = emailContractBody.replace('{sender}',senderName);

if(emailSubject && emailContractBody && sender && id)
{

        /*     email.send({
				    author: sender,
				    recipients: id,
				    subject: emailSubject,
				    body: emailContractBody,
					replyTo : replyToMail
				});	*/

				}
		
				}
			}while(contractSearchResults.length==1000);
			
		}  

		} catch (e) {
			log.error('Error', e);
		}
	}	

  return {
      execute: execute
  };
});