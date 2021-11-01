/**
 *@NApiVersion 2.0
 *@NScriptType ScheduledScript
 */
 define(['N/email','N/runtime','N/file','N/search','N/record'], function(email,runtime,file,search,record){
    function Lead_API(){
        try{
            var loadserach = search.load({
                id: 'customsearch254',
            });
            var scriptObj = runtime.getCurrentScript();
            var emailBodyFile = scriptObj.getParameter({name:'custscript_email_body_file1'});
            var emailSubject = scriptObj.getParameter({name:'custscript_lead_email_subject1'});
            //log.debug('loadserach',loadserach.run());
            loadserach.run().each(function(result){
                var detail = result.getValue({
                    name: "detail",
                    join: "executionLog"
                });
                log.debug('detail',JSON.parse(detail));
                var datain = JSON.parse(detail);  
                var customerEmail = datain.email;  
                if(customerEmail){    
                    var customerId = custsearch(customerEmail);
                    //log.debug('custId',customerId);
                    if(customerId != false){
                        //log.debug('email inside')
                        var loadrec = record.load({
                            type: 'customer',
                            id: customerId,
                            isDynamic: true
                        });
                        var emailSent = loadrec.getValue('custentity_email_sent');
                        if(emailSent == false){
                            //log.debug('email sent')
                            var DefaultSenderText = 'Probate Advance'
                            var empEmail = 'referral@probateadvance.com';
                            var senderId;
                            // log.debug('datain.email',datain.email)
                            var emailBody=file.load({
                                id:emailBodyFile
                            }).getContents(); 
                            emailBody=emailBody.replace('{firstName}',datain.firstname);
                            emailBody=emailBody.replace('{lastName}',datain.lastname);
                            emailBody=emailBody.replace('{sender}',DefaultSenderText);
                            if(runtime.envType == 'PRODUCTION'){
                                senderId = 751981;
                            }
                            else{
                                senderId = 658876;
                            }   
                            //log.debug("senderId",senderId);
                            email.send({
                                author: senderId,
                                body: emailBody,
                                recipients: [customerEmail,empEmail],
                                subject: emailSubject
                            });
                            log.debug('email sent',customerEmail); 
                            loadrec.setValue('custentity_email_sent',true);
                            loadrec.save();
                            //var id = loadrec.save();
                            //log.debug('id',id);
                        }
                    }    
                } 
                return true;    
            });    
        }  
        catch(err){
            log.error("Error Email Send","Details: " + err.message);
        }
    }  
    function custsearch(customerEmail){
        try{
            var customerSearchObj = search.create({
                type: "customer",
                filters:
                [
                   ["email","is",customerEmail]//, 
                   //"AND", 
                  // ["custentity_email_sent","is","T"]
                ],
                columns:
                [
                   search.createColumn({name: "internalid", label: "Internal ID"})
                ]
                });
                var custId;
                customerSearchObj.run().each(function(result){
                    custId = result.id;
                    return true;
                });
                if(custId)
                    return custId;
                else
                    return false;       
        }catch(e){
            log.error('e',e);
        }
    } 
    return {
        execute: Lead_API
    }
});