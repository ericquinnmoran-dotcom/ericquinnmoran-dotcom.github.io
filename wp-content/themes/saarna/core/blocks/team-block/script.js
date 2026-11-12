/**
 * Team Block JavaScript
 */
(function($) {
    'use strict';

    $(document).ready(function() {

        // Initialize modal with animations
        $('#teamModal').modal({
            show: false,
            backdrop: true
        });

        // Animate modal on show
        $('#teamModal').on('show.bs.modal', function() {
            $(this).find('.modal-content')
                .removeClass('animate__animated animate__fadeOutDown')
                .addClass('animate__animated animate__fadeInUp');
        });

        // Animate modal on hide
        $('#teamModal').on('hide.bs.modal', function() {
            $(this).find('.modal-content')
                .removeClass('animate__animated animate__fadeInUp')
                .addClass('animate__animated animate__fadeOutDown');
        });

        // Handle team card click
        $('.flip-card.view-post').on('click', function () {
            const postId = $(this).data('id');

            $.ajax({
                url: ajaxurl, // Make sure ajaxurl is defined via wp_localize_script
                type: 'POST',
                data: {
                    action: 'load_team_member',
                    post_id: postId
                },
                success: function (response) {
                    if (response.success) {
                        const data = response.data;
                        $('#teamImage').attr('src', data.image);
                        $('#popupTitle').text(data.title);
                        $('#popupExcerpt').html(data.excerpt);
                        $('#popupFullContent').html(data.content);
                        $('#teamModal').modal('show');
                    } else {
                        alert('Failed to load team member data.');
                    }
                }
            });
        });

        // Hover effect (optional CSS support)
        $('.flip-card').hover(
            function() {
                $(this).addClass('hover');
            },
            function() {
                $(this).removeClass('hover');
            }
        );

    });

})(jQuery);
