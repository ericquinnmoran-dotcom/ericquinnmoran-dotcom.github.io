/**
 * Resource Analytics - External URL Tracking
 * 
 * Handles tracking for external URLs with appended tracking parameters.
 * Sends tracking beacon via AJAX before user navigates to external site.
 *
 * @package Saarna
 * @subpackage Resource_Analytics
 * @since 1.0.0
 */

(function($) {
    'use strict';

    /**
     * Initialize URL tracking for all links with tracking params
     */
    function initExternalTracking() {
        // Track regular links with href attribute
        const regularLinks = $('a[href*="rid="][href*="action="][href*="token="]');
        
        regularLinks.each(function() {
            const $link = $(this);
            const href = $link.attr('href');
            
            // Parse URL to check if it has tracking params
            const url = new URL(href, window.location.origin);
            const params = new URLSearchParams(url.search);
            
            // Check if tracking params exist
            const rid = params.get('rid');
            const action = params.get('action');
            const token = params.get('token');
            const iid = params.get('iid') || 0;
            
            if (!rid || !action || !token) {
                return; // Skip if missing required params
            }
            
            // Add click handler for tracking ALL URLs (internal and external)
            $link.on('click', function(e) {
                // Send tracking beacon
                sendTrackingBeacon(rid, action, token, iid);
                
                // Note: We don't prevent default - let the link navigate normally
                // The beacon is sent asynchronously and should complete quickly
            });
        });

    }

    /**
     * Send tracking beacon via AJAX
     * 
     * @param {string|number} rid Resource ID
     * @param {string} action Action type
     * @param {string} token Security token
     * @param {string|number} iid Instrument ID
     */
    function sendTrackingBeacon(rid, action, token, iid) {
        // Use sendBeacon if available (more reliable for navigation)
        if (navigator.sendBeacon && window.srAnalytics && window.srAnalytics.ajaxUrl) {
            const formData = new FormData();
            formData.append('action', 'sr_track_external');
            formData.append('rid', rid);
            formData.append('action_type', action);
            formData.append('token', token);
            formData.append('iid', iid);
            
            navigator.sendBeacon(window.srAnalytics.ajaxUrl, formData);
        } 
        // Fallback to AJAX (less reliable during navigation)
        else if (window.srAnalytics && window.srAnalytics.ajaxUrl) {
            $.ajax({
                url: window.srAnalytics.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'sr_track_external',
                    rid: rid,
                    action_type: action,
                    token: token,
                    iid: iid
                },
                async: true,
                timeout: 500
            });
        }
    }

    // Initialize when DOM is ready
    $(document).ready(function() {
        initExternalTracking();
        
        // Also use event delegation for dynamically loaded content
        $(document).on('click', '.video-download-btn[data-video-url*="rid="]', function(e) {
            const $button = $(this);
            const videoUrl = $button.attr('data-video-url');
            
            if (!videoUrl) {
                return;
            }
            
            try {
                const url = new URL(videoUrl, window.location.origin);
                const params = new URLSearchParams(url.search);
                
                const rid = params.get('rid');
                const action = params.get('action');
                const token = params.get('token');
                const iid = params.get('iid') || 0;
                
                if (rid && action && token) {
                    sendTrackingBeacon(rid, action, token, iid);
                }
            } catch (error) {
                // Silently ignore invalid URLs
            }
        });
    });

})(jQuery);
