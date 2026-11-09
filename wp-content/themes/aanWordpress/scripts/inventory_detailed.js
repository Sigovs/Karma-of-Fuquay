let total_images = 0,
limit = 0,
offset = 0,
offset1 = 0,
listing_title_tag = '',
getDetailed = (id) => {
 	vid = id.match(/-c-(\d*)\//)[1];

	$('#header').addClass('sticky');

	var t = $(window).scrollTop();

 	$('#page').fadeTo('slow', 0);
	
 	$('html').css({overflow: 'hidden'});
 	$('#detailed_page_wrapper').css('display', 'block');

	$('#detailed_page').show("slow");

// return;	
	$.get( "/isapi_xml.php?module=detailed&action=getPage&vid="+ vid ).done( function( text ) {
        let detailed_title_tag = text.split("\n")[0];
        text = text.replace(detailed_title_tag, '');

  		$('#detailed_page').html(text).ready(() => {
			is_listing_page = false;		
			let new_hash = id;
			loc_tion = current_listing;
			loc_tion = loc_tion.split('/');
			
			$('#breadCrump').html( loc_tion[3].replace(/-/g, ' '));

			if (new_hash.match(/^xxx/) == null) {
                window.history.pushState( {}, null, loc_tion[0] +"//"+ loc_tion[2] + new_hash);
                $('link[rel="canonical"]').attr('href', loc_tion[0] +"//"+ loc_tion[2] + new_hash);
            }
 			document.title = detailed_title_tag;
			datailedInit();
		});

	});
},
datailedInit = () => {
    let set_accordable = () => {
        $('#option-list').accordable({
            openPanel: [1]
        });
    }
    if ($.isFunction($.fn.accordable) == false) {
        ((callback) => {
            let js = document.createElement("script");
            js.type = "text/javascript";
            js.src = '/wp-content/themes/aanWordpress/assets/js/jquery.accordable.min.js';
            js.onload = () => {
                callback();
            }
            document.body.appendChild(js);
        })(() => {
            set_accordable();
        })
    } else
        set_accordable();

	$('.element.questions  input').on('click', function(){
			$('#inquery_extra').slideDown();
	});
	
	$(".optionToggle").click(function(){
		$(this).next(".optionBlock").slideToggle("fast");
	});
	
	$(".contactUs").click(function(e){
		e.preventDefault();
		$(".ui-tabs-anchor[href='#contact']").click();
	});
	
	$("div.inventory-detailed-section .detail .btnBox a.view").on("click", function(e){
		e.preventDefault();
		$("a.contact").trigger("click");
		$('html, body').animate({
			scrollTop: $("#contact").offset().top
		}, 500);
	});
	
	$.fancybox.defaults.buttons = [
			'fullScreen',
			'slideShow',
			'thumbs',
			'close'
		];
	
	$("[data-fancybox]").fancybox({
		fullScreen: {
			autoStart: true
		},
		afterShow: function( instance, slide ) {
			$(".fancybox-is-zoomable .fancybox-slide--current").click();
		},
	});
	
/* full screen photo viewer */
	var fullscreen = false;
	$( '.fullscreen-photos').on( 'click', function( e ){
		e.preventDefault();
		var elem = $( 'section.fullscreen-photos-container' ).get(0);
		if (elem.requestFullscreen) {
			elem.requestFullscreen();
		} else if (elem.msRequestFullscreen) {
			elem.msRequestFullscreen();
		} else if (elem.mozRequestFullScreen) {
			elem.mozRequestFullScreen();
		} else if (elem.webkitRequestFullscreen) {
			elem.webkitRequestFullscreen();
		}
		$( 'section.fullscreen-photos-container' ).show();

		fullscreen = true;
	});
	$( 'section.fullscreen-photos-container .exit' ).on( 'click', function( e ){
		e.preventDefault();
		var elem = document;
		if (elem.exitFullscreen) {
			elem.exitFullscreen();
		} else if (elem.msExitFullscreen) {
			elem.msExitFullscreen();
		} else if (elem.mozExitFullScreen) {
			elem.mozExitFullScreen();
		} else if (document.mozCancelFullScreen) {
			elem.mozCancelFullScreen();
		} else if (elem.webkitExitFullscreen) {
			elem.webkitExitFullscreen();
		}
		fullscreen = false;
		$( 'section.fullscreen-photos-container' ).hide();
	});
	$( document ).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', function(e) {
		var IFS =
			(typeof document.isFullScreen != "undefined") ? document.isFullScreen :
			(typeof document.webkitIsFullScreen != "undefined") ? document.webkitIsFullScreen :
			(typeof document.mozIsFullScreen != "undefined") ? document.mozIsFullScreen :
			(typeof document.msIsFullScreen != "undefined") ? document.msIsFullScreen : 
			false;
		if( !IFS && !fullscreen ) {
			$( 'section.fullscreen-photos-container' ).hide();
			fullscreen = false;
		}
		if( fullscreen ) {
			fullscreen = false;
		}
	});

	$(".featureItem b").click(function(){
		$(this).toggleClass("active").next("div").slideToggle();
	});
	$(".featureItem b").eq(0).click();
	
	//-----Lower set of images-------------
	offset1 = parseInt(limit),
	hasmoreimages = parseInt(total_images) > parseInt(limit) ? true : false;

	$('#detailed_page_wrapper').css('height', window.innerHeight - $('#header').innerHeight());

	// if (parseInt(total_images) > 1) {
	// 	document.getElementById('first_image').addEventListener('load', getImages, false);
	// }
	
	$('#detailed_page').scroll(function() {

		if ($('#detailed_page').scrollTop() + $(window).height() > $('.inventory-detailed-section').height() - 2000 && hasmoreimages) {
			hasmoreimages = false;
			$.get( "/isapi_xml.php?module=detailed&action=getImages&vid="+ vid +"&limit="+ limit +"&offset="+ offset1 +"&size=f" ).done( function( text ) {

				text = JSON.parse(text);
				offset1 = parseInt(offset1) + parseInt(limit);
			
				for (var i in text) {

					$('#photos').append('\
								<div class="photo col-md-6 col-lg-4 mb-3" onclick="openFancybox('+ (parseInt(i) + parseInt(offset1) - parseInt(limit)) +')">\
									<img class="full img-fluid w-100" src="'+ text[i].url +'" alt="'+ text[i].alt +'" />\
								</div>');
				}
				hasmoreimages = total_images > offset1 ? true : false;
			});
		}
	});
	checkPinned();
    getImages();
},
openFancybox = (i) => {
	$('#fancypic_'+ i).click();
},
loading = true,
getImages = () => {

	loading = true;

	$.get( "/isapi_xml.php?module=detailed&action=getImages&vid="+ vid +"&limit="+ limit +"&offset="+offset +"&size=l" ).done( function( text ) {
		text = JSON.parse(text);

		for (var i in text) {
			if (offset == 0) {
				if (i < 1) continue;
				$('.mainSlider').append('\
						<div class="photo" onclick="openFancybox('+ i +')">\
								<img class="full" src="'+ text[i].url +'" alt="'+ text[i].alt +'" />\
						</div>');
			} else {
				$('.mainSlider').slick('slickAdd', '\
						<div class="photo" onclick="openFancybox('+ i +')">\
								<img class="full" src="'+ text[i].url +'" alt="'+ text[i].alt +'" />\
						</div>');
			
			}
		}
		
		loading = false;
		
		if (offset == 0) {
			$(".frame .mainSlider").slick( {
				initialSlide: offset,
				fade: false,
				autoplay: false,
				autoplaySpeed: 5000,
				speed: 1500,
				arrows: true,
				dots: false,
				slidesToShow: 1,
				slidesToScroll: 1,
				pauseOnHover: false,
				pauseOnDotsHover: true,
				adaptiveHeight: true,
				responsive: [
				{
					breakpoint: 768,
					settings: {
					slidesToShow: 1,
					slidesToScroll: 1,
					arrows: false,
					dots: false,
					}
				},]
			});
		}
		offset = parseInt(offset) + parseInt(limit);

		$('.slick-next').on('click', function() {
            loadNext();
		});
	});
},
moveToContcts = () => {
	$('#detailed_page').animate({
        scrollTop: $('#tabs').offset().top - 100
    }, 1000);

	$('.contact').trigger('click');
},
count = 0,
loadNext = () => {
    count++;

	if (!loading && count >= limit - 1) {
		count = 0;
		getImages();
	}
},
backToListing = () => {
    if ($('#container').text().trim().length < 50)
        getSearchResults();
    
	if (current_listing == '')
		location.href='inventory';
    if (typeof getSearchResults != "undefined" && vid.length > 0)
        getSearchResults();
    
 	$('#page').css({opacity: '1'});

 	$('html').css({overflow: 'auto'});

 	$('#detailed_page_wrapper').css('display', 'none');
	$('#detailed_page').hide().html('');
	is_listing_page = true;
	
// 	stickyHeader();
	
	window.history.pushState( {}, null, current_listing);
    $('link[rel="canonical"]').attr('href', current_listing);
    document.title = listing_title_tag;
},
toggleOptions = (obj) => {
	
	if (obj.innerHTML == 'Open All') {
		$('.featureItem').find('b').addClass('active');
		$('.featureItem > div:not(.clearfix)').show('slow');
		obj.innerHTML = 'Close All';
	} else {
		$('.featureItem').find('b').removeClass('active');
		$('.featureItem > div:not(.clearfix)').hide('slow');
		obj.innerHTML = 'Open All';
	}
},
showSticker = (vid) => {
    $.post('https://reseller.aansupport.com/controlpanel/vms/build_sticker.php?cid='+ vid, 
        {
            db: 'woodburyautosal', 
            dblogin: 'wdbrytsls'
            
        }, function (data) {
        var w = window.open('about:blank');
        w.document.open();
        w.document.write(data);
        w.document.close();
    });
}

