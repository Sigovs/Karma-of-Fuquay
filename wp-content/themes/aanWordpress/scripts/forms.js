// Finance app optional blocks completed---

let config_elements = [],
config_forms = [],
form_type_bt = false,
recaptcha_url = 'https://www.google.com/recaptcha/api.js',
recaptcha_loaded = false;

function insertFormLoadable(nest_id, formname, vid, formCallback) {

    let config_form = {},
	contactFormWrap = $(contactFormSrc).clone(),
	contactForm = contactFormWrap[1],
	div_open = 0,
	datetime_ids = [],
	date_ids = [],
    active_vehicle = [],
	active_vehicle_scope = [],
	temp_containers = [];

    form_type_bt = nest_id.match(/_bt$/) ? true : false;

    let p = new Promise((resolve, reject) => {
    
        $.ajax({
            url: '/isapi_xml.php?module=form_popup&formname='+ formname +'&action=get_config',
            method: "GET",
            success: function(data) {
                resolve(data);
            }
        });
    });

    p.then((result) => {
        config_forms[formname] = result;
        config_form = result;
        config_elements[formname] = config_form.elements;
        
        $('#'+ nest_id).empty().append(contactFormWrap).ready(() => {
            $(contactForm).attr('name', formname);
        });
   
    }).then((result) => {
        return getVehicleInfo(formname, vid);
        
    }).then((active_vehicle) => {

		active_vehicle_scope = active_vehicle;

        $(contactFormWrap[0]).text(config_form.display_name);
//--Custom ----
		if (formname == 'newsletter_unsubscribe') {

			if (typeof(form_data[formname][0]) == 'undefined'
				|| typeof(form_data[formname][0]['email']) == 'undefined') {

				let new_el = $('#h2_wrap').clone();
				let new_input = $(new_el).find('h2')
					.text( 'Subscriber Not found');
				$(contactForm).find('.form_body')
					.append(new_input);

				return false;
			}
			let new_el = $('#h2_wrap').clone();
			let new_input = $(new_el).find('h2')
					.text( 'Subscriber: '+ form_data[formname][0]['email']);
			$(contactForm).find('.form_body')
				.append(new_input);
				
			$(contactForm).find('.form_body')
				.append('<input type="hidden" name="email" value="'+ form_data[formname][0]['email'] +'" />');
		} else if (typeof(vid) == 'string' && vid.length > 0) {			
            $(contactForm).find('.form_body')
				.append('<input type="hidden" name="vid" value="'+ vid +'" />');
        }
//------------
		Object.keys(config_form.elements).map(function(v, k) {

			let config_element = config_elements[formname][v]
			readonly = false,
			el_group = config_element.type
				.replace(/^date(.*)/, 'date')
				.replace(/^makes_(.*)/, 'select')
				.replace(/^models_(.*)/, 'select')
				.replace(/^stocks_(.*)/, 'select')
				.replace(/^years_(.*)/, 'select'),
			new_el = config_element.type == 'html'
						? ''
						: $('#'+ el_group +'_wrap').clone();

        //----User's info if no user only---
            if (typeof(user.email) == 'string' && user.email.length > 5
                && typeof(user[v]) != 'undefined' && user[v].length > 0)
                readonly = true;

			$(new_el).attr('id', '');

			if (v.replace(/(.*)state/, 'state') == 'state') {
				let new_input = $(new_el).find('select')
					.attr('id', v)
					.attr('name', v)
					.append('<option value="">State</option>');
				states.map((s) => {
					$(new_input).append('<option value="' + s.key + '"'
                        + (typeof(form_data[formname]) == 'object' 
                            && typeof(form_data[formname][0]) == 'object' 
                            && typeof(form_data[formname][0]['state']) == 'string' 
                            && form_data[formname][0]['state'] == s.key 
                        ? ' selected' 
                        : '') +'>' + s.value + '</option>')
				});
				if (config_element.required) {
					$(new_el).find('#' + v + ' option:first').append('*');
				}
			} else if (config_element.type == 'years_all') {
					let new_input = $(new_el).find('select')
						.attr('id', v)
						.attr('name', v)
						.append('<option value="">'+ config_element.display_name +'</option>');
						let d = new Date;

					for (let y = d.getFullYear() + 1; y > 1919; y--) {
						$(new_input).append('<option value="'+ y +'">'+ y +'</option>');
					};
					if (config_element.required) {
						$(new_el).find('#'+ v +' option:first').append('*');
					}
			} else if (config_element.type == 'makes_all') {
				let new_input = $(new_el).find('select')
					.attr('id', v)
					.attr('name', v)
					.append('<option value="">Make</option>');

				vehicle_makes.map((m) => {
					$(new_input).append('<option value="'+ m +'"'+ (typeof(active_vehicle['make']) == 'string' && active_vehicle['make'] == m ? ' selected' : '') +'>'+ m +'</option>')
				})
				if (config_element.required) {
					$(new_el).find('select option:first').append('*');
				}
			} else if (config_element.type == 'makes_av') {
				let new_input = $(new_el).find('select')
					.attr('id', v)
					.attr('name', v)
					.change(function() { setModels(this.value) })
					.append('<option value="">Make</option>');
				Object.keys(available_makes_models['makes']).map((m) => {
					$(new_input).append('<option value="'+ m +'"'+ (typeof(active_vehicle['make']) == 'string' && active_vehicle['make'] == m ? ' selected' : '') +'>'+ m +'</option>')
				})
				if (config_element.required) {
					$(new_el).find('select option:first').append('*');
				}
			} else if (config_element.type == 'models_av') {
				let new_input = $(new_el).find('select')
					.attr('id', v)
					.attr('name', v)
					.change(function() { setStock(this.value) })
					.append('<option value="">Model</option>');
					if (typeof(active_vehicle['model']) == 'string' && active_vehicle['model'].length > 0)
						new_input.append('<option value="'+ (typeof(active_vehicle['model']) == 'string' && active_vehicle['model'] +'" selected>'+ active_vehicle['model']) +'</option>');
				if (config_element.required) {
					$(new_el).find('select option:first').append('*');
				}
			} else if (config_element.type == 'stocks_av') {
				let new_input = $(new_el).find('select')
					.attr('id', v)
					.attr('name', v)
					.change(function() { setMakeModel(this.value) })
					.append('<option value="">Stock #</option>');
				Object.keys(available_makes_models['stocks']).map(function(v, k) {
					available_makes_models['stocks'][v].map(function(v1, k1) {
						new_input.append('<option value="'+ v1 +'"'+ (typeof(active_vehicle['stockno']) == 'string' && active_vehicle['stockno'] == v1 ? ' selected' : '') +'>'+ v1 +'</option>');
					});
				});
				if (config_element.required) {
					$(new_el).find('select option:first').append('*');
				}
			} else if (config_element.type == 'makes') {
				let new_input = $(new_el).find('select')
					.attr('id', v)
					.attr('name', v)
					.append('<option value="">Make</option>');;
				vehicle_makes.map((m) => {
					$(new_input).append('<option value="'+ m +'">'+ m +'</option>')
				})
				if (config_element.required) {
					$(new_el).find('select option:first').append('*');
				}
			} else if (config_element.type == 'h1') {
				let new_input = $(new_el).find('h1')
					.text(config_element.display_name);

				
			} else if (config_element.type == 'h2') {
				let new_input = $(new_el).find('h2')
					.text(config_element.display_name);

			} else if (config_element.type == 'break') {

			} else if (config_element.type == 'html') {
				new_el = config_element.display_name
				
			} else if (config_element.type == 'code') {
				if (typeof(config_element.message_default) != 'undefined')
					new_el = config_element.message_default

			} else if (config_element.type == 'radio') {
				$(new_el).find('label')
					.text(config_element.display_name);
				let new_input = $(new_el).find('input')
									.attr('name', v),
					new_label = $(new_el).find('label');

				$(new_el).find('input').remove();

				Object.keys(config_element.options).map((i) => {
					let newclone =
					$(new_el).append($(new_input).clone().val(i));
 					$(new_el).append($(new_label).clone().html(config_element.options[i]))
				});

				if (config_element.required) {
					$(new_el).find('label:first').append('*');
				}

			} else if (config_element.type == 'select') {
				let new_input = $(new_el).find('select')
					.attr('id', v)
					.attr('name', v)
                    .attr('aria-label', config_element.display_name)
					.append('<option value="">'+ config_element.display_name +'</option>');
				Object.keys(config_element.options).map((i) => {
 					$(new_input).append('<option value="'+ i +'">'+ config_element.options[i] +'</option>')
				});
				if (config_element.required) {
					$(new_el).find('select option:first').append('*');
				}
				
			} else if (config_element.type == 'checkbox') {
				$(new_el).find('input')
					.attr('name', v)
					.val('1');
				$(new_el).find('label')
					.html(config_element.display_name);

			} else if (config_element.type == 'datetime') {
				datetime_ids.push(v);
				$(new_el).find('input')
					.attr('id', v)
					.attr('name', v)
					.attr('placeholder', config_element.display_name 
										+ (config_element.required ? '*' : ''));

			} else if (config_element.type == 'date') {
				date_ids.push(v);
				$(new_el).find('input')
					.attr('id', v)
					.attr('name', v)
					.attr('placeholder', config_element.display_name 
										+ (config_element.required ? '*' : ''))
					
			} else if (config_element.type == 'date_exp') {
				$(new_el).find('input')
					.attr('id', v)
					.attr('name', v)
					.attr('placeholder', config_element.display_name 
										+ (config_element.required ? '*' : ''))
					.datepicker({
						changeMonth: true,
						changeYear: true,
						dateFormat: 'MM/yyyyy'
					})
					
			} else if (config_element.type == 'file') {
				$(new_el).find(':first-child')
					.attr('id', v)
					.attr('name', v)
					.attr('placeholder', config_element.display_name 
										+ (config_element.required ? '*' : ''))
					
			} else if (config_element.type == 'textarea') {
				$(new_el).find(':first-child')
					.attr('id', v)
					.attr('name', v)
                    .attr('aria-label', config_element.display_name)
					.attr('placeholder', config_element.display_name 
										+ (config_element.required ? '*' : ''));

                if (typeof(config_element.message_default) != 'undefined'
					&& Object.keys(active_vehicle).length > 0)

                    $(new_el).find(':first-child').val(
						config_element.message_default
							.replace('$year', typeof(active_vehicle['year']) != 'undefined' ? active_vehicle['year'] : '')
							.replace('$make', typeof(active_vehicle['make']) != 'undefined' ? active_vehicle['make'] : '')
							.replace('$model', typeof(active_vehicle['model']) != 'undefined' ? active_vehicle['model'] : '')
							.replace('$stock', typeof(active_vehicle['stockno']) != 'undefined' ? active_vehicle['stockno'] : '')
                            .replace('\\n', "\n")
					);
					
			} else {
				$(new_el).find(':first-child')
					.attr('id', v)
					.attr('name', v)
                    .attr('aria-label', config_element.display_name)
					.attr('placeholder', config_element.display_name 
										+ (config_element.required ? '*' : ''));
                    
                if (typeof(user[v]) != 'undefined')
                    $(new_el).find(':first-child').val(user[v]);

                else if (typeof(form_data[formname]) != 'undefined'
					&& typeof(form_data[formname][0]) != 'undefined'
					&& typeof(form_data[formname][0][v]) != 'undefined'
                )
                    $(new_el).find(':first-child').val(form_data[formname][0][v]);
                    
			}
 
 			if (v.indexOf('html') < 0)
                 $(new_el).find('input').attr('readonly', readonly);

			if (div_open > 0 || (typeof(new_el) == 'string' && new_el.match(/^div_/))) {
                if (typeof(new_el) == 'string' && new_el.match(/^div_open/)) {
                    div_open ++;
                    let par = config_element.display_name.split('&'),
                    temp_div = document.createElement('div');

                    if (typeof(par) == 'object') {
                        for (let i = 0; i < par.length; i++) {
                            if (par[i].split('=')[0] == 'id')
                                temp_div.id = par[i].split('=')[1];
                            else if (par[i].split('=')[0] == 'style')
                                temp_div.style[par[i].split('=')[1].split(':')[0]] = par[i].split('=')[1].split(':')[1];
                        }
                    }
                    if (div_open == 1) temp_container = temp_div;
                    else temp_container.appendChild(temp_div );
                } else if (typeof(new_el) == 'string' && new_el == 'div_close') {
                    if (div_open == 1) {
                        $(contactForm).find('.form_body').append(temp_container);
                        temp_container = null;
                        div_open = 0;
                    } else
                        div_open --;
                } else {
                    if (div_open == 1) 
                        temp_container.appendChild(new_el.addClass(config_element.width)[0]);
                    else 
                        temp_container.lastChild.appendChild(new_el.addClass(config_element.width)[0]);
                }
			} else 
				$(new_el).addClass(config_element.width)
					.appendTo($(contactForm).find('.form_body'));

		});
		if (config_form.use_captcha) {
            if (!recaptcha_loaded) {
                let js = document.createElement("script");
                js.type = "text/javascript";
                js.src = recaptcha_url;
                document.body.appendChild(js);
                recaptcha_loaded = true;
            }
            
			let captcha = $(recaptcha_plaseholder).clone();
			$(captcha).find(':first-child')
				.attr('id', 're-captcha_'+ formname);
  			$(captcha).attr('id', 'captcha_'+ formname).appendTo($(contactForm).find('.form_body'))
		}
		let btnBox = $('#btnBox_wrap').clone();
        
        $(btnBox).find('button:first-child').attr('id', 'btnSubmit_'+ formname);

		$(btnBox).find('button:first-child span.text')
			.text(typeof(config_form.button_text) != 'undefined' 
					&& config_form.button_text.length 
					? config_form.button_text 
					: 'Send'
				 );

		if (typeof user.user_id == 'undefined')
			$(btnBox).find('.logout_button').hide()

		$(btnBox).appendTo($(contactForm).find('.form_body'));

		if (formname.match(/^newsletter/) && formname != 'newsletter_subscribe_mini') {
			setNewslTopics(formname);
		}
	}).then(function(result) {
        
        if (datetime_ids.length < 1 || $.isFunction($.fn.datetimepicker))
            return '';
            
        return new Promise((resolve, reject) => {
            let js = document.createElement("script");
            js.type = "text/javascript";
            js.src = '/wp-content/themes/aanWordpress/scripts/jquery.datetimepicker.js';
            js.onload = () => {
                resolve();
            }
            document.body.appendChild(js);
        });

	}).then(function(result) {

        if (config_form.use_captcha) {

			setTimeout(function() {
				grecaptcha.render('re-captcha_'+ formname, {
					sitekey: data_sitekey,
                    callback: function() {
                        validateForm(contactForm, false);
                    }
				});
            }, 1000);
        }

		for (let i = 0; i < datetime_ids.length; i++) {
			$('#'+ datetime_ids[i]).datetimepicker({
                minDate: new Date(),
                dayOfWeekStart : 0,
                lang:'en',
                step: 15,
                format: 'm/d/Y h:i A',
				formatTime: 'h:i A',
				formatDate: 'm/d/Y',
				validateOnBlur: false,
                minTime: typeof datepicker_time_range != 'undefined'
					&& typeof datepicker_time_range.minTime != 'undefined'
					? datepicker_time_range.minTime
					: '09:15:00',
                maxTime: typeof datepicker_time_range != 'undefined'
					&& typeof datepicker_time_range.maxTime != 'undefined'
					? datepicker_time_range.maxTime
					: '17:45:00',
                disabledWeekDays:[0],

			}).on('change', function(e){ 
                validateForm(contactForm, false); 
            });
		}

		for (let i = 0; i < date_ids.length; i++) {
			$('#'+ date_ids[i]).datepicker({
				minDate: new Date(),
				maxDate: typeof datetimeMaxDate != 'undefined' ? datetimeMaxDate : 365,
				beforeShow: function() {
					setTimeout(function(){
						$('.ui-datepicker').css('z-index', 99999999);
					}, 0);
				}
			})
		}
		$($(contactForm).find(':file')).on('change', function() {
			uploadFiles(this.files, $(contactForm).attr('name'));
		});
		
		$($(contactForm).find('input')).bind('input', function() {
			validateForm(contactForm, false);
		});
		
		$($(contactForm).find('textarea')).bind('input', function() {
			validateForm(contactForm, false);
		});
		$($(contactForm).find('select')).on('change', function() {
			validateForm(contactForm, false);
		});

        if (formname == 'finance_app')
            ff_init(config_elements['finance_app']);


        if (formname == 'finance_calc')
            fc_init(active_vehicle_scope);

        if (formname == 'register')
            $('.mygarage-auth-section form input').attr("readonly", false);
        
        if (typeof formCallback == 'function')
            formCallback();
    });
}

