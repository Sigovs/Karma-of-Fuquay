$(window).scroll(function() {
    var scroll = $(window).scrollTop();
    if (scroll >= 30) {
        $(".fixed-top").addClass("addbg");
    } else {
        $(".fixed-top").removeClass("addbg");
    }
});

$("#models-link").click(function() {
    if ($("#models-list").hasClass("show")) {
        $("#models-list").removeClass("show");
    } else {
        $("#models-list").addClass("show");
    }
});

$(document).on('scroll', function() {
    if ($(document).scrollTop() > 1) {
        $('header').addClass('shrink');
    } else {
        $('header').removeClass('shrink');
    }
});


$(document).ready(function() {
    $('.reviews-slider').owlCarousel({
        slideSpeed: 300,
        loop: true,
        dots: false,
        center: true,
        nav: true,
        paginationSpeed: 400,
        autoplay: false,
        autoplayTimeout: 2000,
        autoplayHoverPause: false,
        animateOut: 'fadeOut',
        margin: 10,
        responsiveClass: true,
        responsive: {
            0: {
                items: 1,
            },
            600: {
                items: 2,
                center: false
            },
            1000: {
                items: 3,
            }
        }
    })
});