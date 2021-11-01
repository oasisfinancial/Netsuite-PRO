/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/sftp', 'N/file', 'N/render', 'N/record', 'N/config', 'N/format', 'N/runtime', 'N/search'],
/**
 * @param {config} config
 * @param {file} file
 * @param {format} format
 * @param {record} record
 * @param {render} render
 * @param {runtime} runtime
 * @param {search} search
 * @param {url} url
 */
function (sftp, file, render, record, config, format, runtime, search) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(context) {
    	try {
          	log.debug("upload successfully");
        } catch (e) {
            log.debug('Error In :: Error', 'onRequest :: ' + e);
        }
    }

    return {
        execute: execute
    };

});
