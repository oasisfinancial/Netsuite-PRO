/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet 
 */

define(['N/ui/serverWidget', 'N/log'],
    function (serverWidget, log) {
        function onRequest(context) {
            if (context.request.method === 'GET') {
                var form = serverWidget.createForm({
                    title: 'Guid Form'
                });
                
                form.addCredentialField({
                    id: 'password123',
                    label: 'Password',
                    restrictToScriptIds: ['customscript_uploadinvoice_ss'],
                    restrictToDomains: ['ftp.keyhealth.net'],
       restrictToCurrentUser: true 
                });
                form.addSubmitButton({
                    label: 'Submit Button'
                });
                context.response.writePage(form);
                return;
            } else {
                var requset = context.request;
                var myPwdGuid = requset.parameters.password123;
                log.debug("myPwdGuid", myPwdGuid);
                context.response.write(myPwdGuid);
            }
        }

        return {
            onRequest: onRequest
        };
    }
);