function closeContacts() {
	$('#quickContacts').remove();
}

function validateForm(form, submitted) {

	let form_valid = true;
	let form_arr = [],
		radioValid = (n) => {
			let ch = false;
			Object.keys(contactForm.elements).map((i) => {
				if (contactForm.elements[i].name == n && contactForm.elements[i].checked)
					ch = true;

			});
			return ch;
		};

	for (let i = 0; form.elements[i]; i++) {
		
		let element = form.elements[i];
	
		if ((typeof config_elements[form.name][element.name] != 'undefined'
			&& (config_elements[$(form).attr('name')][element.name].required))
			|| element.name == 'g-recaptcha-response') {

            if (element.name.match(/phone/)) {
                $(element).attr("autocomplete", "off");
                let phone = element.value.replace(/[^\d]/g, "").replace(/^1/, "");
                phone = phone.substring(0, 10);

                if (phone.length == 10)
                    element.value = phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
                else 
                    element.value = phone;
            }
            
            let valid = element.name.match(/^email/) 
						? validateEmail(element.value)
						: element.value.length > 0;

			valid = element.name.match(/phone/) 
						? element.value.match(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)
                        : valid;

            valid = element.type == 'checkbox' 
						? element.checked
						: valid;
                        
			valid = element.type == 'radio'
						? radioValid(element.name)
						: valid;

			if (valid) {
				if (!submitted
					&& form.name.match(/^newsletter/)
					&& element.name == 'email') {

					$.ajax({
						url: '/isapi_xml.php?module=form_popup&formname='+ form.name + '&action=subscriber_exists&email='+ element.value,
						method: "GET",
						success: function(data) {
							if (data == 'Y') {
								alert('Subscriber with the same email address already exists in our system!');
								element.style.outline = invalid_style;
								$('#btnSubmit').prop('disabled', true);
							}
						}
					});
				}
                if (element.name == 'g-recaptcha-response')
					$('#re-captcha_'+ form.name).css('outline', valid_style);
				else
					element.style.outline = valid_style;
				
			} else if (element.name == 'g-recaptcha-response') {
				$('#re-captcha_'+ form.name).css('outline', invalid_style);
                form_valid = false;             
            } else {
				element.style.outline = invalid_style;
				form_valid = false;
			}
		}
			
		if ((element.type != 'checkbox' && element.type != 'radio') || element.checked)
			form_arr.push({
				[element.name]: element.value
			});
	};

	if (form_valid) $('#btnSubmit_'+ form.name).prop('disabled', false);
	else  $('#btnSubmit_'+ form.name).prop('disabled', true);

	if (submitted && form_valid) {
        
        $('#btnSubmit_'+ form.name).text('Processing...').prop('disabled', true);
        
        let veh_id = $('[name="vid"]').val(),
		vid_for_url = typeof veh_id != 'undefined' && veh_id.length > 0 ? '&vid='+ form[0].value : '',
        form_type = form_type_bt ? '&_bt' : '',
        uid = typeof(user.user_id) == 'string' ? '&uid='+ user.user_id : '';
        
		$.ajax({
			url: '/isapi_xml.php?module=form_popup'+ form_type + uid +'&formname='+ $(form).attr('name') + vid_for_url,
			type: "POST",
			dataType: 'json',
			data: JSON.stringify(form_arr),
			contentType: 'application/json;charset=UTF-8',
			complete: function(data) {
                let response = '';
                if (data.responseText.length > 12)
                    response = JSON.parse(data.responseText);

                if(typeof(response) == 'object' && typeof(response.user_id) != 'undefined') {
                    user = response;
                    $('#fname_hi').text(user.fname);
                    $('#user_hi').show();
                    data.responseText = 'OK';
                    
                    if (form.name == 'register')
                        location.href = '';
                    else if ($(form).attr('name').match(/_bt?/) && typeof(nextStep) == 'function')
                        nextStep($(form).attr('name'), data.responseText);
                    else
                        $(form).html(getThankYouMessage(form.name));
                    
                } else if (data.responseText == 'OK') {
                    if (form.name == 'login' || form.name == 'register')
                        location.href = '';
                    else
                        $(form).html(getThankYouMessage(form.name));
                    
                } else if (data.responseText == 'NR') {
                    registerPopup();
                    
                } else if(response = JSON.parse(data.responseText) 
                            && typeof(response) == 'object'
                            && typeof(response.user_id) != 'undefined') {
                    user = responce;
                    if (form.name == 'register')
                        location.href = '';
                    
				} else alert('Error!');
			}
		});
	}
}

