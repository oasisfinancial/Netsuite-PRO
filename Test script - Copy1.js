/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/redirect','N/record'], function (redirect,record) {‌

    function afterSubmit(scriptContext) {‌
        var recObj = scriptContext.newRecord;
        var enrollmentId = Number(recObj.getValue('custrecord_nlc_charge_createdfrom'));
        log.debug('enrollment id',enrollmentId);
          log.debug('record type',recObj.type+'##'+recObj.id)
            if(recObj.type != 'charge'){
                    return;
            }                             
                                     //    if(scriptContext.type != 'create'){
                                       //       return;
                                       //  }
        if(enrollmentId > 0){

            record.submitFields({
                type : 'customrecord_nlc_enrollment',
                id : enrollmentId,
                values:{
                    'custrecord_nlc_enroll_charge' : recObj.id
                }
            })

           redirect.toRecord({
                type: 'customrecord_nlc_enrollment',
                id:enrollmentId ,       
        });
        }

          

        //var chargeId = recObj.id;


    }
    return {‌
        afterSubmit: afterSubmit
    }
    
});