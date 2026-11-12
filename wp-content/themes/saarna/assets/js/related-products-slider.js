jQuery(document).ready(function ($) {
  // Initialize Related Products Slider
  $(".related-products-slider").slick({
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 4000,
    centerMode: false,
    margin: 10,
    arrows: false,
    prevArrow:
      '<button type="button" class="slick-prev"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15l-5-5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>',
    nextArrow:
      '<button type="button" class="slick-next"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 15l5-5-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>',
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
        },
      },
    ],
  });
});