function getVehicleInfo(formname, vid) {
    return new Promise((resolve, reject) => {
        
        if (typeof(vid) == 'string' && vid.match(/^\d+/)) {
            $.ajax({
                url: '/isapi_xml.php?module=form_popup&formname='+ formname +'&action=vehicle_info&vid='+ vid,
                method: "GET",
                success: function(data) {
                    resolve(data);
                }
            });
        } else
            resolve([]);
    });
}

function setNewslTopics(formname) {

	$.ajax({
		url: '/isapi_xml.php?module=form_popup&formname=newsletter_subscribe&action=get_newsl_topics',
		method: "GET",
		success: function(data) {
			newsletter_topics = data;
			let new_elements = [];
			for (let i = 0; i < newsletter_topics.length; i++) {
				let el = $('[name="nl_topics"]').parent().clone();
 				$(el).find('input').attr('name', 'nl_topics_'+ i).val(newsletter_topics[i].topic_id);

				if (typeof(form_data[formname]) != 'undefined'
					&& typeof(form_data[formname][1]) != 'undefined' 
					&& form_data[formname][1].indexOf(newsletter_topics[i].topic_id) > -1)
					$(el).find('input').attr('checked', 'checked');
				else if(i == 0)
					$(el).find('input').attr('checked', 'checked');
				$(el).find('label').text(newsletter_topics[i].topic);
				
				new_elements.push(el);
			}
			$('[name="nl_topics"]').parent().replaceWith(new_elements);

			$('form[name="'+ formname +'"]').find('input:checkbox').bind('change', function() {
				validateForm($('form[name="'+ formname +'"]')[0], false);
			});
		}
	});
}

