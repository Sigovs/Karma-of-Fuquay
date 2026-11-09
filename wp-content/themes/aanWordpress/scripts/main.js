var $ = jQuery.noConflict();
let megaMenu = false,
current_listing = '',
spin_gif = '<center><img class="custom-spinner-gif" loading="lazy" style="margin-top: 200px" src="/wp-content/themes/aanWordpress/images/spin.gif" /></center>',
nl_subscribe = ( email, name ) => {
    if (email.length < 3 || name.length < 3) {
        $('#nl_message_box').html('Please, Fill Out All Fields.');
        return;
    }
    name = name.split(' ');
    
    $.get( "isapi_xml.php?module=form_popup&formname=newsletter_subscribe&email="+ email +"&fname="+ name[0] +"&lname="+ name[1] +"&sf" ).done( function( text ) {
        if( text == 'OK' ){
        document.cookie = "nl_subscribe=true";
        $('#nl_message_box').html('You are Now subscribed. Thank You.');
        $('#nl_controls_box').hide();
        }else{
        if( text.indexOf('already exists') > -1 ) 
            document.cookie = "nl_subscribe=true";
        $('#nl_message_box').html(text);
        }
    });
},
loadFormsLibrary = (callback) => {
    let js = document.createElement("script");
    js.type = "text/javascript";
    js.src = forms_src_url;
    js.onload = () => {
        callback();
    }
    document.body.appendChild(js);
},
doForm = (nest_id, formname, vid) => {
    insertFormLoadable(nest_id, formname, vid, function() {
        if (!$('#closeContacts').length)
            $('#quickContent').prepend('<div id="closeContacts" onclick="closeContacts()"><span class="glyphicon glyphicon-remove"></span></div>');
        $('#quickContacts').show();
    });
},
insertForm = (nest_id, formname, vid, formCallback) => {
    if (typeof insertFormLoadable !== 'function') {
        loadFormsLibrary(() => {
            insertFormLoadable(nest_id, formname, vid, formCallback);
        })
    } else
        insertFormLoadable(nest_id, formname, vid, formCallback);
},
createPopup = (nest_id, formname, vid) => {
    $('#quickContacts').remove();
        $('body').prepend(
        '<div id="quickContacts" style="display: block; z-index: 9999;">\
            <div id="quickContent" ></div>\
        </div>');

    if (typeof insertFormLoadable !== 'function') {
        loadFormsLibrary(() => {
            doForm(nest_id, formname, vid);
        })
    } else
        doForm(nest_id, formname, vid);

},
closePopup = () => {
    $('#quickContacts').remove();
},
displayPriceAndFee = (price) => {

    $('#quickContacts').remove();
    $('body').prepend(
    `<div id="quickContacts" style="display: block; z-index: 9999;" onclick="closePopup()">
        <div id="quickContent" >
            <div id="closeContacts" onclick="closePopup()">
                <span class="glyphicon glyphicon-remove"></span>
            </div>
            <p class="pb-allin-label">
                All In Price
            </p>
            <p class="pb-allin-price">
                $${ numberFormat(parseInt(price) + dealer_fee) }
            </p>
            <hr class="pb-divider">
            <div class="pb-row">
                <span class="pb-row-label">
                    Base Price
                </span>
                <span class="pb-row-value">
                    $${ numberFormat(price) }
                </span>
            </div>
            <div class="pb-row">
                <span class="pb-row-label">
                    Documentation Fee
                </span>
                <span class="pb-row-value">
                    $${ dealer_fee }
                </span>
            </div>
            <p class="pb-note">
                Our advertised All In Price is the sum of the Base Price and Dealer Fees — no surprises at the desk.
            </p>
        </div>
    </div>`);
},
numberFormat = (number, decimals, decPoint, thousandsSep) => {
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '')
    var n = !isFinite(+number) ? 0 : +number
    var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
    var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
    var dec = (typeof decPoint === 'undefined') ? '.' : decPoint
    var s = ''
    var toFixedFix = function(n, prec) {
        var k = Math.pow(10, prec)
        return '' + (Math.round(n * k) / k).toFixed(prec)
    }
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.')
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || ''
        s[1] += new Array(prec - s[1].length + 1).join('0')
    }
    return s.join(dec)
},
$bannerSlider;

