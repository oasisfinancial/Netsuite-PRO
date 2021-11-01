/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */

define(["N/search"],function(search){
	function get(context)
	{
		var conversionSearch = search.create({
			type: "invoice",
			filters: [
				["mainline","is",true],
				"and",
				["datecreated","onorafter","yesterday"]
			],
			columns: [
				{name:"firstname",join:"customer"},
				{name:"lastname",join:"customer"},
				{name:"custentity_click_id",join:"customer"},
				{name:"custentity_creative",join:"customer"},
				{name:"custentity_device",join:"customer"},
				{name:"custentity_matchtype",join:"customer"},
				{name:"datecreated"}
			]
		});
		
		var conversions = [];
		
		conversionSearch.run().each(function(result){
			conversions.push({
				conversion_name: result.getValue({name:"firstname",join:"customer"}) + " " + result.getValue({name:"lastname",join:"customer"}),
				click_id: result.getValue({name:"custentity_click_id",join:"customer"}),
				creative: result.getValue({name:"custentity_creative",join:"customer"}),
				device: result.getValue({name:"custentity_device",join:"customer"}),
				matchtype: result.getValue({name:"custentity_matchtype",join:"customer"}),
				conversion_date: result.getValue({name:"datecreated"})
			});
			
			return true;
		});
		
		return JSON.stringify(conversions);
	}
	
	return {
		get: get
	}
})