function uploadFiles(files, formname) {

	let error = '';
	let form_data = new FormData();

	for (let count = 0; count<files.length; count++) {
		let name = files[count].name;
		let extension = name.split('.').pop().toLowerCase();

		if(jQuery.inArray(extension, ['gif','png','jpg','jpeg']) == -1) {
			error += "Invalid " + count + " Image File"
		} else {
			form_data.append("files[]", files[count]);
		}
	}

	if(error == '') {
		$.ajax({
			url: '/isapi_xml.php?module=form_popup&formname='+ formname + '&action=upload',
			method: "POST",
			data: form_data,
			contentType: false,
			cache: false,
			processData: false,
			beforeSend:function() {
				$(document.forms[formname])
					.find('#uploader_text')
					.empty()
					.text('Uploading...');
			},
			success:function(data) {
				if (data == 'OK') {  
					$(document.forms[formname])
						.find('#uploader_text')
						.empty()
						.text(files.length +' files attached.');
					$(files).val('');
				} else alert(data);
			}
		})
		
	} else {
		alert('Error!');
	}
}

function setModels(make) {

	$('#model').empty();
	if (make == '')
		setStock(false);
	else {
		let i = 0;
		available_makes_models['makes'][make].map(function(v) {
			$('#model').append('<option value="'+ v +'">'+ v +'</option>');
		});

		if (available_makes_models['makes'][make].length == 1) 
			setStock(available_makes_models['makes'][make]);
	}
}