$(document).ready(function(e) {

	if (vid > 0)
		getDetailed('xxx-c-'+ vid +'/', true);
	else {
        current_listing = window.location.href;
        listing_title_tag = document.title;
    }
/* Tabs with exceptions */    
	let tabs = $('#tabs').tabs({
		hide: {
			effect: "slideUp",
			duration: 700
		},
		show:{
			effect: "slideDown",
			duration: 700
		},
		collapsible: true,
		active: true,
		activate: function (event, ui) {
			if (ui.newPanel.selector == '#video') $('#video > div >  iframe').attr('src', videourl );
			else  $('#video > div > iframe').attr('src', '');
							   
			if (ui.newPanel.selector == '#photos') {
				$('html, body').animate({
						scrollTop: $($(".mkScrollTo").attr( 'href')).offset().top
				}, 500);
			}
		}
	});
	$("#tabs li a").eq(0).click();

	$(".optionToggle").click(function(e){
		e.preventDefault();
		$("#tabs li a").eq(0).click();
		$(this).next(".optionBlock").slideToggle("fast");
	});
	
	$(".contactUs").click(function(e){
		e.preventDefault();
		$(".ui-tabs-anchor[href='#contact']").click();
	});
	
	$("div.inventory-detailed-section .detail .btnBox a.view").on("click", function(e){
		e.preventDefault();
		$("a.contact").trigger("click");
		$('html, body').animate({
			scrollTop: $("#contact").offset().top
		}, 500);
	});
});
window.onpopstate = function (event) {
	var loc = document.location.href.match(/-c-(\d*)\//);
	if (loc != null) {
		getDetailed(document.location.href);
	} else if (is_listing_page) { 
		readHash();
		getSearchResults();
	} else backToListing();
};
