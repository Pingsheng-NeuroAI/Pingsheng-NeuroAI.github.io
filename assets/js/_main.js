/* ==========================================================================
   Various functions that we want to use within the template
   ========================================================================== */

const systemColorScheme = window.matchMedia("(prefers-color-scheme: dark)");
let themePreference;
try {
  themePreference = localStorage.getItem("theme");
} catch {
  // Storage can be disabled in the browser.
}

function determineComputedTheme() {
  if (themePreference === "dark" || themePreference === "light") {
    return themePreference;
  }
  return systemColorScheme.matches ? "dark" : "light";
}

function setTheme() {
  const dark = determineComputedTheme() === "dark";
  $("html").attr("data-theme", dark ? "dark" : null);
  $("#theme-icon").toggleClass("fa-moon", dark).toggleClass("fa-sun", !dark);
  $("#theme-toggle").attr("aria-pressed", String(dark));
}

function toggleTheme() {
  themePreference = determineComputedTheme() === "dark" ? "light" : "dark";
  setTheme();
  try {
    localStorage.setItem("theme", themePreference);
  } catch {
    // The selected theme still applies to the current page.
  }
}

/* ==========================================================================
   Plotly integration script so that Markdown codeblocks will be rendered
   ========================================================================== */

// Read the Plotly data from the code block, hide it, and render the chart as new node. This allows for the 
// JSON data to be retrieve when the theme is switched. The listener should only be added if the data is 
// actually present on the page.
import { plotlyDarkLayout, plotlyLightLayout } from './theme.js';
let plotlyElements = document.querySelectorAll("pre>code.language-plotly");
if (plotlyElements.length > 0) {
  document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") {
      plotlyElements.forEach((elem) => {
        // Parse the Plotly JSON data and hide it
        var jsonData = JSON.parse(elem.textContent);
        elem.parentElement.classList.add("hidden");

        // Add the Plotly node
        let chartElement = document.createElement("div");
        elem.parentElement.after(chartElement);

        // Set the theme for the plot and render it
        const theme = (determineComputedTheme() === "dark") ? plotlyDarkLayout : plotlyLightLayout;
        if (jsonData.layout) {
          jsonData.layout.template = (jsonData.layout.template) ? { ...theme, ...jsonData.layout.template } : theme;
        } else {
          jsonData.layout = { template: theme };
        }
        Plotly.react(chartElement, jsonData.data, jsonData.layout);
      });
    }
  });
}

/* ==========================================================================
   Actions that should occur when the page has been fully loaded
   ========================================================================== */

$(document).ready(function () {
  // SCSS SETTINGS - These should be the same as the settings in the relevant files 
  const scssLarge = 925;          // pixels, from /_sass/_themes.scss
  const scssMastheadHeight = 70;  // pixels, from the current theme (e.g., /_sass/theme/_default.scss)

  // If the user hasn't chosen a theme, follow the OS preference
  setTheme();
  systemColorScheme.addEventListener("change", setTheme);

  // Enable the theme toggle
  $('#theme-toggle').on('click', toggleTheme);

  // FitVids init
  fitvids();

  // Follow menu drop down
  $(".author__urls-wrapper button").on("click", function () {
    $(".author__urls").fadeToggle("fast", function () { });
    $(".author__urls-wrapper button").toggleClass("open");
  });

  // Restore the follow menu if toggled on a window resize
  jQuery(window).on('resize', function () {
    if ($('.author__urls.social-icons').css('display') == 'none' && $(window).width() >= scssLarge) {
      $(".author__urls").css('display', 'block')
    }
  });

  // Init smooth scroll, this needs to be slightly more than then fixed masthead height
  $("a").smoothScroll({
    offset: -scssMastheadHeight,
    preventDefault: false,
  });

});