function setStock(model) {
	$('#stockno').empty();
	if (typeof(model) == 'string') {
		available_makes_models['stocks'][model].map(function(v) {
			$('#stockno').append('<option value="'+ v +'">'+ v +'</option>');
		});
	} else {

		Object.keys(available_makes_models['stocks']).map(function(v, k) {
			available_makes_models['stocks'][v].map(function(v1, k1) {
 				$('#stockno').append('<option value="'+ v1 +'">'+ v1 +'</option>');
			});
		});
	}
}

function setMakeModel(stock) {
	let make = '', model = '';
	Object.keys(available_makes_models['stocks']).map((v, k) => {
		if (available_makes_models['stocks'][v].includes(stock)) {
			model = v;
			return;
		}
	});
	Object.keys(available_makes_models['makes']).map((v, k) => {
		if (available_makes_models['makes'][v].includes(model)) {
			make = v;
			return;
		}
	});
	$('#make option').prop('selected', false);
	$('#make option[value="'+ make +'"]').prop('selected', true);

	setModels(make);
}

function validateEmail(email) {
	if (email.length < 5) return false;
	let emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

	return emailReg.test(email);
}

function onContactsSubmit(obj) {
	if (submit_block) {
		imagesLimitAlert();
		return false;	
	} else {
		validateForm(obj, true);
		return false;
	}
}

