/**
 * Course Block JavaScript
 */
(function($) {
    'use strict';
    
    // Initialize any JavaScript functionality for the course block here
    $(document).ready(function() {
        // Example: Add hover effects or filtering functionality
        $('.course-block .card').hover(
            function() {
                // Mouse enter
                $(this).addClass('hover');
            },
            function() {
                // Mouse leave
                $(this).removeClass('hover');
            }
        );
    });
    
})(jQuery);
