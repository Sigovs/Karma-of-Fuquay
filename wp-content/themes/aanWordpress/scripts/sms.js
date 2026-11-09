var currentSMSBox;
function toggleSMS(obj){
    if (typeof copyURL == 'function' && copyURL())
        return;

	$(obj).parents(".smsMSG").toggleClass("opened");
}
function validateSMS(e) {
	 $(".inputBox input").keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
             // Allow: Ctrl/cmd+A
            (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
             // Allow: Ctrl/cmd+C
            (e.keyCode == 67 && (e.ctrlKey === true || e.metaKey === true)) ||
             // Allow: Ctrl/cmd+X
            (e.keyCode == 88 && (e.ctrlKey === true || e.metaKey === true)) ||
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
}
function sendSMS(obj) {
    
    var $val= $(obj).parents(".smsMSG").find("input").val();

    if($val.length !== 10){
        $(obj).parents(".smsMSG").find(".error").html("Please enter valid phone number");
    }
    else{

        currentSMSBox = $(obj);

        $.post( "/isapi_sms.php?phone="+$val+"&carid="+$(obj).data("carid"), {
            make: $(obj).data("make"),
            year: $(obj).data("year"),
            model: $(obj).data("model"),
            trim: $(obj).data("trim"),
            url: $(obj).data("url"),
            img: $(obj).data("img"),
        }).done( function( text ) {
            if(text==="ok"){
                currentSMSBox.parents(".smsMSG").find("input").val("");
                currentSMSBox.parents(".smsMSG").find(".error").html("");
                currentSMSBox.parents(".smsMSG").find(".inboxContainer").html("<div class='sent' onclick='toggleSMS(this)'>Message Sent <img src='/wp-content/themes/aanWordpress/images/inventory/sms-sent.png' alt=''></div>");
            }
        });
    }
}
