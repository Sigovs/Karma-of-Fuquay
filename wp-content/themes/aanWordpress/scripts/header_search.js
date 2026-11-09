var next_search = [];
var year_param = '';
var price_param = '';
var mileage_param = '';

$(document).ready( function(){
	getSearchResults();
});

function goToPage(){

	var loc = '';
	var new_hash = '';

	if (document.getElementById("stock") && $('#stock').val().length > 1 ) {
		loc = all_page_name +'?stockno='+ $('#stock').val();
		location.href = loc;
		return;
	}

	for(var n in searchFilter){
		if (n == 'type') continue;
		if (typeof(searchFilter[n]) == "string" && searchFilter[n]!="") {
			new_hash += n +'='+ encodeURIComponent(searchFilter[n]) +'&';
		}
	}

	var loc_tion = window.location.href;
	if( new_hash.length > 1) new_hash = "?"+ new_hash;

	if ( searchFilter['type'] == "used" ) loc = used_page_name;
	else if( searchFilter['type'] == "new" ) loc = new_page_name;
	else if( searchFilter['type'] == "certified" ) loc = certified_page_name;
	else  loc = all_page_name;

	location.href = loc + new_hash;
}

function clearSearch(){
	searchFilter = [];
	getSearchResults();
}

function setSearchBy(name,value){

	if( name == "type"){
		searchFilter = [];

		if( value == 'certified'){

			searchFilter['type'] = 'used';
			searchFilter['certified'] = 'true';
		}else{
			if( typeof searchFilter['certified'] == 'string' ) delete searchFilter['certified'];
			searchFilter['type'] = value;
		}

	} else searchFilter[name] = value;

	$("#"+name).parent().find("span").text(value);

	getSearchResults();
}

function adjustSearchFields(nodisplay){

	nodisplay = (nodisplay == 0 ) ? false : true;

	var activated_searches=0;
	var datacount=0;
	total_cars_js_prev=total_cars_js;
	total_cars_js=0;
	var selected_content='';
	var searchtitle = false;

	for(var f=0; f<fields.length; f++){

		var cur_field = fields[f];
		var data3='';

		if( typeof next_search[cur_field] != "undefined") {

			searchtitle = true;

			$('#'+ cur_field).empty();

			if (typeof searchFilter[cur_field] == 'undefined')
				$("#"+ cur_field).parent().find("span").text(cur_field);

			for(var fld in next_search[cur_field]){
				$('#'+ cur_field).append($('<div class="elm" onclick="'+"setSearchBy('"+cur_field+"','"+ next_search[cur_field][fld].toLowerCase() +"'"+')"'+'>'+ next_search[cur_field][fld] +'</div>'));
			}
			total_cars_js=datacount;
		} else $('#'+ cur_field).empty();
	}
}

function getSearchResults(){

	searchFields=new Array();
	searchData=new Array();
	var data="";
	var offs='';

	for(var n in searchFilter){

		if (typeof(searchFilter[n]) == "string" && searchFilter[n]!="") {

			if(n=='offset') offs="&offset="+searchFilter[n];//we need to separate offset param so we can zero it down in case we'll get less cars then limit * current offset
			else data+="&"+n+"="+encodeURIComponent(searchFilter[n]);

		}
	}

	if(searchFilter['type'] != "") inventoryConstant['certified'] = "";

	for(var n in inventoryConstant){
		if( n == "make" && searchFilter['type'] != "" && searchFilter['type'] != "undefined") continue;
		if(inventoryConstant[n]!="" && !searchFilter[n]){
			data+="&"+n+"="+encodeURIComponent(inventoryConstant[n]);
		}
	}

	if(offs!=''){
		if(searchFilter['offset']>total_cars_js && !SOLD_INVENTORY){//if current offset is more then qty of cars we have (and not sold or exotics) then take it out
			removeSearchFilter('offset');
		}else{
			data+=offs;
		}
	}

	hasmorecars=false;//turn off loading untill we load next section

// alert("isapi_xml.php?module=inventory&header"+ data);
	$.get( "/isapi_xml.php?module=inventory&header"+ data ).done( function( text ) {

		var text1 = text.split("\n");
		totalcars = text1[0];

		next_search = [];
		next_search = JSON.parse(text1[1]);
        
        if (next_search['year']) {
            next_search['year'].reverse();
        }
        
		text = text.replace(text1[0], "");

		adjustSearchFields();//<-this will also count total_cars_js

	});
}