function setBlockReqired(name) {
    $ ('#'+ name).find('input, select, textarea').each(function(i, obj) {
        let el_id = $(obj).attr('id');
        if (typeof(config_forms['finance_app'].elements[el_id]) == 'object') {
                config_elements['finance_app'][el_id].required = config_forms['finance_app'].elements[el_id].required;
        }
    });    
}

function unsetBlockReqired(name) {
    $ ('#'+ name).find('input, select, textarea').each(function(i, obj) {
        let el_id = $(obj).attr('id');
        if (typeof(config_forms['finance_app'].elements[el_id]) == 'object') {
                config_elements['finance_app'][el_id].required = false;
        }
    });
}

//--- Custom - Finance  form ---

let fc_init = (v) => {
	$('#btnSubmit_finance_calc').hide();
	let vprice = parseInt(v.lower_price.replace('$', '').replace(',', '')),
	dpay = vprice / 5,
	loan = vprice - dpay,
	apr = 9.99,
	term = 36,
	ir = apr / 1200,
	tmp = Math.pow((1+ir), term) - 1,
	payment = loan * ir * Math.pow((1+ir), term) / tmp;


	$('[name="vprice"]').attr('readonly', true).val('Vehicle Price: $'+ numberFormat(vprice));
	$('[name="dpay"]').attr('readonly', true).val('Down Payment: $'+ numberFormat(dpay));
	$('[name="loan"]').attr('readonly', true).val('Amount of Loan: $'+ numberFormat(loan));
	$('[name="apr"]').attr('readonly', true).val('APR: '+ apr +'%');
	$('[name="term"]').attr('readonly', true).val('Term '+ term +' mo');
	$('[name="pay"]').val('Monthly Payment: $'+ numberFormat(Number(payment).toFixed(2)));
},
ff_init = (config) => {

    unsetBlockReqired('co_applicant_block');
    unsetBlockReqired('prev_employer');
    unsetBlockReqired('prev_applicant_residence_block');

	$('[name=work_y]').on('change', function(){
		if($(this).val() < 2){
            setBlockReqired('prev_employer');
            $('#prev_employer').show('slow');
        } else {
            unsetBlockReqired('prev_employer');
            $('#prev_employer').hide('slow');
        }
	});
    
	$('[name=addr_y]').on('change', function(){
		if($(this).val() < 2) {
            setBlockReqired('prev_applicant_residence_block');
            $('#prev_applicant_residence_block').show('slow');
        } else {
            unsetBlockReqired('prev_applicant_residence_block');
            $('#prev_applicant_residence_block').hide('slow');
        }
	});
    
	$('[name=co_work_y]').on('change', function(){
		if($(this).val() <= 2){
            setBlockReqired('co_prev_employer');
            $('#co_prev_employer').show('slow');
        } else {
            unsetBlockReqired('co_prev_employer');
            $('#co_prev_employer').hide('slow');
        }
	});
    
	$('[name=co_addr_y]').on('change', function(){
		if($(this).val() < 2) {
            setBlockReqired('co_prev_applicant_residence_block');
            $('#co_prev_applicant_residence_block').show('slow');
        } else {
            unsetBlockReqired('co_prev_applicant_residence_block');
            $('#co_prev_applicant_residence_block').hide('slow');
        }
	});

	$('[name=co_applicant_active]').click(function(){
		if(this.checked) {
			$('#co_applicant_block').show('slow');
            setBlockReqired('co_applicant_block');
            unsetBlockReqired('co_prev_applicant_residence_block');
            unsetBlockReqired('co_prev_employer');
		} else{
			$('#co_applicant_block').hide('slow');
            unsetBlockReqired('co_applicant_block');
		}
	});

	$('[name=co_same_address]').click(function(){

		if($('[name=addr_y]').val() < 2) 
            $('#co_prev_applicant_residence_block').show('slow');
		else 
            $('#co_prev_applicant_residence_block').hide('slow');

		if(this.checked){
			$('#applicant_residence_block :input').map(function() {
				$('[name=co_'+ $(this).prop("name") +']').val($(this).val());
			});
			$('#prev_applicant_residence_block :input').map(function() {
				$('[name=co_'+ $(this).prop("name") +']').val($(this).val());
			});
		} else {
			$('#co_applicant_residence_block :input').map(function() {
				$(this).val('');
			});
			$('#prev_applicant_residence_block :input').map(function() {
				$(this).val('');
			});
		}
	});
};
