/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 * @author
 */


 define(['N/record', 'N/search', 'N/runtime', 'N/format'],
 /**
  * @param {email} email
  * @param {file} file
  * @param {record} record
  * @param {search} search
  * @param {xml} xml
  */
 function(record, search, runtime, format) {
 
   /**
    * Marks the beginning of the Map/Reduce process and generates input data.
    *
    * @typedef {Object} ObjectRef
    * @property {number} id - Internal ID of the record instance
    * @property {string} type - Record type id
    *
    * @return {Array|Object|Search|RecordRef} inputSummary
    * @since 2015.1
    */
   function getInputData() {
 
     logit('Input Started');
 
     var customerSavedSearcg = runtime.getCurrentScript().getParameter({
       name: 'custscript_cust_category_srcid'
     });
     logit('customerSavedSearcg: ' + customerSavedSearcg);
 
     if (customerSavedSearcg) {
       var searchObj = search.load({id:customerSavedSearcg});
       logit('searchObj: ' + 'Returning Search Res');
       return searchObj;
     }else{
       return [];
     }
   }
 
 function logit(msg) {
   log.debug('*** Customer Category Update ***', msg)
 }
 
 
 /**
  * Executes when the map entry point is triggered and applies to each key/value pair.
  *
  * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
  * @since 2015.1
  */
 function map(context) {
   try {
 
     var searchResult = JSON.parse(context.value);
     logit('context.value: ' + JSON.stringify(searchResult));
     var customerid    = searchResult.id;
     logit('customerid. processing: ' + JSON.stringify(customerid));
     var email = searchResult.values.email;
     var phonenumber = searchResult.values.phone;
      logit('email. processing: ' + JSON.stringify(email));
      logit('phonenumber. processing: ' + JSON.stringify(phonenumber));
     setCustomerCategory(customerid,email,phonenumber);
 
   } catch (e) {
     log.error('nao error e is:', e);
   }
 
 }
 
 function getCustomerStatus(customerid) {
 
   if(customerid){
 
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
 
         log.debug('custid', 'custid--'+custid);
         return custid;
 
     }else{
       return null;
     }
 
   }
 
   }
 
 
 function setCustomerCategory(customerid,email,phonenumber) {
   try {
 
     var loadCustomer = record.load({
       type: 'customer',
       id: customerid
     });
      log.debug({
         title: 'In Customer STatus',
         details: 'latestatus'
       });
     var latestatus = getCustomerStatus(customerid);
 
     if(!latestatus){
       log.debug({
         title: 'latestatus',
         details: 'latestatus--Nio lastest returining'
       });
     }
 
     log.debug({
       title: 'latestatus',
       details: 'latestatus--' + latestatus
     });
 
     //If the Latest Status is Pending Assignment, Assignment Sent and Funded
     //Then set the Marketing Category to “Approved”
 
     if (latestatus == '6' || latestatus == '7' || latestatus == '8') {
       record.submitFields({
         type: 'customer',
         id: customerid,
         values: {
         'custentity_marketing_categories': 4
         }
       });
 
       log.debug({
         title: 'customerid',
         details: 'customerid-Updated with -4'
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
         details: 'customerid-Updated with -3'
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
         details: 'customerid-Updated with -2'
       });
     }
 
     //If the Latest Status is Pending Assignment, Assignment Sent and Funded
     //Then set the Marketing Category to “Approved”
     else {
 
      /* var email = loadCustomer.getValue({
         fieldId: 'email'
       });
       var phonenumber = loadCustomer.getValue({
         fieldId: 'phone'
       });*/
 
       if (email && phonenumber) {
 
         var isDuplicatePresent = searchDuplicateCustomer(email, phonenumber, customerid);
         if(!isDuplicatePresent){
 
 
           record.submitFields({
             type: 'customer',
             id: customerid,
             values: {
             'custentity_marketing_categories': 1
             }
           });
 
           log.debug({
             title: 'customerid',
             details: 'customerid-Updated with -'
           });
         }else{
           //get clarity what to set the default
           //search the transactions....
 
         /*  loadCustomer.setValue({
             fieldId: 'inactive',
             value: true
           }); */
   log.debug({
             title: 'customerid',
             details: 'Marketing Category is Not Updated - Duplicate found'
           });
 
 
         }
 
       }else{
          log.debug({
             title: 'customerid',
             details: 'Marketing Category is Not Updated -Email and Phone is not found'
           });
       }
 
     }
 
    // var customerid = loadCustomer.save();
    // log.debug('Customer Category Updated', 'Customer record saved = ' + customerid);
 
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
         ["phone", "is", phonenumber],
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
 
       for (var itr = 0;itr<searchRes.length;itr++)
       {
 
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
 
 
 
 /**
  * Executes when the summarize entry point is triggered and applies to the result set.
  *
  * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
  * @since 2015.1
  */
 function summarize(summary) {
 
 
   // Number of processors alloted from this script
   log.audit('Number of Processors', summary.concurrency);
   // Number of yields performed during the lifetime of the execution
   log.audit('Number of Yields', summary.yields);
 
   // Display errors in the getInputData stage
   if (summary.inputSummary.error) {
     log.error('Input error', summary.inputSummary.error);
   }
 
   // Display errors in the map stage
   if (summary.mapSummary.errors.iterators) {
     summary.mapSummary.errors.iterators().each(function(code, message) {
       log.error('Map Error: ' + code, message);
       return true;
     });
   }
 
   // Display errors in the reduce stage
   if (summary.reduceSummary.errors.iterators) {
     summary.reduceSummary.errors.iterators().each(function(code, message) {
       log.error('Reduce Error: ' + code, message);
       return true;
     });
   }
 }
 
 return {
   getInputData: getInputData,
   map: map
 };
 
 });
 