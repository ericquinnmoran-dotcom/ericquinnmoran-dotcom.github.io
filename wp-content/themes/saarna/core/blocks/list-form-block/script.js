/**
 * List Form Block JavaScript
 */
(function($) {
    'use strict';

    // Store original form HTML for resetting
    var originalFormHTML = null;
    
    // readonly input field
    $('.email-address-field input[type="email"]').prop('readonly', true);
    
    $(document).ready(function() {
        // Store the original form HTML on page load (before any submissions)
        var $modalBody = $('#FormModal .modal-body');
        if ($modalBody.length > 0 && !originalFormHTML) {
            originalFormHTML = $modalBody.html();
        }
        
        // Reset form to original state when modal is closed
        $('#FormModal').on('hidden.bs.modal', function() {
            if (originalFormHTML) {
                var $modalBody = $('#FormModal .modal-body');
                $modalBody.html(originalFormHTML);
                // Re-apply readonly to email field after restoring
                $('.email-address-field input[type="email"]').prop('readonly', true);
            }
        });
        
        // Handle mailto links in list-form-block
        $('.list-form-block a[href^="mailto:"]').on('click', function(e) {
            e.preventDefault();
            
            // Extract email from mailto link
            var mailtoHref = $(this).attr('href');
            var email = mailtoHref.replace('mailto:', '').trim();
            
            // Store original form HTML if not already stored
            var $modalBody = $('#FormModal .modal-body');
            if (!originalFormHTML) {
                originalFormHTML = $modalBody.html();
            }
            
            // Reset form to original state before opening
            if (originalFormHTML) {
                $modalBody.html(originalFormHTML);
                $('.email-address-field input[type="email"]').prop('readonly', true);
            }
            
            // Open the modal
            var modal = new bootstrap.Modal(document.getElementById('FormModal'));
            modal.show();
            
            // Wait for modal to be fully shown and Gravity Form to be rendered
            $('#FormModal').on('shown.bs.modal', function() {
                // Try multiple selectors to find the email field
                var $emailField = $('.email-address-field input[type="email"]');
                
                // If not found, try by ID
                if ($emailField.length === 0) {
                    $emailField = $('#email-address-field');
                }
                
                // Autofill the email field if found
                if ($emailField.length > 0) {
                    $emailField.val(email).trigger('change');
                    
                    // Focus on the field
                    setTimeout(function() {
                        $emailField.focus();
                    }, 100);
                } else {
                    console.warn('Email field not found in the form');
                }
            });
        });

        // Handle file input display for upload-attachment fields
        $(document).on('change', '.gfield.upload-attachment input[type="file"]', function() {
            var $fileInput = $(this);
            var $container = $fileInput.closest('.ginput_container');
            var $fileNameDisplay = $container.find('.file-name-display');
            
            // Create the display span if it doesn't exist
            if ($fileNameDisplay.length === 0) {
                $fileNameDisplay = $('<span class="file-name-display">Browse File</span>');
                $container.append($fileNameDisplay);
            }
            
            // Update the filename display
            if ($fileInput[0].files && $fileInput[0].files.length > 0) {
                var filename = $fileInput[0].files[0].name;
                $fileNameDisplay.text(filename);
            } else {
                $fileNameDisplay.remove();
            }
        });
    });
    
})(jQuery);