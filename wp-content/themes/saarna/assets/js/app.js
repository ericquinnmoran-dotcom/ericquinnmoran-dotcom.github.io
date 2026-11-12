/**
 * Custom JavaScript for Saarna Theme
 */

(function ($) {
  "use strict";

  // Document ready
  $(document).ready(function () {
    // ===== SELECT2 INITIALIZATION =====
    // Find all select elements and add the class
    $('select').each(function() {
      $(this).addClass('select2-dropdown-training');
    });

    // Initialize Select2 on all select elements with the class
    if (typeof $.fn.select2 !== 'undefined') {
      $('.select2-dropdown-training').each(function() {
        $(this).select2({
          width: 'auto',
          dropdownAutoWidth: true,
          allowClear: false,
          minimumResultsForSearch: Infinity,
          dropdownParent: $(this).parent()
        });
      });
    }

    // Course resource view toggle (grid/list)
    $(".view-btn").on("click", function () {
      const viewType = $(this).data("view");
      const resourcesContainer = $(".resources-container");

      // Update active button
      $(".view-btn").removeClass("active");
      $(this).addClass("active");

      // Update view class
      resourcesContainer.removeClass("grid-view list-view");
      resourcesContainer.addClass(viewType + "-view");

      if (viewType === "grid") {
        // Grid view styling
        $(".resource-item")
          .removeClass("col-12")
          .addClass("col-md-6 col-lg-4 grid-item");
        $(".resource-image").removeClass("col-md-4").addClass("col-12");
        $(".card-body").parent().removeClass("col-md-8").addClass("col-12");
      } else {
        // List view styling
        $(".resource-item")
          .removeClass("col-md-6 col-lg-4 grid-item")
          .addClass("col-12");
        $(".resource-image").removeClass("col-12").addClass("col-md-4");
        $(".card-body").parent().removeClass("col-12").addClass("col-md-8");
      }
    });

    // Password toggle functionality
    $(".password-toggle").on("click", function () {
      const $button = $(this);
      const passwordInput = $button
        .closest(".password-input-wrapper")
        .find("input");
      const type =
        passwordInput.attr("type") === "password" ? "text" : "password";
      passwordInput.attr("type", type);

      // Toggle the 'showing' class to control icon visibility
      $button.toggleClass("showing");
    });

    // Login form submission
    $("#login-form").on("submit", function (e) {
      e.preventDefault();

      const form = $(this);
      const submitButton = form.find('button[type="submit"]');
      const loginMessage = $(".login-message");

      // Clear previous messages
      loginMessage
        .removeClass("alert-danger alert-success")
        .addClass("d-none")
        .html("");

      // Disable button to prevent multiple submissions
      submitButton.prop("disabled", true).html("Logging in...");

      // For debugging
      console.log("AJAX URL:", saarna_ajax.ajax_url);

      // Get form data
      const formData = new FormData(this);
      formData.append("action", "saarna_ajax_login");

      // Log form data for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      // Send AJAX request
      $.ajax({
        url: saarna_ajax.ajax_url,
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
          console.log("Success response:", response);
          if (response.success) {
            // Show success message
            loginMessage
              .removeClass("d-none alert-danger")
              .addClass("alert-success")
              .html(response.data.message);

            // Redirect after a short delay
            setTimeout(function () {
              window.location.href = response.data.redirect_url;
            }, 1000);
          } else {
            // Show error message
            loginMessage
              .removeClass("d-none alert-success")
              .addClass("alert-danger")
              .html(response.data.message);
            submitButton.prop("disabled", false).html("Log In");
          }
        },
        error: function (xhr, status, error) {
          console.error("Error:", xhr.responseText);
          // Show generic error message
          loginMessage
            .removeClass("d-none alert-success")
            .addClass("alert-danger")
            .html("An error occurred. Please try again.");
          submitButton.prop("disabled", false).html("Log In");
        },
      });
    });

    // Forget Password form submission
    $("#forget-password-form").on("submit", function (e) {
      e.preventDefault();

      const form = $(this);
      const submitButton = form.find('button[type="submit"]');
      const forgetPasswordMessage = $(".forget-password-message");

      // Clear previous messages
      forgetPasswordMessage
        .removeClass("alert-danger alert-success")
        .addClass("d-none")
        .html("");

      // Disable button to prevent multiple submissions
      submitButton.prop("disabled", true).html("Sending...");

      // Get form data
      const formData = new FormData(this);
      formData.append("action", "saarna_ajax_forget_password");

      // Send AJAX request
      $.ajax({
        url: saarna_ajax.ajax_url,
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
          if (response.success) {
            // Show success message
            forgetPasswordMessage
              .removeClass("d-none alert-danger")
              .addClass("alert-success")
              .html(response.data.message);

            // Clear the form
            form[0].reset();
          } else {
            // Show error message
            forgetPasswordMessage
              .removeClass("d-none alert-success")
              .addClass("alert-danger")
              .html(response.data.message);
          }
          submitButton.prop("disabled", false).html("Send Reset Link");
        },
        error: function () {
          // Show generic error message
          forgetPasswordMessage
            .removeClass("d-none alert-success")
            .addClass("alert-danger")
            .html("An error occurred. Please try again.");
          submitButton.prop("disabled", false).html("Send Reset Link");
        },
      });
    });

    // WooCommerce cart remove refresh
    $(document.body).on("removed_from_cart", function () {
      if ($("body").hasClass("woocommerce-cart")) {
        window.location.reload();
      }
    });

    // Reset Password form submission
    $("#reset-password-form").on("submit", function (e) {
      e.preventDefault();

      const form = $(this);
      const submitButton = form.find('button[type="submit"]');
      const resetPasswordMessage = $(".reset-password-message");

      // Clear previous messages
      resetPasswordMessage
        .removeClass("alert-danger alert-success")
        .addClass("d-none")
        .html("");

      // Disable button to prevent multiple submissions
      submitButton.prop("disabled", true).html("Resetting...");

      // Get form data
      const formData = new FormData(this);
      formData.append("action", "saarna_ajax_reset_password");

      // Send AJAX request
      $.ajax({
        url: saarna_ajax.ajax_url,
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
          if (response.success) {
            // Show success message
            resetPasswordMessage
              .removeClass("d-none alert-danger")
              .addClass("alert-success")
              .html(response.data.message);

            // Redirect after a short delay
            setTimeout(function () {
              window.location.href = response.data.redirect_url;
            }, 3000);
          } else {
            // Show error message
            resetPasswordMessage
              .removeClass("d-none alert-success")
              .addClass("alert-danger")
              .html(response.data.message);
            submitButton.prop("disabled", false).html("Reset Password");
          }
        },
        error: function () {
          // Show generic error message
          resetPasswordMessage
            .removeClass("d-none alert-success")
            .addClass("alert-danger")
            .html("An error occurred. Please try again.");
          submitButton.prop("disabled", false).html("Reset Password");
        },
      });
    });

    // NEW Registration Form Validation System
    if ($("#register-form").length) {
      console.log("Registration form found - initializing validation");

      // Clear all error messages function
      function clearErrors() {
        $(".invalid-feedback").hide().text("");
        $(".form-control").removeClass("is-invalid is-valid");
      }

      // Show error function
      function showError(fieldId, message) {
        const field = $("#" + fieldId);
        const errorDiv = field.closest(".form-group").find(".invalid-feedback");

        field.addClass("is-invalid").removeClass("is-valid");
        errorDiv.text(message).show();
        console.log("Error shown for", fieldId, ":", message);
      }

      // Show success function
      function showSuccess(fieldId) {
        const field = $("#" + fieldId);
        field.addClass("is-valid").removeClass("is-invalid");
      }

      // Email validation function
      function isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
      }

      // Password strength checker
      function checkPasswordStrength(password) {
        let score = 0;
        let feedback = [];

        if (password.length < 8) {
          feedback.push("at least 8 characters");
        } else {
          score++;
        }

        if (!/[A-Z]/.test(password)) {
          feedback.push("uppercase letters");
        } else {
          score++;
        }

        if (!/[a-z]/.test(password)) {
          feedback.push("lowercase letters");
        } else {
          score++;
        }

        if (!/[0-9]/.test(password)) {
          feedback.push("numbers");
        } else {
          score++;
        }

        if (!/[^A-Za-z0-9]/.test(password)) {
          feedback.push("symbols");
        } else {
          score++;
        }

        return {
          score: score,
          isStrong: score >= 4,
          feedback: feedback,
        };
      }

      // Real-time password strength indicator
      $("#password").on("input", function () {
        const password = $(this).val();
        const strengthText = $("#password-strength-text");

        if (!password) {
          strengthText
            .text("")
            .removeClass("text-danger text-warning text-success");
          return;
        }

        const strength = checkPasswordStrength(password);

        if (strength.score < 2) {
          strengthText
            .text("Weak")
            .removeClass("text-warning text-success")
            .addClass("text-danger");
        } else if (strength.score < 4) {
          strengthText
            .text("Medium")
            .removeClass("text-danger text-success")
            .addClass("text-warning");
        } else {
          strengthText
            .text("Strong")
            .removeClass("text-danger text-warning")
            .addClass("text-success");
        }

        // Check password match if confirm password has value
        const confirmPassword = $("#confirm_password").val();
        if (confirmPassword) {
          updatePasswordMatch();
        }
      });

      // Real-time password match checker
      $("#confirm_password").on("input", function () {
        updatePasswordMatch();
      });

      function updatePasswordMatch() {
        const password = $("#password").val();
        const confirmPassword = $("#confirm_password").val();
        const matchText = $("#password-match-text");

        if (!confirmPassword) {
          matchText.text("").removeClass("text-danger text-success");
          return;
        }

        if (password === confirmPassword) {
          matchText
            .text("Passwords Match")
            .removeClass("text-danger")
            .addClass("text-success");
        } else {
          matchText
            .text("Passwords do not match")
            .removeClass("text-success")
            .addClass("text-danger");
        }
      }

      // Form validation function
      function validateForm() {
        console.log("Starting form validation...");
        clearErrors();
        let isValid = true;

        // Validate first name
        const firstName = $("#first_name").val().trim();
        if (!firstName) {
          showError("first_name", "First name is required");
          isValid = false;
        } else if (!/^[A-Za-z\s]+$/.test(firstName)) {
          showError(
            "first_name",
            "First name should contain only letters and spaces"
          );
          isValid = false;
        } else {
          showSuccess("first_name");
        }

        // Validate last name
        const lastName = $("#last_name").val().trim();
        if (!lastName) {
          showError("last_name", "Last name is required");
          isValid = false;
        } else if (!/^[A-Za-z\s]+$/.test(lastName)) {
          showError(
            "last_name",
            "Last name should contain only letters and spaces"
          );
          isValid = false;
        } else {
          showSuccess("last_name");
        }

        // Validate email
        const email = $("#email").val().trim();
        if (!email) {
          showError("email", "Email is required");
          isValid = false;
        } else if (!isValidEmail(email)) {
          showError("email", "Please enter a valid email address");
          isValid = false;
        } else {
          showSuccess("email");
        }

        // Validate password
        const password = $("#password").val();
        if (!password) {
          showError("password", "Password is required");
          isValid = false;
        } else {
          const strength = checkPasswordStrength(password);
          if (!strength.isStrong) {
            showError(
              "password",
              "Your password is too weak. Please include at least 8 characters, with a mix of letters, numbers, and symbols"
            );
            isValid = false;
          } else {
            showSuccess("password");
          }
        }

        // Validate confirm password
        const confirmPassword = $("#confirm_password").val();
        if (!confirmPassword) {
          showError("confirm_password", "Please confirm your password");
          isValid = false;
        } else if (password !== confirmPassword) {
          showError("confirm_password", "Passwords do not match");
          isValid = false;
        } else {
          showSuccess("confirm_password");
        }

        // Validate terms and conditions
        if (!$("#terms_conditions").is(":checked")) {
          showError(
            "terms_conditions",
            "You must agree to the terms and conditions"
          );
          isValid = false;
        }

        console.log("Form validation result:", isValid);
        return isValid;
      }

      // Form submission handler
      $("#register-form").on("submit", function (e) {
        e.preventDefault();
        console.log("Form submitted - starting validation");

        // Validate form
        if (!validateForm()) {
          console.log("Validation failed - stopping submission");
          return false;
        }

        console.log("Validation passed - proceeding with AJAX submission");

        const form = $(this);
        const submitButton = form.find('button[type="submit"]');
        const registerMessage = $(".register-message");

        // Clear previous messages
        registerMessage
          .removeClass("alert-danger alert-success")
          .addClass("d-none")
          .html("");

        // Disable button to prevent multiple submissions
        submitButton
          .prop("disabled", true)
          .html('<i class="fas fa-spinner fa-spin me-2"></i>Signing Up...');

        // Get form data
        const formData = new FormData(this);
        formData.append("action", "saarna_ajax_register");

        // Check if saarna_ajax is available
        if (typeof saarna_ajax !== "undefined") {
          formData.append("nonce", saarna_ajax.nonce);
        }

        // Send AJAX request
        $.ajax({
          url:
            typeof saarna_ajax !== "undefined"
              ? saarna_ajax.ajax_url
              : "/wp-admin/admin-ajax.php",
          type: "POST",
          data: formData,
          processData: false,
          contentType: false,
          success: function (response) {
            console.log("AJAX response:", response);

            if (response.success) {
              // Show success message
              registerMessage
                .removeClass("d-none alert-danger")
                .addClass("alert-success")
                .html(response.data.message);

              // Redirect after a short delay
              if (response.data.redirect) {
                setTimeout(function () {
                  window.location.href = response.data.redirect;
                }, 2000);
              }
            } else {
              // Show error message
              const errorMessage =
                response.data && response.data.message
                  ? response.data.message
                  : "Registration failed. Please try again.";
              registerMessage
                .removeClass("d-none alert-success")
                .addClass("alert-danger")
                .html(errorMessage);
              submitButton.prop("disabled", false).html("Sign Up");
            }
          },
          error: function (xhr, status, error) {
            console.log("AJAX error:", error);
            // Show generic error message
            registerMessage
              .removeClass("d-none alert-success")
              .addClass("alert-danger")
              .html("An error occurred. Please try again.");
            submitButton.prop("disabled", false).html("Sign Up");
          },
        });
      });

      console.log("Registration form validation initialized successfully");
    }
  });

  // Sticky header
  const $bottomHeader = $(".bottom-header");
  const $siteHeader = $(".site-header");
  const $body = $("body");

  // If no bottom-header, exit
  if ($bottomHeader.length === 0) return;

  // Store the original top offset of bottom-header
  const bottomHeaderOffset = $bottomHeader.offset().top;

  $(window).on("scroll", function () {
    const scrollTop = $(window).scrollTop();

    if (scrollTop >= bottomHeaderOffset) {
      if (!$siteHeader.hasClass("sticky")) {
        $siteHeader.addClass("sticky");
        $body.css("padding-top", $bottomHeader.outerHeight() + "px");
      }
    } else {
      if ($siteHeader.hasClass("sticky")) {
        $siteHeader.removeClass("sticky");
        $body.css("padding-top", "");
      }
    }
  });

  // ===== TIMEZONE FUNCTIONALITY =====
  // Cookie management functions
  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Timezone conversion is handled centrally by window.SaarnaTZ
  // (assets/js/timezone-converter.js). These wrappers delegate to it so any
  // legacy caller stays consistent with the dropdowns/listing templates.
  function convertTime(timeString, fromTimezone, toTimezone) {
    if (!timeString || timeString === "") return timeString;
    if (window.SaarnaTZ) {
      return window.SaarnaTZ.convert(timeString, toTimezone).text;
    }
    return timeString;
  }

  function updateTimezoneDisplay() {
    if (!window.SaarnaTZ) return;
    const timezoneElement = document.getElementById("timeZoneFilter");
    const selectedTimezone = timezoneElement
      ? timezoneElement.value
      : window.SaarnaTZ.getSaved();
    window.SaarnaTZ.applyTimes(document, selectedTimezone);
  }

  function handleTimezoneChange() {
    const timezoneElement = document.getElementById("timeZoneFilter");
    const selectedTimezone = timezoneElement ? timezoneElement.value : null;
    if (selectedTimezone) {
      setCookie("selected_timezone", selectedTimezone, 30); // Save for 30 days
      if (window.SaarnaTZ) {
        window.SaarnaTZ.save(selectedTimezone);
      }
      updateTimezoneDisplay();
    }
  }


  // Initialize timezone functionality on page load
  function initializeTimezone() {
    const timezoneDropdown = document.getElementById("timeZoneFilter");
    if (timezoneDropdown && window.SaarnaTZ) {
      // Set dropdown to saved timezone or default to EST
      timezoneDropdown.value = window.SaarnaTZ.getSaved();

      // Trigger Select2 update if initialized
      if (typeof $.fn.select2 !== 'undefined') {
        $('#timeZoneFilter').trigger('change.select2');
      }

      // Update display on page load
      updateTimezoneDisplay();
    }
  }

  // Make functions globally available
  window.SaarnaTimezone = {
    setCookie: setCookie,
    getCookie: getCookie,
    convertTime: convertTime,
    updateTimezoneDisplay: updateTimezoneDisplay,
    handleTimezoneChange: handleTimezoneChange,
    initializeTimezone: initializeTimezone,
  };

  // ===== READ MORE FUNCTIONALITY FOR SIDEBAR SECTIONS =====
  $(document).ready(function () {
    // Function to check if content exceeds 2 lines
    function checkContentHeight() {
      $(".sidebar-section").each(function () {
        const $section = $(this);
        const $content = $section.find(".sidebar-content");
        const $button = $section.find(".read-more-btn");

        if ($content.length === 0) return;

        // First, make sure content is fully visible to measure it
        $content.css("max-height", "none");

        // Get line height
        const lineHeight = parseInt($content.css("line-height"));
        const maxHeight = lineHeight * 2; // 2 lines

        // Check if content exceeds 2 lines
        const actualHeight = $content[0].scrollHeight;

        if (actualHeight > maxHeight) {
          // Content exceeds 2 lines - collapse it and show button
          $content.addClass("collapsed");
          $content.css("max-height", maxHeight + "px");
          $button.show();
        } else {
          // Content fits in 2 lines - keep it visible and hide button
          $content.removeClass("collapsed");
          $content.css("max-height", "none");
          $button.hide();
        }
      });
    }

    // Run on page load
    checkContentHeight();

    // Run after images load (in case content contains images)
    $(window).on("load", function () {
      checkContentHeight();
    });

    // Handle Read More button click
    $(".read-more-btn").on("click", function (e) {
      e.preventDefault();
      const $button = $(this);
      const target = $button.data("target");
      const $content = $button.closest(".sidebar-section").find('.sidebar-content[data-section="' + target + '"]');

      if ($content.length === 0) return;

      if ($content.hasClass("collapsed")) {
        // Expand content - remove max-height
        $content.removeClass("collapsed").addClass("expanded");
        $content.css("max-height", "none");
        $button.text("Read Less");
      } else if ($content.hasClass("expanded")) {
        // Collapse content - re-enable max-height
        const lineHeight = parseInt($content.css("line-height"));
        const maxHeight = lineHeight * 2;
        $content.removeClass("expanded").addClass("collapsed");
        $content.css("max-height", maxHeight + "px");
        $button.text("Read More");
      }
    });
  });

  document.addEventListener("DOMContentLoaded", function () {
    // Check if URL has ?openModal=...
    const urlParams = new URLSearchParams(window.location.search);
    const modalToOpen = urlParams.get("openModal");

    if (modalToOpen) {
      // Find the plan button that matches the data attributes
      const targetBtn = document.querySelector(
        `[data-bs-target="#benefitsModal"][data-product-title="${
          modalToOpen.charAt(0).toUpperCase() + modalToOpen.slice(1)
        }"]`
      );

      if (targetBtn) {
        // Simulate a click to trigger modal
        targetBtn.click();
      }
    }
    
    // Sticky Training Details functionality
    function initStickyTrainingDetails() {
      const stickyWrapper = $('.training-details-sticky-wrapper');
      const stickyElement = $('.training-details-sticky');
      const leftContent = $('.--left-content');
      
      if (stickyWrapper.length && stickyElement.length && leftContent.length) {
        function updateStickyBehavior() {
          // Check if window width is above tablet breakpoint
          if ($(window).width() > 991) {
            const leftContentHeight = leftContent.outerHeight();
            const stickyHeight = stickyElement.outerHeight();
            
            // Calculate the maximum height the sticky element can travel
            // It should stop when it reaches the bottom of left content
            const maxStickyTravel = leftContentHeight - stickyHeight;
            
            // If sticky element is taller than left content, don't make it sticky
            if (maxStickyTravel > 0) {
              stickyWrapper.css('height', leftContentHeight + 'px');
              stickyElement.addClass('sticky-enabled');
            } else {
              stickyWrapper.css('height', 'auto');
              stickyElement.removeClass('sticky-enabled');
            }
          } else {
            // Reset on mobile/tablet
            stickyWrapper.css('height', 'auto');
            stickyElement.removeClass('sticky-enabled');
          }
        }
        
        // Initialize
        updateStickyBehavior();
        
        // Update on resize
        $(window).on('resize', function() {
          updateStickyBehavior();
        });
        
        // Update after images load
        $(window).on('load', function() {
          setTimeout(function() {
            updateStickyBehavior();
          }, 100);
        });
      }
    }
    
    // Sticky Event Details functionality
    function initStickyEventDetails() {
      const stickyWrapper = $('.event-details-sticky-wrapper');
      const stickyElement = $('.event-details-sticky');
      const eventContent = $('.event-content');
      
      if (stickyWrapper.length && stickyElement.length && eventContent.length) {
        function updateStickyBehavior() {
          // Check if window width is above tablet breakpoint
          if ($(window).width() > 991) {
            const eventContentHeight = eventContent.outerHeight();
            const stickyHeight = stickyElement.outerHeight();
            
            // Calculate the maximum height the sticky element can travel
            // It should stop when it reaches the bottom of event content
            const maxStickyTravel = eventContentHeight - stickyHeight;
            
            // If sticky element is taller than event content, don't make it sticky
            if (maxStickyTravel > 0) {
              stickyWrapper.css('height', eventContentHeight + 'px');
              stickyElement.addClass('sticky-enabled');
            } else {
              stickyWrapper.css('height', 'auto');
              stickyElement.removeClass('sticky-enabled');
            }
          } else {
            // Reset on mobile/tablet
            stickyWrapper.css('height', 'auto');
            stickyElement.removeClass('sticky-enabled');
          }
        }
        
        // Initialize
        updateStickyBehavior();
        
        // Update on resize
        $(window).on('resize', function() {
          updateStickyBehavior();
        });
        
        // Update after images load
        $(window).on('load', function() {
          setTimeout(function() {
            updateStickyBehavior();
          }, 100);
        });
      }
    }
    
    // Initialize sticky functionality
    initStickyTrainingDetails();
    initStickyEventDetails();
  });

