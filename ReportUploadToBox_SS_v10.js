/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/http', 'N/file', 'N/log', 'N/search'],
function (http, file, log, search) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(context) {
    	try {

            var url = "http://40.117.44.136/ns_sales/get_ns.php";
            var today = new Date();
            today = getFormatted(today.getFullYear())+getFormatted(today.getMonth() + 1)+getFormatted(today.getDate());

            var files = [
                { name: 'file', value: file.load({ id: 'SuiteScripts/Invoices/BorrowingBase_Report'+today+'.xls' }) }, 
                { name: 'file', value: file.load({ id: 'SuiteScripts/Invoices/SpoolData_Report'+today+'.xls' }) },
                //{ name: 'file', value:'test'}
            ];

            var resp = uploadParts(url, files);
        
        } catch (e) {
            log.debug('Error In :: Error', 'execute :: ' + e);
        }

        return ;
    }

    function getContentType(f) {
        var types = {};
        types[file.Type.AUTOCAD] = 'application/x-autocad';
        types[file.Type.BMPIMAGE] = 'image/x-xbitmap';
        types[file.Type.CSV] = 'text/csv';
        types[file.Type.EXCEL] = 'application/vnd.ms-excel';
        types[file.Type.FLASH] = 'application/x-shockwave-flash';
        types[file.Type.GIFIMAGE] = 'image/gif';
        types[file.Type.GZIP] = 'application/?x-?gzip-?compressed';
        types[file.Type.HTMLDOC] = 'text/html';
        types[file.Type.ICON] = 'image/ico';
        types[file.Type.JAVASCRIPT] = 'text/javascript';
        types[file.Type.JPGIMAGE] = 'image/jpeg';
        types[file.Type.JSON] = 'application/json';
        types[file.Type.MESSAGERFC] = 'message/rfc822';
        types[file.Type.MP3] = 'audio/mpeg';
        types[file.Type.MPEGMOVIE] = 'video/mpeg';
        types[file.Type.MSPROJECT] = 'application/vnd.ms-project';
        types[file.Type.PDF] = 'application/pdf';
        types[file.Type.PJPGIMAGE] = 'image/pjpeg';
        types[file.Type.PLAINTEXT] = 'text/plain';
        types[file.Type.PNGIMAGE] = 'image/x-png';
        types[file.Type.POSTSCRIPT] = 'application/postscript';
        types[file.Type.POWERPOINT] = 'application/?vnd.?ms-?powerpoint';
        types[file.Type.QUICKTIME] = 'video/quicktime';
        types[file.Type.RTF] = 'application/rtf';
        types[file.Type.SMS] = 'application/sms';
        types[file.Type.STYLESHEET] = 'text/css';
        types[file.Type.TIFFIMAGE] = 'image/tiff';
        types[file.Type.VISIO] = 'application/vnd.visio';
        types[file.Type.WORD] = 'application/msword';
        types[file.Type.XMLDOC] = 'text/xml';
        types[file.Type.ZIP] = 'application/zip';

        var mime = types[f.fileType];
        var charset = f.encoding;
        var ct = 'Content-Type: ' + mime + (charset ? ';charset=' + charset : '');
        log.debug({ title: 'content for ' + f.name, details: ct });
        return ct;
    }

    function isFile(o) {
        return (typeof o == 'object' && typeof o.fileType != 'undefined');
    }

    function uploadParts(url, parts) {
        var boundary = '------------------------9fd09388d840fef1';
        parts.forEach(function (p, idx) {
            var header = [];
            header['content-length'] = p.value.size;
            header['content-type'] = 'multipart/form-data; boundary=' + boundary;
            
            // Body
            var body = [];
            var partIsFile = isFile(p.value);
            
            body.push('--' + boundary);
            body.push('Content-Disposition: form-data; name="' + p.name + '"' + (partIsFile ? ('; filename="' + p.value.name + '"') : ''));
            if (partIsFile) { 
                body.push(getContentType(p.value));
            }
            body.push('');
            body.push(partIsFile ? p.value.getContents() : p.value);
            body.push('--' + boundary + '--');

            try {
                var response = http.post({
                    url: url,
                    headers: header,
                    body: body.join('\r\n')
                });
                log.debug('Upload Result', JSON.stringify(response));
                //return response;
            }
            catch (e) {
                log.debug({ title: 'Failed to submit file', details: (e.message || e.toString()) + (e.getStackTrace ? (' \n \n' + e.getStackTrace().join(' \n')) : '') });
            }
        });
        return true;
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
