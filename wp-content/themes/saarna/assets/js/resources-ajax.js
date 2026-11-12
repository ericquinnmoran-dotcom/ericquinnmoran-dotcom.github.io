document.addEventListener("DOMContentLoaded", function () {
  // Elements - Use class selector for search input

  const searchInput = document.querySelector(".search-input");

  const categorySelect = document.getElementById("category-select");

  const yearSelect = document.getElementById("year-select");

  const clearBtn = document.getElementById("clear-filters");

  const clearMobileBtn = document.getElementById("clear-filters-mobile");

  const resourcesSection = document.querySelector(".resources-section");

  const viewPreferenceInput = document.getElementById("view-preference-input");

  let typingTimer;

  const doneTypingInterval = 500; // 0.5 second

  // Initialize

  initEventListeners();

  updateActiveFilters();

  function initEventListeners() {
    // Search input

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        clearTimeout(typingTimer);

        typingTimer = setTimeout(function () {
          updateResources();
        }, doneTypingInterval);
      });

      // Clear search button

      const searchClearBtn = document.querySelector(".search-clear-btn");

      if (searchClearBtn) {
        searchClearBtn.addEventListener("click", function () {
          searchInput.value = "";

          updateResources();
        });
      }
    }

    // Category select - handle sub-category dropdown creation

    if (categorySelect) {
      console.log("Category select found:", categorySelect);

      // Try Select2 event first

      if (typeof jQuery !== "undefined" && jQuery.fn.select2) {
        console.log("Using Select2 event handler");

        jQuery(categorySelect).on("change", function () {
          console.log("Select2 change event fired");

          updateSubCategoryDropdown();

          updateResources();
        });
      } else {
        console.log("Using native event handler");

        categorySelect.addEventListener("change", function () {
          console.log("Native change event fired");

          updateSubCategoryDropdown();

          updateResources();
        });
      }
    }

    // Year select

    if (yearSelect) {
      yearSelect.addEventListener("change", updateResources);
    }

    // Clear filters buttons

    if (clearBtn) {
      clearBtn.addEventListener("click", clearFilters);
    }

    if (clearMobileBtn) {
      clearMobileBtn.addEventListener("click", clearFilters);
    }

    // Clear all filters button

    const clearAllBtn = document.getElementById("clear-all-filters");

    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", function (e) {
        e.preventDefault();

        clearFilters();
      });
    }

    // Clear all mobile filters button

    const clearAllMobileBtn = document.getElementById(
      "clear-all-filters-mobile",
    );

    if (clearAllMobileBtn) {
      clearAllMobileBtn.addEventListener("click", function (e) {
        e.preventDefault();

        clearFilters();
      });
    }
  }

  function updateSubCategoryDropdown() {
    const category = categorySelect ? categorySelect.value : "";

    console.log("Parent selected:", category);

    // Remove existing sub-category dropdown

    const existingDropdown = document.getElementById(
      "sub-category-dropdown-container",
    );

    if (existingDropdown) {
      existingDropdown.remove();
    }

    if (category) {
      console.log("Making AJAX call for sub-categories...");

      // Debug: Check if resources_ajax is available

      console.log("resources_ajax object:", typeof resources_ajax);

      console.log("resources_ajax:", resources_ajax);

      if (typeof resources_ajax === "undefined") {
        console.error("ERROR: resources_ajax object is not available!");

        return;
      }

      if (!resources_ajax.ajax_url) {
        console.error("ERROR: resources_ajax.ajax_url is not defined!");

        return;
      }

      if (!resources_ajax.nonce) {
        console.error("ERROR: resources_ajax.nonce is not defined!");

        return;
      }

      console.log("AJAX URL:", resources_ajax.ajax_url);

      console.log("Nonce:", resources_ajax.nonce);

      // Make AJAX call to get sub-categories

      const data = new URLSearchParams();

      data.append("action", "get_sub_categories");

      data.append("category", category);

      data.append("nonce", resources_ajax.nonce);

      console.log("Request data:", data.toString());

      fetch(resources_ajax.ajax_url, {
        method: "POST",

        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },

        body: data,
      })
        .then((response) => {
          console.log("AJAX response received:", response);

          if (!response.ok) {
            throw new Error(
              "HTTP " + response.status + ": " + response.statusText,
            );
          }

          return response.text();
        })

        .then((responseText) => {
          console.log("Raw response text:", responseText);

          // Try to parse as JSON

          let subCategories;

          try {
            subCategories = JSON.parse(responseText);

            console.log(
              "Sub-categories received (parsed JSON):",

              subCategories,
            );
          } catch (e) {
            console.error("Failed to parse JSON, response might be HTML:", e);

            console.log("Response text length:", responseText.length);

            // If it's not JSON, the template handler might have executed

            return;
          }

          if (subCategories && subCategories.length > 0) {
            console.log("Parent Name:", category);

            console.log(
              "Child names:",

              subCategories.map((child) => child.name).join(", "),
            );

            // Create new sub-category dropdown

            const subCategoryHtml = `

                        <div class="dropdown d-flex align-items-center" id="sub-category-dropdown-container">

                            <label class="w-100" for="">Display Year</label>

                            <select id="sub-category-select" class="form-select" name="sub_category">

                                <option value="" title="All Years">All Years</option>

                                ${subCategories

                                  .map(
                                    (child) =>
                                      `<option value="${child.slug}" title="${child.name}">${child.name}</option>`,
                                  )

                                  .join("")}

                            </select>

                        </div>

                    `;

            console.log("Creating sub-category dropdown HTML...");

            // Insert the new dropdown after the category dropdown

            if (categorySelect) {
              categorySelect

                .closest(".dropdown")

                .insertAdjacentHTML("afterend", subCategoryHtml);

              // Initialize Select2 if available

              if (typeof jQuery !== "undefined" && jQuery.fn.select2) {
                console.log("Initializing Select2 for sub-category dropdown");

                jQuery("#sub-category-select").select2({
                  width: "100%",

                  placeholder: "All Years",

                  allowClear: true,

                  minimumResultsForSearch: Infinity,
                });

                // Add Select2 change event listener

                jQuery("#sub-category-select").on("change", function () {
                  console.log("Select2 sub-category change event fired!");

                  updateResources();
                });
              }

              // Add change event listener to sub-category select

              const subCategorySelect = document.getElementById(
                "sub-category-select",
              );

              if (subCategorySelect) {
                console.log(
                  "Adding change event listener to dynamic sub-category dropdown",
                );

                subCategorySelect.addEventListener("change", function () {
                  console.log("Dynamic sub-category dropdown changed!");

                  updateResources();
                });
              } else {
                console.error(
                  "Failed to find dynamic sub-category dropdown after creation!",
                );
              }

              console.log("Sub-category dropdown created successfully!");
            }
          } else {
            console.log("No sub-categories found for:", category);
          }
        })

        .catch((error) => {
          console.error("Error fetching sub-categories:", error);

          console.error("Error details:", error.message);

          console.error("Error stack:", error.stack);
        });
    }
  }

  function clearFilters(e) {
    if (e) e.preventDefault();

    if (searchInput) searchInput.value = "";

    if (categorySelect) {
      categorySelect.value = "";

      // Trigger change event for Select2 and other listeners

      categorySelect.dispatchEvent(new Event("change"));

      // If using Select2, also trigger its change event

      if (typeof jQuery !== "undefined" && jQuery.fn.select2) {
        jQuery(categorySelect).trigger("change.select2");
      }
    }

    if (yearSelect) yearSelect.value = "";

    // Clear static sub-category dropdown if it exists

    const staticSubCategorySelect = document.getElementById(
      "sub-category-select",
    );

    if (staticSubCategorySelect) {
      staticSubCategorySelect.value = "";
    }

    // Remove dynamic sub-category dropdown

    const existingDropdown = document.getElementById(
      "sub-category-dropdown-container",
    );

    if (existingDropdown) {
      existingDropdown.remove();
    }

    updateResources();
  }

  function updateResources() {
    const searchTerm = searchInput ? searchInput.value : "";

    const category = categorySelect ? categorySelect.value : "";

    const subCategorySelect = document.getElementById("sub-category-select");

    const sub_category = subCategorySelect ? subCategorySelect.value : "";

    const year = yearSelect ? yearSelect.value : "";

    const view = viewPreferenceInput ? viewPreferenceInput.value : "list";

    console.log("=== UPDATE RESOURCES CALLED ===");

    console.log("Search Term:", searchTerm);

    console.log("Category:", category);

    console.log("Sub-Category:", sub_category);

    console.log("Year:", year);

    // Check if resources_ajax is available

    if (typeof resources_ajax === "undefined") {
      console.error("ERROR: resources_ajax object is not available!");

      if (resourcesSection) {
        resourcesSection.innerHTML =
          '<div class="col-12"><div class="alert alert-danger"><p>Configuration error: AJAX settings not loaded. Please refresh the page.</p></div></div>';
      }

      return;
    }

    if (!resources_ajax.ajax_url || !resources_ajax.nonce) {
      console.error("ERROR: resources_ajax.ajax_url or nonce is missing!");

      console.log("resources_ajax:", resources_ajax);

      if (resourcesSection) {
        resourcesSection.innerHTML =
          '<div class="col-12"><div class="alert alert-danger"><p>Configuration error: Missing AJAX URL or nonce. Please refresh the page.</p></div></div>';
      }

      return;
    }

    // Show loading state

    if (resourcesSection) {
      resourcesSection.innerHTML =
        '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    }

    // Send AJAX request to WordPress AJAX URL

    const data = new URLSearchParams();

    data.append("action", "filter_resources");

    data.append("search", searchTerm);

    data.append("category", category);

    data.append("sub_category", sub_category);

    data.append("year", year);

    data.append("view", view);

    data.append("nonce", resources_ajax.nonce);

    console.log("Sending AJAX request with data:", data.toString());

    console.log("AJAX URL:", resources_ajax.ajax_url);

    fetch(resources_ajax.ajax_url, {
      method: "POST",

      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },

      body: data,
    })
      .then((response) => {
        console.log("Response received:", response.status);

        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.status);
        }

        return response.text();
      })

      .then((html) => {
        console.log("HTML received, length:", html.length);

        if (resourcesSection) {
          resourcesSection.innerHTML = html;

          updateUrl(searchTerm, category, year, sub_category);

          updateActiveFilters(searchTerm, category, year, sub_category);

          applyViewPreference(view);

          initAccordions();
        }
      })

      .catch((error) => {
        console.error("AJAX Error:", error);

        if (resourcesSection) {
          resourcesSection.innerHTML = `

                <div class="col-12">

                    <div class="alert alert-danger">

                        <p>An error occurred while loading resources. Please try again.</p>

                        <p><small>Error: ${error.message}</small></p>

                    </div>

                </div>`;
        }
      });
  }

  function updateUrl(search, category, year, sub_category) {
    const params = new URLSearchParams();

    if (search) params.set("search", search);

    if (category) params.set("category", category);

    if (year) params.set("year", year);

    if (sub_category) params.set("sub_category", sub_category);

    const newUrl =
      window.location.pathname +
      (params.toString() ? "?" + params.toString() : "");

    window.history.pushState({}, "", newUrl);
  }

  function updateActiveFilters(search, category, year, sub_category) {
    const activeFilters = document.querySelectorAll(".active-filters");

    const selectedFiltersSection = document.querySelector(".selected-filters");

    const selectedFilterItems = document.querySelector(
      ".selected-filter-items",
    );

    let filtersHtml = "";

    if (search) {
      filtersHtml += `<button class="filter-tag">${search} <span class="remove-filter" data-type="search">×</span></button>`;
    }

    if (category && categorySelect) {
      const categoryName =
        categorySelect.options[categorySelect.selectedIndex].text;

      filtersHtml += `<button class="filter-tag">${categoryName} <span class="remove-filter" data-type="category">×</span></button>`;
    }

    if (sub_category) {
      const subCategorySelect = document.getElementById("sub-category-select");

      if (subCategorySelect) {
        const subCategoryName =
          subCategorySelect.options[subCategorySelect.selectedIndex].text;

        filtersHtml += `<button class="filter-tag">${subCategoryName} <span class="remove-filter" data-type="sub_category">×</span></button>`;
      }
    }

    if (year) {
      filtersHtml += `<button class="filter-tag">${year} <span class="remove-filter" data-type="year">×</span></button>`;
    }

    // Update active filters display

    activeFilters.forEach((container) => {
      container.innerHTML =
        filtersHtml || '<span class="filter-tag">No filters applied</span>';
    });

    // Update selected filters section

    if (selectedFilterItems) {
      if (filtersHtml) {
        selectedFilterItems.innerHTML = filtersHtml;

        if (selectedFiltersSection) {
          selectedFiltersSection.style.display = "flex";
        }
      } else {
        selectedFilterItems.innerHTML = "";

        if (selectedFiltersSection) {
          selectedFiltersSection.style.display = "none";
        }
      }
    }

    // Add event listeners to remove buttons

    document.querySelectorAll(".remove-filter").forEach((button) => {
      button.addEventListener("click", function () {
        const type = this.getAttribute("data-type");

        if (type === "search" && searchInput) {
          searchInput.value = "";
        } else if (type === "category" && categorySelect) {
          categorySelect.value = "";
        } else if (type === "sub_category") {
          const subCategorySelect = document.getElementById(
            "sub-category-select",
          );

          if (subCategorySelect) subCategorySelect.value = "";
        } else if (type === "year" && yearSelect) {
          yearSelect.value = "";
        }

        updateResources();
      });
    });
  }

  function applyViewPreference(view) {
    const resourceGrids = document.querySelectorAll(".resources-grid");

    resourceGrids.forEach((grid) => {
      if (view === "list") {
        grid.classList.add("list-view");

        grid.classList.remove("grid-view");
      } else {
        grid.classList.add("grid-view");

        grid.classList.remove("list-view");
      }
    });
  }

  // Handle browser back/forward buttons

  window.addEventListener("popstate", function () {
    const params = new URLSearchParams(window.location.search);

    if (searchInput) searchInput.value = params.get("search") || "";

    if (categorySelect) categorySelect.value = params.get("category") || "";

    if (yearSelect) yearSelect.value = params.get("year") || "";

    // Only update via AJAX if this is not the initial page load

    if (
      performance.getEntriesByType &&
      performance.getEntriesByType("navigation")[0].type !== "navigate"
    ) {
      updateResources();
    }
  });

  // Accordion functionality

  function initAccordions() {
    const accordionToggles = document.querySelectorAll(".accordion-toggle");

    accordionToggles.forEach((toggle) => {
      // Remove existing event listeners to prevent duplicates

      toggle.replaceWith(toggle.cloneNode(true));
    });

    // Re-select the fresh elements

    const freshToggles = document.querySelectorAll(".accordion-toggle");

    freshToggles.forEach((toggle) => {
      toggle.addEventListener("click", function (e) {
        e.preventDefault();

        e.stopPropagation();

        // Find the content div that is the next sibling of the parent year-header

        const yearHeader = this.closest(".year-header");

        if (yearHeader) {
          const content = yearHeader.nextElementSibling;

          if (content && content.classList.contains("category-content")) {
            // Check current state - if no style is set, default to block (visible)

            const isVisible = content.style.display !== "none";

            if (isVisible) {
              // Hide the content

              content.style.display = "none";

              // Change icon to plus (open icon)

              this.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 0.5C18.3513 0.5 23.5 5.64873 23.5 12C23.5 18.3513 18.3513 23.5 12 23.5C5.64873 23.5 0.5 18.3513 0.5 12C0.5 5.64873 5.64873 0.5 12 0.5Z" stroke="#B3B7BD"/><path d="M12 6V18" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 12H18" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            } else {
              // Show the content

              content.style.display = "block";

              // Change icon to minus (close icon)

              this.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 0.5C18.3513 0.5 23.5 5.64873 23.5 12C23.5 18.3513 18.3513 23.5 12 23.5C5.64873 23.5 0.5 18.3513 0.5 12C0.5 5.64873 5.64873 0.5 12 0.5Z" stroke="#B3B7BD"/><path d="M6 12L18 12" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            }
          }
        }
      });
    });
  }

  // Initialize accordions on page load

  initAccordions();
});
