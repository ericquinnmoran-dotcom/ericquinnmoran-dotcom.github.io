/**
 * Saarna Timezone utilities (canonical implementation).
 *
 * All training/event times stored in the CMS are Eastern Time wall-clock
 * values. This library converts and labels them for the visitor's selected
 * timezone using the browser's IANA timezone database (via Intl), so
 * Standard vs Daylight time is always resolved correctly for the EVENT's
 * date — not the current date, and without hand-rolled DST rules.
 *
 * Markup contract:
 *   <span data-original-time="10:00 AM – 4:00 PM"
 *         data-event-date="October 27, 2026 10:00 am"
 *         data-event-end-date="October 28, 2026 4:00 pm">   (optional)
 *       10:00 AM – 4:00 PM <span class="timezone-display">(EST)</span>
 *   </span>
 *
 * SaarnaTZ.applyTimes() rewrites the leading text node with the converted
 * time and updates .timezone-display with the correct abbreviation
 * (e.g. EDT vs EST, PDT vs PST) for the event's date.
 */
(function () {
    'use strict';

    // Dropdown/display keys -> representative IANA zones.
    // 'pst' = US Pacific (Los Angeles — still changes clocks).
    // 'cst' = US Central (Chicago — still changes clocks).
    // 'cdt' = Manitoba (Winnipeg — permanent -05 since 2026-10-31,
    //         diverges from US Central in winter).
    // 'pct' = British Columbia (Vancouver — permanent UTC-7, officially
    //         "Pacific Time"/PCT since Nov 1 2026; diverges from US
    //         Pacific in winter). 'pdt' kept as an alias for previously
    //         saved selections.
    var TZ_IANA = {
        'est': 'America/Toronto',
        'cst': 'America/Chicago',
        'cdt': 'America/Winnipeg',
        'pst': 'America/Los_Angeles',
        'pct': 'America/Vancouver',
        'pdt': 'America/Vancouver',
        'cet': 'Europe/Paris',
        'aest': 'Australia/Sydney',
        'nzst': 'Pacific/Auckland'
    };

    // Preferred display abbreviation per zone, keyed by the zone's UTC
    // offset in minutes at the moment being formatted. Intl's
    // timeZoneName:'short' renders some zones as "GMT+1" rather than a
    // familiar abbreviation (e.g. Europe/Paris -> CET), and jurisdiction
    // changes mean the same zone can legitimately be either Standard or
    // Daylight depending on which tzdata the browser ships — resolving by
    // offset keeps the label consistent with the converted wall time.
    var ABBR_BY_OFFSET = {
        'est':  { '-240': 'EDT', '-300': 'EST' },
        'cst':  { '-300': 'CDT', '-360': 'CST' },
        'cdt':  { '-300': 'CDT', '-360': 'CST' },
        'pst':  { '-420': 'PDT', '-480': 'PST' },
        'pct':  { '-420': 'PCT', '-480': 'PST' },
        'pdt':  { '-420': 'PCT', '-480': 'PST' },
        'cet':  { '60': 'CET', '120': 'CEST' },
        'aest': { '600': 'AEST', '660': 'AEDT' },
        'nzst': { '720': 'NZST', '780': 'NZDT' }
    };

    // Stored CMS times are always Eastern.
    var SOURCE_KEY = 'est';

    var STORAGE_KEY = 'selectedTimezone';   // localStorage (used by inline scripts)
    var COOKIE_NAME = 'selected_timezone';  // cookie (read by PHP-rendered blocks)

    var intlAvailable = (typeof Intl !== 'undefined') && (typeof Intl.DateTimeFormat === 'function');

    function iana(tzKey) {
        return TZ_IANA[String(tzKey || '').toLowerCase()] || TZ_IANA[SOURCE_KEY];
    }

    function setCookie(name, value, days) {
        var expires = '';
        if (days) {
            var d = new Date();
            d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
            expires = '; expires=' + d.toUTCString();
        }
        document.cookie = name + '=' + (value || '') + expires + '; path=/';
    }

    function getCookie(name) {
        var nameEQ = name + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
        }
        return null;
    }

    function getSaved() {
        var v = null;
        try { v = localStorage.getItem(STORAGE_KEY); } catch (e) {}
        if (!v) v = getCookie(COOKIE_NAME);
        v = String(v || '').toLowerCase();
        return TZ_IANA[v] ? v : 'est';
    }

    function save(tzKey) {
        tzKey = String(tzKey || 'est').toLowerCase();
        try { localStorage.setItem(STORAGE_KEY, tzKey); } catch (e) {}
        setCookie(COOKIE_NAME, tzKey, 30);
    }

    // Minutes offset (from UTC) of `ianaZone` at the given instant.
    function offsetMinutes(ianaZone, date) {
        var dtf = new Intl.DateTimeFormat('en-US', {
            timeZone: ianaZone, hour12: false,
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        var parts = {};
        dtf.formatToParts(date).forEach(function (p) { parts[p.type] = p.value; });
        var hour = parseInt(parts.hour, 10) % 24;
        var asUTC = Date.UTC(
            parseInt(parts.year, 10), parseInt(parts.month, 10) - 1,
            parseInt(parts.day, 10), hour,
            parseInt(parts.minute, 10), parseInt(parts.second, 10)
        );
        return (asUTC - date.getTime()) / 60000;
    }

    function parseEventDate(dateStr) {
        var d = dateStr ? new Date(dateStr) : new Date();
        return isNaN(d.getTime()) ? new Date() : d;
    }

    // Wall-clock "h:mm AM" on the event's date in Eastern -> absolute instant.
    function easternToInstant(dateStr, timeStr) {
        var m = String(timeStr).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!m) return null;
        var h = parseInt(m[1], 10);
        var min = parseInt(m[2], 10);
        var ap = m[3].toUpperCase();
        if (ap === 'PM' && h !== 12) h += 12;
        if (ap === 'AM' && h === 12) h = 0;

        var base = parseEventDate(dateStr);
        var guess = Date.UTC(base.getFullYear(), base.getMonth(), base.getDate(), h, min);
        var zone = TZ_IANA[SOURCE_KEY];

        // Resolve the Eastern offset at that moment; re-check once in case
        // the guess landed on the wrong side of a DST transition.
        var instant = guess - offsetMinutes(zone, new Date(guess)) * 60000;
        instant = guess - offsetMinutes(zone, new Date(instant)) * 60000;
        return new Date(instant);
    }

    // Format an instant in the target zone: { time: '7:00 AM', abbr: 'PDT' }.
    function formatPart(instant, tzKey) {
        var dtf = new Intl.DateTimeFormat('en-US', {
            timeZone: iana(tzKey),
            hour: 'numeric', minute: '2-digit', hour12: true,
            timeZoneName: 'short'
        });
        var parts = {};
        dtf.formatToParts(instant).forEach(function (p) { parts[p.type] = p.value; });
        var zone = iana(tzKey);
        var offMap = ABBR_BY_OFFSET[String(tzKey || '').toLowerCase()];
        var abbr = (offMap && offMap[offsetMinutes(zone, instant)])
            || parts.timeZoneName
            || String(tzKey).toUpperCase();
        return {
            time: parseInt(parts.hour, 10) + ':' + parts.minute + ' ' + (parts.dayPeriod || ''),
            abbr: abbr
        };
    }

    /**
     * Convert an Eastern time string ("10:00 AM" or "10:00 AM – 4:00 PM") to
     * the target timezone for the given event date.
     * Returns { text: '7:00 AM – 1:00 PM', abbr: 'PDT' }.
     */
    function convert(timeStr, tzKey, eventDate, eventEndDate) {
        tzKey = String(tzKey || SOURCE_KEY).toLowerCase();
        if (!intlAvailable) {
            return { text: timeStr, abbr: tzKey.toUpperCase() };
        }
        var segments = String(timeStr).split(/\s*[–-]\s*/);
        var out = [];
        var abbr = null;
        for (var i = 0; i < segments.length; i++) {
            var seg = segments[i].trim();
            if (!seg || !/(\d{1,2}):(\d{2})\s*(AM|PM)/i.test(seg)) { out.push(seg); continue; }
            // The end of a multi-day range belongs to the end date.
            var dateForPart = (i > 0 && eventEndDate) ? eventEndDate : eventDate;
            var instant = easternToInstant(dateForPart, seg);
            if (!instant) { out.push(seg); continue; }
            var f = formatPart(instant, tzKey);
            if (abbr === null) abbr = f.abbr;
            out.push(f.time);
        }
        return { text: out.join(' – '), abbr: abbr || tzKey.toUpperCase() };
    }

    // Timezone abbreviation for the event's date (e.g. 'EDT' vs 'EST').
    function abbr(tzKey, eventDate) {
        tzKey = String(tzKey || SOURCE_KEY).toLowerCase();
        if (!intlAvailable) return tzKey.toUpperCase();
        var instant = easternToInstant(eventDate, '12:00 PM') || parseEventDate(eventDate);
        return formatPart(instant, tzKey).abbr;
    }

    /**
     * Format an event's date (range) in the target zone. The converted
     * date follows the converted wall time, so an event that crosses
     * midnight in the visitor's timezone shows the correct local day.
     * `withWeekday` mirrors the "Monday, Oct. 26, 2026" style used on
     * the events/search templates.
     */
    function formatEventDate(startInstant, endInstant, tzKey, withWeekday) {
        function dayParts(inst) {
            var dtf = new Intl.DateTimeFormat('en-US', {
                timeZone: iana(tzKey),
                year: 'numeric', month: 'short', day: 'numeric',
                weekday: withWeekday ? 'long' : undefined
            });
            var p = {};
            dtf.formatToParts(inst).forEach(function (x) { p[x.type] = x.value; });
            return p;
        }
        function md(p) { return p.month + ' ' + parseInt(p.day, 10); }
        function mdy(p) { return md(p) + ', ' + p.year; }
        var s = dayParts(startInstant);
        var e = endInstant ? dayParts(endInstant) : null;
        if (e && (s.year !== e.year || s.month !== e.month || s.day !== e.day)) {
            return md(s) + ' to ' + mdy(e);
        }
        var single = mdy(s);
        return (withWeekday && s.weekday) ? s.weekday + ', ' + single : single;
    }

    /**
     * Convert every [data-original-time] element under `root` to `tzKey`,
     * updating the leading text node and the inner .timezone-display label.
     * Also converts [data-event-start] date elements so multi-day and
     * cross-midnight events show the correct local date (range).
     */
    function applyTimes(root, tzKey) {
        if (!intlAvailable) return;
        root = root || document;
        tzKey = String(tzKey || getSaved()).toLowerCase();

        root.querySelectorAll('[data-event-start]').forEach(function (el) {
            var startStr = el.getAttribute('data-event-start');
            var start = easternToInstant(startStr, startStr);
            if (!start) return;
            var endStr = el.getAttribute('data-event-end');
            var end = endStr ? easternToInstant(endStr, endStr) : null;
            var withWeekday = el.getAttribute('data-date-format') === 'long';
            el.textContent = formatEventDate(start, end, tzKey, withWeekday);
        });

        var els = root.querySelectorAll('[data-original-time]');
        els.forEach(function (el) {
            var original = el.getAttribute('data-original-time');
            if (!original) return;
            var result = convert(
                original, tzKey,
                el.getAttribute('data-event-date'),
                el.getAttribute('data-event-end-date')
            );
            var textNode = null;
            for (var i = 0; i < el.childNodes.length; i++) {
                if (el.childNodes[i].nodeType === 3 && el.childNodes[i].textContent.trim() !== '') {
                    textNode = el.childNodes[i];
                    break;
                }
            }
            if (textNode) {
                textNode.textContent = result.text + ' ';
            } else {
                el.insertBefore(document.createTextNode(result.text + ' '), el.firstChild);
            }
            var label = el.querySelector('.timezone-display');
            if (label) label.textContent = '(' + result.abbr + ')';
        });
    }

    /**
     * Wire up one or more timezone <select> dropdowns: restore the saved
     * selection, keep dropdowns in sync, convert times and persist the choice
     * (localStorage + cookie) on change. Works with or without Select2.
     */
    function initDropdowns(dropdowns) {
        dropdowns = (dropdowns || []).filter(function (d) { return !!d; });
        var current = getSaved();

        var syncDropdowns = function (tz) {
            dropdowns.forEach(function (d) {
                d.value = tz;
                if (typeof jQuery !== 'undefined' && jQuery.fn && jQuery.fn.select2) {
                    jQuery(d).val(tz).trigger('change.select2');
                }
            });
        };
        var apply = function (tz) {
            tz = String(tz || 'est').toLowerCase();
            syncDropdowns(tz);
            applyTimes(document, tz);
            save(tz);
        };

        dropdowns.forEach(function (d) {
            d.addEventListener('change', function () { apply(d.value); });
            if (typeof jQuery !== 'undefined') {
                jQuery(d).on('select2:select', function () { apply(jQuery(d).val()); });
            }
        });

        // Apply the saved timezone after markup settles (matches previous timing).
        setTimeout(function () { apply(current); }, 100);
    }

    window.SaarnaTZ = {
        TZ_IANA: TZ_IANA,
        getSaved: getSaved,
        save: save,
        convert: convert,
        abbr: abbr,
        applyTimes: applyTimes,
        initDropdowns: initDropdowns
    };

    // Auto-apply the saved timezone on every page load so any element marked
    // up with data-original-time is consistent site-wide (detail pages,
    // blocks, search results — not just listing pages with a dropdown).
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(function () { applyTimes(document, getSaved()); }, 100);
    });
})();
