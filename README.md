# Upgraded Mozu Core Theme

This release includes an upgraded Core theme called **Core8**.

## What's New

* A new Express Checkout workflow for quick checkouts
   - A new Default Payment setting for shoppers to enable Express Checkout
   - A new optimized Checkout workflow
* Anonymous order status checkout
* A new Theme Utility Bar for business users to view the store under different conditions
   - Future Date Preview so that you can view the future state of your content that has an Active Date Range
* A brand new SEO-friendly system for navigating categories and search results
   - A new `{% make_url %}` tag for creating crawlable URLs for every page state
   - Crawlable pagination links, sorting links, and faceting controls so that Web crawlers can understand more about your product catalog
   - Efficient, mobile-friendly HTML partial system on category and search pages
* A dynamic set of "reasons" for online RMAs, replacing the hardcoded set of reasons
* Numerous bugfixes
* Other enhancements listed in [Mozu Release Notes](http://developer.mozu.com/sites/default/files/feeds/learn/article_files/MozuQ22015ReleaseNotes.pdf).

## Upgrading to Mozu Core Theme Version 8

You must manually upgrade themes that extend Core4, Core5, Core6, and Core7 to use Core8 instead. We recommend user acceptance, automated unit, and end-to-end testing of your site to ensure Core8 works for your site.

Use the new [Mozu Theme Generator](http://npmjs.com/package/generator-mozu-theme) to create new themes **and to update existing themes!**

0. Examine the [merged Pull Requests](pulls?q=is%3Apr+is%3Aclosed) to see what individual features are coming over from Core.

0. Use the `yo mozu-theme` command to update your theme to inherit from Core8.

0. Once the generator is complete, you'll have a `references/core8` directory!

0. Merge the Core8 version of commonly overridden files, such as `stylesheets/storefront.less` and the outer Hypr templates.

0. Install your new Core8-based theme on a development sandbox and activate it.

0. Activate Debug Mode in the storefront by adding the query parameter `debugMode=true` to any storefront URL.

0. Visually examine your theme for problems. 

0. Test your site for issues: view a category, search for products, configure a product, manipulate the cart, check out and place an order, make changes to your account page, etc.

0. Make any necessary corrections based on visual errors or console errors.

0. Repeat the previous two steps until your theme is free from errors and regressions.
