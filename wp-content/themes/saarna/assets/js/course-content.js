jQuery(document).ready(function($) {
    $('.read-more-btn').on('click', function() {
        const section = $(this).data('section');
        const wrapper = $(this).closest('.content-wrapper');
        const preview = wrapper.find('.content-preview');
        const full = wrapper.find('.content-full');
        
        if (preview.is(':visible')) {
            preview.hide();
            full.removeClass('d-none');
            $(this).text('Read Less');
        } else {
            preview.show();
            full.addClass('d-none');
            $(this).text('Read More');
        }
    });
});
