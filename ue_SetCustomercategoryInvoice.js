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
 * Description          : This script will set the customer category once Invoice is saved...
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
        var currRec   = scriptContext.newRecord;

      /*  var loadInvoice = record.load({
          type: 'invoice',
          id: currRecId
        });*/
        var customerid = currRec.getValue({
          fieldId: 'entity'
        });


        log.debug({
          title: 'customerid',
          details: 'customerid--' + customerid
        });

        /* var loadCustomer = record.load({
           type: 'customer',
           id: customerName
         }); */

        var latestStatus;
        var lookupValues = search.lookupFields({
          type: 'customer',
          id: customerid,
          columns: ['custentity_marketing_categories']
        });
        log.debug({
          title: 'lookup',
          details: JSON.stringify(lookupValues)
        });
        if (lookupValues) {

          latestStatus = lookupValues.custentity_marketing_categories[0].value;
          log.debug({
            title: 'latestStatus',
            details: 'latestStatus--' + latestStatus
          });

        }

        // var latestStatus = getCustomerStatus(customerid);

        //If the Latest Status is Pending Assignment, Assignment Sent and Funded
        //Then set the Marketing Category to “Approved”

        if (latestStatus == '3' && latestStatus != '4') {
          record.submitFields({
            type: 'customer',
            id: customerid,
            values: {
              custentity_marketing_categories: 4
            }
          });

          log.debug({
            title: 'latestStatus',
            details: 'set to 4--'
          });
        } else {
          record.submitFields({
            type: 'customer',
            id: customerid,
            values: {
              custentity_marketing_categories: 3
            }
          });
          log.debug({
            title: 'latestStatus',
            details: 'set to 3--'
          });

        }
        // var customerid = loadCustomer.save();
        // log.debug('Customer Category Updated', 'Customer record saved = ' + customerid);

      } catch (e) {
        log.error('Error Details:', e);
      }
    }

    function getCustomerStatus(customerid) {

      if (customerid) {

        var customrecord_SearchObj = search.create({
          type: "customrecord_case_status",
          filters: [
            ["custrecord_case_status_customer", "anyof", customerid]
          ],
          columns: [search.createColumn({
            name: "custrecord_case_status_status",
            label: "Status"
          })]
        });

        var resultsObj = customrecord_SearchObj.run();
        var exchangeResults = resultsObj.getRange({
          start: 0,
          end: 100
        });
        var custid;
        if (exchangeResults && exchangeResults.length > 0) {
          log.error('getCurrencyInfo is ', JSON.stringify(exchangeResults));

          var custid = exchangeResults[0].getValue({
            name: "custrecord_case_status_status",
            label: "Status"
          });

          log.debug('custid', 'custid--' + custid);
          return custid;

        } else {
          return null;
        }

      }




    }



    return {
      afterSubmit: aftersubmit
    };

  });