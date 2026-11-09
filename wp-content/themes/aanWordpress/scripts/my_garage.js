let registerPopup = () => {
    insertForm('form_register', 'register');
    $('.mygarage-auth-section .inner #form_register').parents(".form").show();
    $('.mygarage-auth-section .inner #form_login').parents(".form").hide();
    $('.mygarage-auth-section').fadeIn();
},
loginPopup = () => {
    insertForm('form_login', 'login');
    $('.mygarage-auth-section .inner #form_login').parents(".form").show();
    $('.mygarage-auth-section').fadeIn();
},
checkPinned = () => {
    var i = 0;
    while (pinned_vehicles[i]) {
        $(".pin_"+ pinned_vehicles[i].id).addClass("active");
        i++;
    }
    var count = pinned_vehicles.length;
    if (count != 10) {
        count = count;
    }
    $(".pincount .text").text(count);
},
isSaved = (vid) => {
    return pinned_vehicles.some((v) => {
            return v.id == vid;    
    })
},
pinIt = (obj) => {
    let vid = $(obj).attr("data-pin");
    if (!$(obj).hasClass("pincount")) {
        $.post("/isapi_xml.php?module=my_garage", {
            action: isSaved(vid) ? "delete_save" : "pin_it",
            car_id: vid
        }, function(data, status) {
            if (status !== "success")
                return;

            if (data.type === 'success') {
                var count = pinned_vehicles.length;
                if (isSaved(vid)) {
                    pinned_vehicles = pinned_vehicles.filter(function(el) { 
                        return el.id != vid; 
                    });
                    if ($(".saved_cars_bl").length)
                        $(".saved_cars_bl .pin_" + data.id).parents(".save_car").remove();
                
                    count = count - 1;

                    $(".pincount .text").text(count);
                    $(".hpincount .text").text(count);
                    $(".pin_"+ data.id).removeClass("active");

                } else {
                    if ($(".saved_cars_bl").length)
                        insert_save_car(data.message);
                    
                    pinned_vehicles.push(data);

                    $(".pin_"+ data.id).addClass("active");
                    
                    count = count + 1;

                    $(".pincount .text").text(count);
                    $(".hpincount .text").text(count);
                }
            } else if (data.type === 'error') {
                if (data.message == 'no_user')
                    loginPopup();
                else
                    alert(data.message);
            }
        });
    }
},
insert_save_car = (data) => { 
console.log(data);
    $(".saved_cars_bl .savelist").append(getTile(data));
},
login_submit = () => {
    $('#login_submit').attr('disabled', 'disabled').text('Processing');
    $.post("/isapi_xml.php?module=user", $('#login_form').serializeArray(), function(text) {

        if (text == 'OK') {
            setTimeout(function() {
                location.href = "";
            }, 3000);
        } else {
            $("#login_form .mgg_error_txt").text("Incorrect login information. Please check your credentials and try again.");
            $('#login_submit').removeAttr('disabled').text('Login');
        }
    });
    return false;
},
mgg_register_submit = () => {
    $('#register_submit').attr('disabled', 'disabled').text('Processing');
    $.post("/isapi_xml.php?module=user&formname=register", $('#reg_form').serializeArray(), function(text) {

        if (text == 'OK') {
            setTimeout(function() {
                location.href = "";
            }, 3000);
        } else {
            $('#register_submit').removeAttr('disabled').text('Register');
            $("#reg_form .mgg_error_txt").text(text);
            grecaptcha.reset();
        }
    });
    return false;
},
logout = () => {
    $('#logout_submit').attr('disabled', 'disabled').text('Processing');
    $.get("/isapi_xml.php?module=user&action=logout", function(text) {
        if (text == 'OK') {
            setTimeout(function() {
                location.href = "";
            }, 3000);
        }
    });
    return false;
},
mgg_send_restore = () => {
    $.post("/isapi_xml.php?module=my_garage", $('#mgg_lostPasword').serializeArray(), function(text) {
        if (!text.match("^Error")) {
            $("#mgg_lostPasword").html(text);
        } else {
            $("#mgg_lostPasword .mgg_error_txt").text(text);
        }
    });
    return false;
},
extractDomain = (url) => {
    var domain;
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    } else {
        domain = url.split('/')[0];
    }
    domain = domain.split(':')[0];
    return domain;
},
toggleNotifications = (checked) => {
    var user_id = $.cookie('user_id');
    if (user_id < 1) {
        alert('Error!');
        return false;
    }
    $.get("/isapi_xml.php?module=my_garage&action=toggleNotification&active="+ checked +"&user_id="+ user_id, function(text) {
        if (text == "OK")
            alert('Notification turned '+ (checked == true ? 'On' : 'Off') +'.');
        else
            alert('Error! No records changed.');
    });
},
showSaved = (veh, div, callback) => {
    veh.map((v) => {
        $('#'+ div).append(getTile(v));
    })
    if (typeof callback == 'function')
        callback();
},
locations = [extractDomain(location.href)],
init_garage = () => {
    $(".view_more").click(function(e) {
        $(this).parents('.garage_col').find('.hide_this').removeClass("hide_this");
        $(this).hide()
    });
    $("select[name='priceMn']").on('change', function() {
        var minP = parseInt($(this).val());
        $('select[name="priceMx"] option').show();
        $('select[name="priceMx"] option').filter(function() {
            return parseInt($(this).val()) < minP;
        }).hide();
    });
    $("select[name='priceMx']").on('change', function() {
        var minP = parseInt($(this).val());
        $('select[name="priceMn"] option').show();
        $('select[name="priceMn"] option').filter(function() {
            return parseInt($(this).val()) > minP;
        }).hide();
    });
    $("select[name='yearMn']").on('change', function() {
        var minP = parseInt($(this).val());
        $('select[name="yearMx"] option').show();
        $('select[name="yearMx"] option').filter(function() {
            return parseInt($(this).val()) < minP;
        }).hide();
    });
    $("select[name='yearMx']").on('change', function() {
        var minP = parseInt($(this).val());
        $('select[name="yearMn"] option').show();
        $('select[name="yearMn"] option').filter(function() {
            return parseInt($(this).val()) > minP;
        }).hide();
    });
    $("select[name='mileageMn']").on('change', function() {
        var minP = parseInt($(this).val());
        $('select[name="mileageMx"] option').show();
        $('select[name="mileageMx"] option').filter(function() {
            return parseInt($(this).val()) < minP;
        }).hide();
    });
    $("select[name='mileageMx']").on('change', function() {
        var minP = parseInt($(this).val());
        $('select[name="mileageMn"] option').show();
        $('select[name="mileageMn"] option').filter(function() {
            return parseInt($(this).val()) > minP;
        }).hide();
    });
    $("#add_price_carx").click(function(e) {
        e.stopImmediatePropagation();

        if (typeof $.cookie('user_id') == 'undefined' || $.cookie('user_id') == '0') {
            loginPopup();
            return;
        }

        let make = $("#mgg_make").val(),
            model = $("#mgg_model").val(),
            mxYear = $('#yearMx').val(),
            mnYear = $('#yearMn').val(),
            mnPrice = 0,
            mxPrice = $('#priceMx').val();

        if (make) {
            $.post("/isapi_xml.php?module=my_garage", {
                action: "notification_add",
                make: make,
                model: model,
                yearMn: mnYear,
                yearMx: mxYear,
                priceMn: mnPrice,
                priceMx: mxPrice,
            }, function(data, status) {
                if (status === "success") {
                    if (data.type === 'success') {
                        var nitif_el = `<div class="save_car">
                                            <div class="deteil">
                                                <div class="car_list_hide">
                                                    <div>
                                                        ${ data.message.make } ${ data.message.model }
                                                    </div>
                                                    <div><span>Year Range:</span>
                                                        ${ data.message.beginyear } - ${ data.message.endyear }
                                                    </div>
                                                    <div><span>Price Range:</span>
                                                        ${ (data.message.highprice ? "$" + numberFormat(data.message.highprice) : "Any") }
                                                    </div>
                                                </div>
                                                <div class="sClinks">
                                                    <span class="notification_delete" data-id="${ data.message.id }">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="10.917" height="14.036" viewBox="0 0 10.917 14.036">
                                                                        <path id="ic_delete_forever_24px" d="M5.78,15.476a1.564,1.564,0,0,0,1.56,1.56h6.238a1.564,1.564,0,0,0,1.56-1.56V6.119H5.78ZM7.7,9.924l1.1-1.1,1.661,1.653,1.653-1.653,1.1,1.1-1.653,1.653,1.653,1.653-1.1,1.1-1.653-1.653L8.805,14.33l-1.1-1.1,1.653-1.653ZM13.187,3.78,12.408,3h-3.9l-.78.78H5v1.56H15.917V3.78Z" transform="translate(-5 -3)" fill="#bc0000"/>
                                                                    </svg>
                                                        <span>Remove vehicle</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>`;

                        $("#notif_car").parent('.garage_col').find('.errors').text('');
                        $("#notif_car").append(nitif_el);
                        $("#notif_count").text(data.count);
                    } else if (data.type === 'error') {
                        alert(data.message);
                    }
                }
            });
        } else {
            alert("Please select at least make.");
        }
    });
    $('.saved_cars_bl').on('click', '.save_car .title', function() {
        $(this).parent().toggleClass("open");
    });
    $('.notif_car').on('click', '.save_car .vv_W', function() {
        $(this).parents('.save_car').toggleClass("open");
    });
    $(".pin:not(.hasFunc)").addClass("hasFunc");
    $(".save_this").click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).parents(".car-col").find(".pin").trigger("click");
    });
    $('body').on('click', ".save_this_deteil", function(e) {
        e.preventDefault();
        $(this).parents(".deteil").find(".pin").trigger("click");
    });
    $('.del_alert').on('click', function(e) {
        e.preventDefault();
        $.post("/isapi_xml.php?module=my_garage", {
            action: "delete_alert",
            alert_id: $(this).attr("data-id")
        }, function(data, status) {
            if (status === "success") {
                if (data.type === 'success') {
                    $(".notif_car").find("[data-id='" + data.id + "']").parents(".save_car").remove();
                     $("#alerts_count").text(data.count);
                } else if (data.type === 'error') {
                    alert(data.message);
                }
            }
        });
    });
    $('span.notification_delete').unbind().on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $.post("/isapi_xml.php?module=my_garage", {
            action: "notification_delete",
            notif_id: $(this).attr("data-id")
        }, function(data, status) {
            if (status === "success") {
                if (data.type === 'success') {
                    $(".notif_car").find("[data-id='" + data.id + "']").parents(".save_car").remove();
                    $("#notif_count").text(data.count);
                } else if (data.type === 'error') {
                    alert(data.message);
                }
            }
        });
    });

    $('.mygarage-auth-section .inner .form').hide();
    $(".mgg_login").click(function(e) {
        e.preventDefault();
        $('.mygarage-auth-section .inner #login_form').parents(".form").show();
        $('.mygarage-auth-section').fadeIn();
    });
    $('body').on('click', '.mgg_reg', function(e) {
        e.preventDefault();
        $('.mygarage-auth-section .inner #reg_form').parents(".form").show();
        $('.mygarage-auth-section').fadeIn();
    });
    $(".mgg_forgotten").click(function(e) {
        e.preventDefault();
        $('.mygarage-auth-section .inner .form').hide("slow");
        $('.mygarage-auth-section .inner #mgg_lostPasword').parents(".form").show("slow");
    });
    $('.mygarage-auth-section .head .exit').on('click', function(e) {
        e.preventDefault();
        $('.mygarage-auth-section').fadeOut("slow", function() {
            $('.mygarage-auth-section .inner .form').hide();
        });
    });
    $('body').on('click', '#edit_prof', function(e) {
        $('.mygarage-auth-section .inner .form:last-child').hide();
        $("#reg_form button").text('Update').addClass('update');
        $("#reg_form").parents(".form").show();
        $('.mygarage-auth-section').fadeIn();
    });
    $('body').on('click', '.see_notif_list', function(e) {
        e.preventDefault();
        $(this).parents('.hide_deteil').find(".car_list_hide").slideToggle("slow", "linear");
    });
    checkPinned();
}