// Initialize timezone conversion when DOM is ready.
// SaarnaTZ (timezone-converter.js) is the canonical implementation and
// auto-applies on DOMContentLoaded; this is a defensive second pass.
$(document).ready(function () {
  if (window.SaarnaTZ) {
    window.SaarnaTZ.applyTimes(document, window.SaarnaTZ.getSaved());
  }
});

// ===== READ MORE FUNCTIONALITY FOR SIDEBAR SECTIONS =====
$(document).ready(function () {
  // Function to check if content exceeds 2 lines
  function checkContentHeight() {
    $(".sidebar-section").each(function () {
      const $section = $(this);
      const $content = $section.find(".sidebar-content");
      const $button = $section.find(".read-more-btn");

      if ($content.length === 0) return;

      console.log("checkContentHeight running...");
      console.log("Before check - Has collapsed:", $content.hasClass("collapsed"));
      console.log("Before check - Has expanded:", $content.hasClass("expanded"));

      // Get line height
      const lineHeight = parseInt($content.css("line-height"));
      const maxHeight = lineHeight * 2; // 2 lines

      // Temporarily remove max-height to get actual content height
      const currentMaxHeight = $content.css("max-height");
      $content.css("max-height", "none");
      const actualHeight = $content[0].scrollHeight;
      
      console.log("Actual height:", actualHeight, "Max height (2 lines):", maxHeight);
      
      // Add small tolerance (10px) to avoid showing button for minor differences
      if (actualHeight > maxHeight + 10) {
        // Content exceeds 2 lines
        console.log("Content exceeds 2 lines - setting collapsed");
        // Remove any existing classes first
        $content.removeClass("collapsed").removeClass("expanded");
        // Add collapsed class and set max-height
        $content.addClass("collapsed");
        $content.css("max-height", maxHeight + "px");
        $button.show();
        console.log("After setting - Has collapsed:", $content.hasClass("collapsed"));
      } else {
        // Content fits in 2 lines
        console.log("Content fits in 2 lines - hiding button");
        $content.removeClass("collapsed").removeClass("expanded");
        $content.css("max-height", "none");
        $button.hide();
      }
    });
  }

  // Run on page load
  checkContentHeight();

  // Run after images load (in case content contains images)
  $(window).on("load", function () {
    checkContentHeight();
  });

  // Force initial state - remove any expanded classes
  $(".sidebar-content").removeClass("expanded");

  // Handle Read More button click - using event delegation
  $(document).on("click", ".read-more-btn", function (e) {
    e.preventDefault();
    const $button = $(this);
    const $section = $button.closest(".sidebar-section");
    const $content = $section.find(".sidebar-content");

    console.log("Button clicked!");
    console.log("Has collapsed:", $content.hasClass("collapsed"));
    console.log("Has expanded:", $content.hasClass("expanded"));

    // Toggle between collapsed and expanded
    if ($content.hasClass("expanded")) {
      // Collapse content
      console.log("Collapsing content...");
      const lineHeight = parseInt($content.css("line-height"));
      const maxHeight = lineHeight * 2;
      $content.removeClass("expanded").addClass("collapsed");
      $content.css("max-height", maxHeight + "px");
      $button.text("Read More");
      console.log("After collapse - Has collapsed:", $content.hasClass("collapsed"));
      console.log("After collapse - Has expanded:", $content.hasClass("expanded"));
    } else {
      // Expand content (works for collapsed or no class)
      console.log("Expanding content...");
      $content.removeClass("collapsed").addClass("expanded");
      $content.css("max-height", "100%");
      $button.text("Read Less");
      console.log("After expand - Has collapsed:", $content.hasClass("collapsed"));
      console.log("After expand - Has expanded:", $content.hasClass("expanded"));
    }
  });
});

})(jQuery);
