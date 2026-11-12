// Instrument Resources Hierarchical Filtering System - AJAX Based
document.addEventListener("DOMContentLoaded", function () {
  const instrumentResourcesSection = document.getElementById(
    "instrument-resources",
  );
  if (!instrumentResourcesSection) return;

  // AJAX URL - will be localized from PHP
  const ajaxUrl = instrumentResourcesAjax.ajaxUrl;

  // Get instrument ID from data attribute
  const instrumentId =
    instrumentResourcesSection.getAttribute("data-instrument-id");

  // Function to load resources via AJAX
  function loadInstrumentResources(
    parentCat,
    childCat = "",
    subchildCat = "",
    searchQuery = "",
  ) {
    const listingContainer = document.getElementById(
      "instrument-resources-listing",
    );
    const sidebarContainer = document.querySelector(".child-categories-list");
    const subchildDropdownWrapper = document.querySelector(
      ".subcategory-dropdown-wrapper",
    );

    if (!listingContainer) return;

    // Show loading state
    listingContainer.innerHTML =
      '<div class="text-center py-5"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></div>';

    // Get language from URL
    const urlParams = new URLSearchParams(window.location.search);
    const language = urlParams.get("lang") || "english";

    // Prepare form data
    const formData = new FormData();
    formData.append("action", "filter_instrument_resources");
    formData.append("instrument_id", instrumentId);
    formData.append("parent_category", parentCat);
    formData.append("child_category", childCat);
    formData.append("subchild_category", subchildCat);
    formData.append("search", searchQuery);
    formData.append("language", language);

    // Make AJAX request
    fetch(ajaxUrl, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Log debug information to console
          if (data.data.debug) {
            console.log("=== AJAX Filter Debug ===");
            console.log("Instrument ID:", data.data.debug.instrument_id);
            console.log(
              "Assigned Categories from ACF:",
              data.data.debug.assigned_categories,
            );
            console.log("Parent Category:", data.data.debug.parent_category);
            console.log("Child Category:", data.data.debug.child_category);
            console.log(
              "Subchild Category:",
              data.data.debug.subchild_category,
            );
            console.log("Search:", data.data.debug.search);
            console.log("Language:", data.data.debug.language);
            console.log(
              "Total Resources Found:",
              data.data.debug.total_resources,
            );
            console.log(
              "Grouped Resources Count:",
              data.data.debug.grouped_resources_count,
            );

            if (data.data.debug.categories) {
              console.log("=== Category Post Counts ===");
              console.table(data.data.debug.categories);
            }
          }

          // Update resources listing
          listingContainer.innerHTML = data.data.html;

          // Update sidebar with child categories
          if (sidebarContainer && data.data.sidebar_html) {
            sidebarContainer.innerHTML = data.data.sidebar_html;
            attachChildCategoryListeners();
          }

          // Update or remove subcategory dropdown
          if (subchildDropdownWrapper) {
            if (data.data.subchild_dropdown_html) {
              subchildDropdownWrapper.outerHTML =
                data.data.subchild_dropdown_html;

              // Reinitialize Select2 BEFORE attaching listeners
              const newSubchildSelect = document.getElementById(
                "instrument-subchild-select",
              );
              if (newSubchildSelect && typeof jQuery !== "undefined") {
                jQuery(newSubchildSelect).select2({
                  minimumResultsForSearch: -1,
                  dropdownParent: jQuery(newSubchildSelect).closest('.filter-category')
                });

                // Attach listener using Select2's change event
                jQuery(newSubchildSelect).on("select2:select", function (e) {
                  const subchildCat = e.params.data.id;

                  // Get current filters
                  const urlParams = new URLSearchParams(window.location.search);
                  const parentCat =
                    urlParams.get("parent_cat") || "free-resources";
                  const childCat = urlParams.get("child_cat") || "";
                  const searchQuery =
                    document.getElementById("instrument-resource-search")
                      ?.value || "";

                  // Load resources via AJAX
                  loadInstrumentResources(
                    parentCat,
                    childCat,
                    subchildCat,
                    searchQuery,
                  );
                });
              } else {
                // Fallback to regular listener if Select2 not available
                attachSubchildDropdownListener();
              }
            } else {
              subchildDropdownWrapper.innerHTML = "";
            }
          }

          // Reattach load more listeners
          attachLoadMoreListeners();

          // Update URL without reload
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set("parent_cat", parentCat);
          if (childCat) {
            newUrl.searchParams.set("child_cat", childCat);
          } else {
            newUrl.searchParams.delete("child_cat");
          }
          if (subchildCat) {
            newUrl.searchParams.set("subchild_cat", subchildCat);
          } else {
            newUrl.searchParams.delete("subchild_cat");
          }
          if (searchQuery) {
            newUrl.searchParams.set("resource_search", searchQuery);
          } else {
            newUrl.searchParams.delete("resource_search");
          }
          window.history.pushState({}, "", newUrl);
        } else {
          listingContainer.innerHTML =
            '<div class="alert alert-danger">Error loading resources</div>';
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        listingContainer.innerHTML =
          '<div class="alert alert-danger">Error loading resources</div>';
      });
  }

  // Parent tab switching - AJAX
  function attachParentTabListeners() {
    const parentTabs = document.querySelectorAll(
      ".instrument-parent-tabs button[data-parent-cat]",
    );
    parentTabs.forEach((tab) => {
      tab.addEventListener("click", function (e) {
        e.preventDefault();

        const parentCat = this.getAttribute("data-parent-cat");

        // Update active state
        parentTabs.forEach((t) => t.classList.remove("active"));
        this.classList.add("active");

        // Reset search
        const searchInput = document.getElementById(
          "instrument-resource-search",
        );
        if (searchInput) searchInput.value = "";

        // Load resources via AJAX
        loadInstrumentResources(parentCat, "", "", "");
      });
    });
  }

  // Child category filtering - AJAX
  function attachChildCategoryListeners() {
    const childCategoryLinks = document.querySelectorAll(
      ".child-category-item",
    );
    childCategoryLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const childCat = this.getAttribute("data-child-cat");

        // Update active state
        childCategoryLinks.forEach((l) => l.classList.remove("active"));
        this.classList.add("active");

        // Get current parent category
        const urlParams = new URLSearchParams(window.location.search);
        const parentCat = urlParams.get("parent_cat") || "free-resources";
        const searchQuery =
          document.getElementById("instrument-resource-search")?.value || "";

        // Load resources via AJAX
        loadInstrumentResources(parentCat, childCat, "", searchQuery);
      });
    });
  } 

  // Subcategory dropdown change - AJAX
  function attachSubchildDropdownListener() {
    const subchildSelect = document.getElementById(
      "instrument-subchild-select",
    );
    if (subchildSelect) {
      // Check if Select2 is available and initialized
      if (typeof jQuery !== "undefined" && jQuery.fn.select2) {
        // Remove any existing listeners first
        jQuery(subchildSelect).off("select2:select change");

        // Use Select2's event handler
        jQuery(subchildSelect).on("select2:select", function (e) {
          const subchildCat = e.params.data.id;

          // Get current filters
          const urlParams = new URLSearchParams(window.location.search);
          const parentCat = urlParams.get("parent_cat") || "free-resources";
          const childCat = urlParams.get("child_cat") || "";
          const searchQuery =
            document.getElementById("instrument-resource-search")?.value || "";

          // Load resources via AJAX
          loadInstrumentResources(
            parentCat,
            childCat,
            subchildCat,
            searchQuery,
          );
        });
      } else {
        // Fallback to regular change event if Select2 not available
        subchildSelect.addEventListener("change", function () {
          const subchildCat = this.value;

          // Get current filters
          const urlParams = new URLSearchParams(window.location.search);
          const parentCat = urlParams.get("parent_cat") || "free-resources";
          const childCat = urlParams.get("child_cat") || "";
          const searchQuery =
            document.getElementById("instrument-resource-search")?.value || "";

          // Load resources via AJAX
          loadInstrumentResources(
            parentCat,
            childCat,
            subchildCat,
            searchQuery,
          );
        });
      }
    }
  }

  // Search functionality with debounce - AJAX
  const searchInput = document.getElementById("instrument-resource-search");
  if (searchInput) {
    let searchTimeout;
    const searchForm = searchInput.closest("form");

    if (searchForm) {
      searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        performSearch();
      });
    }

    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch();
      }, 500);
    });

    function performSearch() {
      const searchValue = searchInput.value.trim();

      // Get current filters
      const urlParams = new URLSearchParams(window.location.search);
      const parentCat = urlParams.get("parent_cat") || "free-resources";
      const childCat = urlParams.get("child_cat") || "";
      const subchildCat = urlParams.get("subchild_cat") || "";

      // Load resources via AJAX
      loadInstrumentResources(parentCat, childCat, subchildCat, searchValue);
    }
  }

  // Load More functionality - Show/Hide hidden resources globally
  function attachLoadMoreListeners() {
    const loadMoreButton = document.querySelector(".load-more-global-btn");
    if (loadMoreButton) {
      loadMoreButton.addEventListener("click", function () {
        // Find all hidden resources across all categories
        const hiddenResources = document.querySelectorAll(
          ".resource-item.hidden-resource",
        );
        const hiddenTitles = document.querySelectorAll(
          ".subcategory-title.hidden-resource",
        );

        // Show all hidden resources and titles
        hiddenResources.forEach((item) => {
          item.style.display = "";
          item.classList.remove("hidden-resource");
        });

        hiddenTitles.forEach((title) => {
          title.style.display = "";
          title.classList.remove("hidden-resource");
        });

        // Hide the Load More button
        this.closest(".load-more-wrapper").style.display = "none";
      });
    }
  }

  // Initialize all listeners
  attachParentTabListeners();
  attachChildCategoryListeners();
  attachSubchildDropdownListener();
  attachLoadMoreListeners();
});
