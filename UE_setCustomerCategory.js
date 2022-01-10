/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */


/**
 * Script Type          : User Event Script
 * Script Name          : NS UE set Customer category
 * Author               :
 * Start Date           :
 * Jira Ticket      :
 * Description          : This script will set the customer category
 */

define(['N/search', 'N/record', 'N/runtime'],

  function(search, record, runtime) {

    /**
     * Function definition to be triggered before submit.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function aftersubmit(scriptContext) {
      try {

        var currRecId = scriptContext.newRecord.id;
        var cateforyid = 'custentity_cust_category';

        var loadCustomer = record.load({
          type: 'customrecord_case_status',
          id: currRecId
        });
        var latestatus = loadCustomer.getValue({
          fieldId: 'custrecord_case_status_status'
        });

        var customerid = loadCustomer.getValue({
          fieldId: 'custrecord_case_status_customer'
        });


        log.debug({
          title: 'latestatus',
          details: 'latestatus--' + latestatus
        });

        log.debug({
          title: 'customerid',
          details: 'customerid--' + customerid
        });

        //If the Latest Status is Pending Assignment, Assignment Sent and Funded
        //Then set the Marketing Category to “Approved”
        
        if(latestatus=='1')
         {
              record.submitFields({
              type: 'customer',
              id: customerid,
              values: {
                'custentity_marketing_categories': 1
              }
            });
          }

        else if (latestatus == '6' || latestatus == '7' || latestatus == '8') {

          record.submitFields({
            type: 'customer',
            id: customerid,
            values: {
              'custentity_marketing_categories': 4
            }
          });

          log.debug({
            title: 'customerid',
            details: 'customerid-Updated with -' + 4
          });

        }

        //If the Latest Status is Pending Approval or Pending Additional Information
        //Then set the Marketing Category is “Submitted to Diligence”
        else if (latestatus == '4' || latestatus == '5') {
          record.submitFields({
            type: 'customer',
            id: customerid,
            values: {
              'custentity_marketing_categories': 3
            }
          });

          log.debug({
            title: 'customerid',
            details: 'customerid-Updated with -' + 3
          });
        }

        //If the Latest Status is Live Deal or Ready for Diligence or Diligence in process
        //Then set the Marketing Category is “Verified Customer Application”
        else if (latestatus == '2' || latestatus == '3' || latestatus == '11') {
          record.submitFields({
            type: 'customer',
            id: customerid,
            values: {
              'custentity_marketing_categories': 2
            }
          });

          log.debug({
            title: 'customerid',
            details: 'customerid-Updated with -' + 2
          });
        }

        //If the Latest Status is Pending Assignment, Assignment Sent and Funded
        //Then set the Marketing Category to “Approved”
        else {

          var customerLookUp = search.lookupFields({
            type: search.Type.CUSTOMER,
            id: customerid,
            columns: ['email', 'phone']
          });

          var email = customerLookUp.email;
          var phonenumber = customerLookUp.phone;

          log.debug('customerid','email--'+email);
          log.debug('phonenumber','phonenumber--'+phonenumber);

          if (email && phonenumber) {

            var isDuplicatePresent = searchDuplicateCustomer(email, phonenumber, currRecId);
            if (!isDuplicatePresent) {
              record.submitFields({
                type: 'customer',
                id: customerid,
                values: {
                  'custentity_marketing_categories': 1
                }
              });

              log.debug({
                title: 'customerid',
                details: 'customerid-Updated with -1'
              });
            } else {
              //get clarity what to set the default
              //search the transactions....

              /*  loadCustomer.setValue({
                  fieldId: 'inactive',
                  value: true
                }); */

                  log.debug('phonenumber','Duplicate found--');

            }

          }else{
            log.debug('phonenumber','NO EMAIL AND PHONE FOUDN--');
          }

        }
      } catch (e) {
        log.error('Error Details:', e);
      }
    }

    function searchDuplicateCustomer(email, phonenumber, currRecId) {
      try {

        var duplicateFound = false;
        log.debug('phonenumber+email', phonenumber + '_' + email);
        var customerSearchObj = search.create({
          type: 'customer',
          filters: [
            ["phone", "is", phonenumber],"AND",
            ["email", "is", email]
          ],
          columns: ['internalid']
        });

        var runsearch = customerSearchObj.run();
        var searchRes = runsearch.getRange({
          start: 0,
          end: 1000
        });
        if (searchRes && searchRes.length > 0) {

          for (var itr = 0; itr < searchRes.length; itr++) {

            var id = searchRes[itr].getValue({
              fieldId: 'internalid'
            });
            log.debug('id+id', 'id_' + id);
            if (id != currRecId) {
              duplicateFound = true;
            }
          }
        }

        return duplicateFound;
        log.debug('duplicateFound', 'duplicateFound--' + duplicateFound)
      } catch (err) {
        log.debug('customer search', err);
      }
    }


    return {
      afterSubmit: aftersubmit
    };

  });
