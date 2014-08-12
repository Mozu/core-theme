# Mozu Core Theme

Core theme for Mozu. A good starting point, if a bit grayish.

## Upgrading from Core4 to Core5

The Mozu R5 release includes an upgraded Core theme called **Core5**. It includes bugfixes, visual adjustments, changes to JavaScript module structure, and a couple of great new features! You'll have to manually upgrade themes that extend the Core4 theme to use Core5 instead. Here's how it works in three steps:

1. Read the [release notes](release_notes.md) for Core5 to see what's changed!

2. Change the `extends` property in your `theme.json` from this:
   ```json
    "extends": "Core4",
   ```
   to this:
   ```json
    "extends": "Core5",
   ```

3. Upload and view your theme in your development sandbox. Make any necessary changes to adapt your overrides to Core5's new code!

Clearly, step 3 will be the big one. This should be relatively painless if you have not overridden a great deal of Core JavaScript files, and even if you have, there is a clear path to integrating the changes. This document will break down the process in more detail below.

### Why are we doing it this way?

Until now, the updates to Core4 have mostly been hotfixes, and we've updated Core4 in place. The inheritance model of Mozu themes has allowed these bugfixes and hotfixes to flow through into themes developed by clients and partners. Even though those changes were minor, it still caused occasional problems in live sites because of unexpectedly updating theme code. The upcoming changes to the Mozu core theme are *breaking changes* and in order to preserve your live site's functionality, you should be able to *opt in* to them. If you don't update your theme to say it extends Core5, you won't have to adapt your prior work to Core5's breaking changes yet, but you also won't get new features from the Core theme without updating your theme to be compatible with Core5.

### What's breaking?

The [release notes](release_notes.md) contain a good summary of the changes in Core5. Most commonly, **your JavaScript modules will break if they reference Core4 vendored scripts like Underscore or Backbone**. If you've overridden `scripts/modules/models-product.js`, for instance, and left its first line (the `define` call and the array of dependencies) more or less intact, then you'll get a script error on `'shim!vendor/underscore>_'` and will need to replace it with the string `'underscore'`. Here, in our estimation, is the list of other significant changes, in order of the likelihood that you'll need to make them.

* **storefront.less**: New features, like digital fulfillment, require new Less modules. You'll need to merge Core5's version of `stylesheets/storefront.less` with your own, which you have doubtless changed.

* **Vendored Libraries**: You will need to change all your references to our vendored libraries, including Underscore, Backbone, and the Bootstrap JavaScript plugins.
  * `shim!vendor/underscore>_` should become `underscore`
  * `shim!vendor/backbone[jquery=jQuery,shim!vendor/underscore>_]>Backbone` should become `backbone`
  * `shim!vendor/bootstrap-popover[jquery=jQuery]` should become `shim!vendor/boostrap/popover[shim!vendor/bootstrap/tooltip[jquery=jQuery]>jQuery=jQuery]>jQuery`

* **Paged Collections**: The following JavaScript files used to use the paging mixin (`scripts/modules/mixin-paging`) and now use the `Backbone.MozuPagedCollection`. If you have overridden these files, consider merging your changes with Core5's new version:
  * `scripts/modules/models-order`,
  * `scripts/modules/models-product`,
  * `scripts/modules/models-faceting`

### What's new?

Apart from the enhancements mentioned above and numerous bugfixes, Core5 includes a great new checkout UI for gift cards, support for digital downloads as a fulfillment type, a sorting UI for category and search pages, builtin support for and examples of our powerful new CMS features for documents and entities, and a high-performing, deeply customizable typeahead engine for searching.

* **Checkout UI**: If you have not extensively customized your checkout flow by overriding and changing `templates/modules/checkout/step-payment-info.hypr.live` or `scripts/modules/models-checkout.js` then these changes might integrate painlessly into your theme. Otherwise, you will have to do the work of merging your enhancements with the Core thenme.

* **Digital Downloads** If you have not extensively customized your product configuration flow by overriding and changing `templates/modules/product/product-detail.hypr.live` or `scripts/modules/models-product.js`, then these changes might also integrate painlessly. Otherwise you will have to merge them.

* **Sorting UI**: New files have been added: `templates/modules/common/page-sort.hypr.live` and `stylesheets/modules/common/page-sort.less`. Integrate the former into your paged collections views such as `faceted-products.hypr` if you've overridden it, and integrate the latter into your `stylesheets/storefront.less` file--then override it as necessary for your visual purposes.

* **CMS Enhancements**: Read the release notes and explore the new configuration options in Core5's `theme.json` file.

* **Typeahead**: The `templates/modules/page-header/search-box.hypr` template and the `stylesheets/modules/page-header/search-box.less` files have been modified and new files have been added: 
  *  `scripts/vendor/typeahead.js/typeahead.bundle.js`, a third-party typeahead library
  *  `scripts/modules/search-autocomplete.js`, our implementation of typeahead
  *  `templates/modules/search/autocomplete-page-result.hypr.live`, our general HyprLive template for a suggestion result
  *  `templates/modules/search/autocomplete-listing-product.hypr.live`, our template for a product result
Integrate this library by observing how it was added to the `search-box.hypr` file in Core5 and reimplement it using that pattern.

### What does it really look like to upgrade?

Ultimately the bulk of the upgrade process will be user acceptance testing. Many themes will work just fine, and others may have less-than-obvious regressions. Automated unit and end-to-end testing may be of use here, but in lieu of that, the process looks like this:

1. If you aren't using source control that allows you to rewind changes, make a backup copy of your theme before proceeding. If you are using source control, we suggest making a branch of your theme.

2. Download [the Mozu Base Blank Theme](https://github.com/Mozu/base-blank-theme) from GitHub. Unzip it into a new directory.

3. Open a command prompt in your theme directory and enter:

      node configure.js

   This command will install the necessary dependencies for you to use build tools, and will download the latest version of both branches of the Core theme (Core4 and Core5) into your `references` directory.

4. As in the shorter steps above, change the `extends` property in your `theme.json` from this:
   ```json
    "extends": "Core4",
   ```
   to this:
   ```json
    "extends": "Core5",
   ```
5. Make the suggested changes from this document, including the upgrading of vendored script references, storefront.less updates, and paged collection compatibility.

6. Install your new Core5-based theme on a development sandbox and activate it.

7. Activate Debug Mode in the storefront by adding the query parameter `debugMode=true` to any storefront URL.

7. Visually examine your theme for problems. Then, do a battery of tests; view a category, search for products, configure a product, manipulate the cart, check out and place an order, make changes to your account page.

8. Make any necessary corrections based on visual errors or console errors.

9. Repeat steps 7 and 8 until your theme is free from errors and regressions!