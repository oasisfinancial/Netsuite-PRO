/**
 *@NApiVersion 2.0
 *@NScriptType Restlet
 */
 define(['N/email','N/runtime','N/file'], function(email,runtime,file){
    function Lead_API(datain){
        try{
            log.debug("Incoming Data",JSON.stringify(datain));
            if (datain != null && datain != '' && datain != undefined && datain != Infinity && datain != NaN){
                var rtnObj = {
                    success : true,
                    message : "Emai Send successful"
                };
                var scriptObj = runtime.getCurrentScript();
                var emailBodyFile = scriptObj.getParameter({name:'custscript_email_body_file'});
                var emailSubject = scriptObj.getParameter({name:'custscript_lead_email_subject'});
                var customerEmail = datain.email;
                var DefaultSenderText = 'Probate Advance'
                var empEmail = 'referral@probateadvance.com';
                var senderId;
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
            }
        }
        catch(err){
            log.error("Error Email Send","Details: " + err.message);
            rtnObj.success = false;
            rtnObj.message = err.message;
        }
        return rtnObj;
    }
    return {
        post: Lead_API
    }
});