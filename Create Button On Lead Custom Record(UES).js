/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
define([], function(){
    function beforeLoad(context){
        try{
            context.form.clientScriptFileId = 10047;//client script file id
            context.form.addButton({
                id: "custpage_mybutton",
                label: "Create Customer",
                functionName : 'pageInit()'
            });
        }catch(e){
            log.error('Error: before record load function',e);
        }
    }
    return{
        beforeLoad: beforeLoad
    }
});