/*
 * hide title tooltips on mouse over
*/
$( document ).ready(function(){
    var cachedTitle = '';
    $( 'a[title]' ).on( 'mouseenter', function(){
        var $this = $( this );
        cachedTitle = $this.attr( 'title' );
        $this.removeAttr( 'title' );
    }).on( 'mouseleave', function(){
        var $this = $( this );
        if( cachedTitle ) {
            $this.attr( 'title', cachedTitle );
        }
    });
    
    $( 'header #navbarCollapse > ul > li.menu-item-has-children > a' ).on( 'click', function( e ){
        e.preventDefault();

        var $this = $( this );
        var wasActive = $this.hasClass( 'active' );
        if( wasActive ) {
            $this.removeClass( 'active' );
            $this.parent().find( '.sub-menu' ).slideUp( 'slow', function(){
                $( this ).removeClass( 'active' );
            });
        } else {
            $( 'header .menuBox > ul > li.menu-item-has-children > a' ).removeClass( 'active' );
            $( 'header .menuBox > ul > li.menu-item-has-children .sub-menu' ).slideUp( 'slow', function(){
                $( this ).removeClass( 'active' );
            });
            $this.addClass( 'active' );
            $this.parent().find( '.sub-menu' ).slideDown( 'slow', function(){
                $( this ).addClass( 'active' );
            });
        }
    });

    $("#main_banner .slider").slick( {
        fade: true,
        autoplay: true,
        autoplaySpeed: 5000,
        speed: 1500,
        arrows: false,
        dots: true,
        pauseOnHover: false,
        pauseOnDotsHover: true,
    });
    let slider = $("#main_banner .slider"),
    $video2 = $( '.home-vid' );
    
    if($video2.length > 0){
        $video2[ 0 ].play();
        $(slider).slick('slickPause');
        $video2.bind( 'ended', function( ) {
            $(slider).slick('slickPlay');
            $(slider).slick('slickNext');
        });
    }
   
    $(".randomCars .featBox").slick( {
        fade: false,
        autoplay: true,
        autoplaySpeed: 5000,
        speed: 1500,
        arrows: false,
        dots: false,
        slidesToShow: 4,
        slidesToScroll: 2,
        pauseOnHover: false,
        pauseOnDotsHover: true,
        customPaging : function(slider, i){
            return '<button><div></div></button>';
        },
        responsive: [
        {
            breakpoint: 1400,
            settings: {
            slidesToShow: 4,
            slidesToScroll: 1,
            arrows: false,
            dots: false,
            }
        },
        {
            breakpoint: 1199,
            settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            arrows: false,
            dots: false,
            }
        },
        {
            breakpoint: 991,
            settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            arrows: false,
            dots: false,
            }
        },
        {
            breakpoint: 767,
            settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            dots: false,
            }
        }
        ]
    });
});

/*
    * stop propagation
    */
$( 'body' ).on( 'click', '.stopprop', function( e ){
    e.stopPropagation();
});
$(document).ajaxComplete(function() {
	checkPinned();
});

//Header Specific Code
$(window).load(function(e){
	//initalize my garage
	init_garage();
	e.preventDefault();

    if(megaMenu){
		$.get( "/isapi_xml.php?module=inventory&header&sold=Available").done( function( text ) {
			var text1 = text.split("\n");
			next_search = [];
			next_search = JSON.parse(text1[1]);
			next_search_totals = JSON.parse(text1[2]);
			$('#'+ 'make_menue').append($(
				'<div class="elm">\
                    <div class="title">\
                        <a href="/inventory/">\
                            View All / '+ text1[0] +'\
                    </a>\
                </div>\
            </div>'));
			var split = Math.ceil(next_search['make'].length/2);
			for(var fld in next_search['make']){
				let value = '',
					totlas = typeof(next_search_totals['make'][next_search['make'][fld]]) != 'undefined' ? ' / '+ next_search_totals['make'][next_search['make'][fld]] : '';
				value = next_search['make'][fld].toUpperCase().replace('_', ' ');
				if (fld <= split) {
					$('#' + 'make_menue').append($(
						'<div class="elm">\
                            <div class="title">\
                            <a href="javascript:;" onclick="location.href=\'inventory/?' + 'make' + '=' + next_search['make'][fld] + '\'">\
                            ' + value + totlas + '\
                        </a>\
                    </div>\
                </div>'));
				}else{
					$('#'+ 'make_menue2').append($(
						'<div class="elm">\
                        <div class="title">\
                            <a href="javascript:;" onclick="location.href=\'inventory/?'+ 'make' +'='+ next_search['make'][fld] +'\'">\
                            '+ value + totlas +'\
                        </a>\
                    </div>\
                </div>'));
				}
			}
		});

		$(".invmenu").click(function(e){
			e.preventDefault();
			$("#headInv").slideToggle();
			if($(window).width()<992){
				$(".menuicBox").trigger('click');
			}

		});
	}

});
