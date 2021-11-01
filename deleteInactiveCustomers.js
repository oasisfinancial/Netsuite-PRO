/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */

/**
 * Script Type          : Scheduled Script
 * Script Name          : Delete Inactive Customer Records
 * Author               :
 * Start Date           :
 * Jira Ticket      :
 * Description          : This scheduled script will delete the Customers which are inactive over 365 days..
 */

define(['N/search', 'N/record', 'N/log', 'N/runtime', 'N/email'],

  function(search, record, log, runtime, email) {

    function logmsg(msg) {
      log.debug('Delete Customer', msg);
    }

    function execute(scriptContext) {
      try {

        logmsg('  *** SCHEDULED SCRIPT STARTED ***');

        //adding code to send the error notifications for Coupa - NS integration...

        var savedSearchId = runtime.getCurrentScript().getParameter({
          name: 'custscript_inactive_customer_src'
        });

        var folderID = runtime.getCurrentScript().getParameter({
          name: 'custscript_inactive_folderid'
        });

        logmsg('Saved Search ID:' + savedSearchId);

        if (!savedSearchId) {
          return;
        }
        var transearchLoad = search.load({
          id: savedSearchId
        });

        var startIndex = 0;
        var endIndex = 1000;

        //log.debug('Search Res ',transearchLoad);
        // var colArray  = transearchLoad.columns;
        var columnName = [];
        var TempArr = '';
        var temp_ = new Array();
        var csvcontent = new Array();
        var content = [];
        var labelcopied = true;
        var columnLabel = [];


        //log.debug('colArray ',colArray);
        var runSearchRes = transearchLoad.run();
        while (true) {
          var searchRes = runSearchRes.getRange({
            start: startIndex,
            end: endIndex
          });
          if (searchRes && searchRes.length > 0) {
            if (labelcopied) {
              var searchCol_ = searchRes[0];
              var columnName_ = searchCol_.columns;
              for (var y = 0; y < columnName_.length; y++) {
                columnLabel.push((columnName_[y].label).trim());
              }
              labelcopied = false;
            }

            for (var i = 0; i < searchRes.length; i++) {
              var searchCol = searchRes[i];
              columnName = searchCol.columns;

              temp_ = [];

              for (var y = 0; y < columnName.length; y++) {
                //log.debug('This is Column Name :'+columnName[y].name);
                temp_.push(searchCol.getValue(columnName[y]));
              }
              csvcontent.push(temp_);
            }
            startIndex = endIndex;
            endIndex = endIndex + 1000;
          } else {
            break;
          }

        }

        var columnsArr_ = [];
        for (var t1 = 0; t1 < columnLabel.length; t1++) {
          columnsArr_.push(columnLabel[t1].trim());
        }
        csvcontent.unshift(columnsArr_);
        var contents_csv = '';
        for (var z1 = 0; z1 < csvcontent.length; z1++) {
          //log.debug('Search Res ','Test in Loop:'+contents_);
          contents_csv += csvcontent[z1].toString() + '\n';
        }

        log.debug('CSV File Pushed:');

        /**
         * End of New Code for the CSV file creation
         */
        var fileName_ = getFileName() + '.csv';
        var fileObj = file.create({
          name: fileName_,
          fileType: file.Type.CSV,
          contents: contents_csv
        });

        fileObj.folder = folderID;
        var fileId_csv = fileObj.save();
        log.debug('CSV File Saved:' + fileId_csv);

        var fileObjCSV = file.load({
          id: fileId_csv
        });

        /**
         * End of File Creation
         */


        //Get the Sender and Recipient Mail
        var senderId = runtime.getCurrentScript().getParameter("custscript_file_sender_id");
        var recipientId = runtime.getCurrentScript().getParameter("custscript_delecust_receip");
        var email_IDS = recipientId.split(',');

        var bodyemail = 'Hi Team,</br> Please find the attached customer details which are deleted. .</br></br>' + strName + '</br></br> Thanks,';

        var fileObj = file.load({
          id: fileId
        });

        try {

          //Send the CSV Mail

          email.send({
            author: senderId,
            recipients: email_IDS,
            subject: 'Inactive-Deleted-CustomerList',
            body: bodyemail,
            attachments: [fileObjCSV],
          });
        } catch (e) {

          var ErrorMeaage = e.name + 'Error Description :' + e.message;
          log.error('Error Occurred In scheduled script is', ErrorMeaage);
        }
      } catch (ERR) {
        log.error('Error Occurred In scheduled script is', ERR);
      }
      log.debug('  *** SCHEDULED SCRIPT END ***   ', '   *** SCHEDULED SCRIPT END ***   ');
    }

    function getFileName() {

      var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      var d = new Date();
      var monthName = monthNames[d.getMonth()];
      var Year = d.getFullYear();

      log.debug('Month Name :' + monthName);
      log.debug('Full Year :' + Year);

      var currentDate = new Date();
      var currentday = currentDate.getDate().toString();
      var currentmonth = (currentDate.getMonth() + 1).toString();
      var len = currentmonth.length;
      if (len == 1) {
        currentmonth = '0' + currentmonth;
      }
      var currentyear = currentDate.getFullYear().toString();
      var hours = currentDate.getHours().toString();
      var minutes = currentDate.getMinutes().toString();
      var seconds = currentDate.getSeconds().toString();
      var milliseconds = currentDate.getMilliseconds().toString();
      var finaltimestamp = currentyear + currentmonth + currentday + hours + minutes + seconds + milliseconds;

      return 'DeletedCustomer_' + finaltimestamp;


    }

    function changeDateFomat(dateVal) {
      var date_ = dateVal;
      var dat = date_.split("/");
      var mon = parseInt(dat[0]);
      var dates = parseInt(dat[1]);
      var year = parseInt(dat[2]);

      if (mon < 10) {
        mon = '0' + mon;
      }
      if (dates < 10) {
        dates = '0' + dates;
      }
      return mon + '/' + dates + '/' + year;

    }

    return {
      execute: execute
    };

  });