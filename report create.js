/**
* @NApiVersion 2.0
* @NScriptType ScheduledScript
* @NModuleScope SameAccount
*/
var fileId,fileObj;
define(['N/file', 'N/encode', 'N/runtime', 'N/search','N/task'],
function(file, encode, runtime, search) {

    function execute(){
        try{
            // get script object.
            var scriptObj = runtime.getCurrentScript();
            //1. load saved search and read the data
            //2. create a xl file
            //3. write data into file
            //4. save the file
            //5. laod the file from file cabinet
            //6. upload file to website
            var searchData = nsGetSearchData(scriptObj);
            var nsFileId = nsCreateReport(searchData,scriptObj);
            log.debug('nsFileId',nsFileId);
        }
        catch(e){
            log.error('Error: execute function '+e.name,e.message);
        }
    }
    function nsGetSearchData(scriptObj){
        try{
            var page = scriptObj.getParameter({
				name: 'custscript_report_fileid'
			}) || 0;
			var index = scriptObj.getParameter({
				name: 'custscript_line_number'
			}) || 0;

            var loadSearch = search.load({
                id: 'customsearch292'
            });
            //log.debug('loadSearch',loadSearch)
            var pushArray = [];
			//TO:DO Pagignation
			var pageData = loadSearch.runPaged({
				pageSize: 1000
			});
			log.debug('pageData.pageRanges.length',pageData.pageRanges.length);
			for(var i=page;i<pageData.pageRanges.length;i++)//to ftech the page data (pageRanges used to fetch page Object)
			{
				log.debug('page',i);
				var currentPageDetls = pageData.fetch(i);//to fetch the data from runPaged() 
				
				for(var j=index;j<currentPageDetls.pagedData.pageSize;j++)//pagedData used to fetch page data
				{
					var lineDetails = currentPageDetls.data[j];
					if(lineDetails == undefined){
						continue;
					}
                var returnObj = {};
                returnObj['docNo'] = lineDetails.getValue('tranid');
                returnObj['linkCustomer'] = lineDetails.getValue({
                name: "formulatext",
                formula: "'<a href=\"/app/common/entity/custjob.nl?id=' || {entity.id} || '\" target=\"_blank\">Go to Customer</a>'",
                label: "Link to Customer"
                });
                returnObj['customerfirstName'] = lineDetails.getValue({
                name: "firstname",
                join: "customer",
                label: "First Name"
                });
                returnObj['customerlastName'] = lineDetails.getValue({
                name: "lastname",
                join: "customer",
                label: "Last Name"
                });
                returnObj['topLevelParent'] = lineDetails.getText({
                name: "parent",
                join: "customer",
                label: "Top Level Parent"
                });
                returnObj['total_Amount'] = lineDetails.getValue('total');
                returnObj['advance_Size'] = lineDetails.getValue('custbody_advance_size');
                returnObj['amount_Remaining'] = lineDetails.getValue('amountremaining');
                returnObj['stampedassignment'] = lineDetails.getText('custbody_stamped_assignment');
                returnObj['attachassignment'] = lineDetails.getValue({
                name: "formulatext",
                formula: "'<a href=\"#\" onclick=\"window.open(''https://5295340.app.netsuite.com/app/site/hosting/scriptlet.nl?script=188&deploy=1&invoice=' || {internalid} || ''',''docUploadWin'',''dependent=yes,width=500,height=300'');\">Attach Assignment</a>'",
                label: "Formula (Text)"
                });
                returnObj['customer_Email'] = lineDetails.getValue('email');
                returnObj['lead_Source'] = lineDetails.getText({
                name: "leadsource",
                join: "customer",
                label: "Lead Source"
                });
                returnObj['phone_Number'] = lineDetails.getValue({
                name: "phone",
                join: "customer",
                label: "Phone"
                });
                returnObj['created_Date'] = lineDetails.getValue('datecreated');
                returnObj['billed_Date'] = lineDetails.getValue('billeddate');
                returnObj['tran_Date'] = lineDetails.getValue({
                name: "trandate",
                sort: search.Sort.ASC,
                label: "Date"
                });
                returnObj['close_Date'] = lineDetails.getValue('closedate');
                returnObj['attorney'] = lineDetails.getText('custbody_attorney');
                returnObj['attorneyNameAddress'] = lineDetails.getValue('custbody_attorney_name_address');
                returnObj['law_Firm'] = lineDetails.getValue({
                name: "custentity_law_firm",
                join: "CUSTBODY_ATTORNEY",
                label: "Law Firm"
                });
                returnObj['customer_County'] = lineDetails.getText('custbody_county');
                returnObj['customer_Keyword'] = lineDetails.getValue({
                name: "custentity_keyword",
                join: "customer",
                label: "Keyword"
                });
                returnObj['customer_Campaign'] = lineDetails.getValue({
                name: "custentity_campaign",
                join: "customer",
                label: "Campaign"
                });
                returnObj['click_Id'] = lineDetails.getValue({
                name: "custentity_click_id",
                join: "customer",
                label: "Click ID"
                });
                returnObj['customer_Creative'] = lineDetails.getValue({
                name: "custentity_creative",
                join: "customer",
                label: "Creative"
                });
                returnObj['customer_Device'] = lineDetails.getValue({
                name: "custentity_device",
                join: "customer",
                label: "Device"
                });
                returnObj['match_type'] = lineDetails.getValue({
                name: "custentity_matchtype",
                join: "customer",
                label: "Matchtype"
                });
                returnObj['netEstRevenue'] = lineDetails.getValue('custbody_net_est_revenue');
                returnObj['dateOfRepayment'] = lineDetails.getValue('custbody_date_of_repayment');
                returnObj['estDateOfRepayment'] = lineDetails.getValue('custbody_est_date_of_repayment');
                returnObj['rebateMonth1'] = lineDetails.getValue('custbody_rebate_1_month');
                returnObj['optionPricing1'] = lineDetails.getValue('custbody_option_1_pricing');
                returnObj['rebateMonth2'] = lineDetails.getValue('custbody_rebate_2_month');
                returnObj['optionPricing2'] = lineDetails.getValue('custbody_option_2_pricing');
                returnObj['rebateMonth3'] = lineDetails.getValue('custbody_rebate_3_month');
                returnObj['optionPricing3'] = lineDetails.getValue('custbody_option_3_pricing');
                returnObj['ctFilingDate'] = lineDetails.getValue('custbody_ct_filing_date');
    
                pushArray.push(returnObj);
            }
            index= 0;
        }
            //log.debug('pushArray',pushArray);
            if(pushArray){
                return pushArray;
            }
            else{
                return false;
            }
        }
        catch(e){
            log.error('Error: nsGetSearchData function '+e.name,e.message);
            return false;
        }
    }
    function nsCreateReport(searchData){
        try{
            log.debug('searchData',searchData);
            var searchDataLength = searchData.length;
            var xmlStr   = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
                xmlStr  += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
                xmlStr  += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
                xmlStr  += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
                xmlStr  += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
                xmlStr  += 'xmlns:html="http://www.w3.org/TR/REC-html40">';

                xmlStr  += '<Styles>'
                        + '<Style ss:ID="s63">'
                        + '<Font x:CharSet="204" ss:Size="12" ss:Color="#000000" ss:Bold="1" ss:Underline="Single"/>'
                        + '</Style>' + '</Styles>';

                xmlStr  += '<Worksheet ss:Name="Sheet1">';
                xmlStr  += '<Table>'
                        + '<Row>'
                        + '<Cell><Data ss:Type="String"> Document Number </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Customer </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Customer First Name </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Customer Last Name </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Customer Parent </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Total amount </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Advance Size </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Remaining Amount </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Stamped Assignment </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Attach Assignment </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Customer Email </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Lead Source </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Phone Number </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Date Created </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Date Billed </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Date </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Date closed </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Attorney </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Attorney Address </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Law Firm </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Country </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Customer keyword </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Customer Campaign </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Click ID </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Customer Creative </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Customer Device </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Customer MatchType </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Net Revenue </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Date of Repayment </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Estimated Date of Repaymnet </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Rebate One Month </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Option 1$ </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Rebate 2 Month </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Option 2$ </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Rebate 3 Month </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Option 3$ </Data></Cell>'
                        + '<Cell><Data ss:Type="String"> Filling date </Data></Cell>'
                        + '</Row>';
                for(var j = 0; j < searchDataLength; j++){
                    var loopArray = searchData[j];
                    xmlStr  += '<Row>'
                            + '<Cell><Data ss:Type="String">'+loopArray.docNo+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.linkCustomer+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.customerfirstName+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.customerlastName+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.topLevelParent+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.total_Amount+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.advance_Size+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.amount_Remaining+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.stampedassignment+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.attachassignment+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.customer_Email+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.lead_Source+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.phone_Number+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.created_Date+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.billed_Date+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.tran_Date+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.close_Date+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.attorney+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.attorneyNameAddress+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.law_Firm+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.customer_County+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.customer_Keyword+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.customer_Campaign+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.click_Id+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.customer_Creative+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.customer_Device+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.match_type+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.netEstRevenue+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.dateOfRepayment+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.estDateOfRepayment+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.rebateMonth1+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.optionPricing1+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.rebateMonth2+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.optionPricing2+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.rebateMonth3+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.optionPricing3+'</Data></Cell>'
                            + '<Cell><Data ss:Type="String">'+loopArray.ctFilingDate+'</Data></Cell>'
                            + '</Row>';                 
                }
                xmlStr += '</Table></Worksheet></Workbook>';
                    
                var contents = encode.convert({
                    string : xmlStr,
                    inputEncoding : encode.Encoding.UTF_8,
                    outputEncoding : encode.Encoding.BASE_64
                });
                var today = new Date();
                today = getFormatted(today.getFullYear())+getFormatted(today.getMonth() + 1)+getFormatted(today.getDate());
                    fileObj = file.create({
                        name : 'SpoolData_Report'+today+'.xls',
                        fileType : file.Type.EXCEL,
                        contents : contents
                    });
                fileObj.folder = 318;            
                fileId = fileObj.save();
                return fileId;
        }
        catch(e){
            log.error('Error: nsCreateReport function '+e.name,e.message);
        }
    }
    function getFormatted(val){
		try{
			if(JSON.stringify(val).length == 1){
				return "0"+val;
			}else{
			return val;
			}
		}
		catch(e){
			log.debug('get formatted catch',e);
		}
	}
    return {
        execute: execute
    };

});