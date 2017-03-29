# What's New

### March 29, 2017
The following updates were added to the My Account page to improve the RMA experience for shoppers. - [Pull Request](https://github.com/Mozu/core-theme/pull/45)

* Shoppers can now return multiple items on an order within the same RMA.
* Order history now displays by product item rather than by order item. For example, if a shopper orders a bundle, each bundle item displays in the order history, rather than the entire bundle showing as one entry.
* Product items are now grouped by fulfillment status. Unfulfilled items display under a *Shipping Soon* section, while fulfilled items display alongside their corresponding fulfillment unit (for example, a package).
* Return history now displays child items (for example, product extras under a parent product or bundle items within a bundle).

### January 12, 2017
* Added a Print dialog window accessible from the My Account page that enables shoppers to print RMA shipping labels - [Pull Request](https://github.com/Mozu/core-theme/pull/41)

### July 7, 2016
* Added support for purchase order as a payment method - [Pull Request](https://github.com/Mozu/core-theme/pull/37)
* Added support for volume pricing - [Pull Request](https://github.com/Mozu/core-theme/pull/39)

### May 5, 2016
* Create links that open in new windows - [Pull Request](https://github.com/Mozu/core-theme/pull/34)

### April 29, 2016
* Price List
   - Added preview of price lists in the staging environment.
   - Added capability to message customers who are eligible for special pricing.
   - See the following files in [merge commit ab38b1a2559b5a993347d7ff4300cfab86fc4003](/core-theme/commit/ab38b1a2559b5a993347d7ff4300cfab86fc4003?diff=split)
     - labels/en-US.json
     - scripts/modules/theme-utility-bar.js
     - stylesheets/modules/theme-utility-bar/header.less
     - templates/modules/common/message-bar.hypr.live
     - templates/modules/utility-bar/header.hypr
* Fixed variant pricing
   - Supports explicit list and sale price for configurable product variants, in addition to the current delta pricing, on the Product Details page.
   - See the following file in [merge commit ab38b1a2559b5a993347d7ff4300cfab86fc4003](/core-theme/commit/ab38b1a2559b5a993347d7ff4300cfab86fc4003?diff=split)
        - scripts/modules/backbone-mozu-model.js


### January 18, 2016

* Significant usability enhancements to the cart and checkout workflow:
   - Edit a saved shipping address during checkout.
   - Simplified removal of digital wallet payment information.
   - Applied shipping method now shows full list of shipping options.
* Upgraded PayPal Express payment experience, with support for separate authorization and capture:
   - Removed the old version of PayPal Express support from the Core Theme.
   - Forked a new theme with support for the new PayPal Express Certified Mozu Application.
   - With the new theme inheritance system, adding PayPal Express support should be as easy as adding a Git remote to the [PayPal Express theme](https://github.com/Mozu/PayPalExpress-Theme) and merging it.
* Improvements to the theme creation and upgrade process:
   - We've officially deprecated the `extends` directive in `theme.json`. It will continue to work, but rather than using runtime resolution of your base theme's assets, you can now use Git to inherit directly from the base theme.

     This has many advantages:
     - Better stability in production.
     - Much easier development workflow--no more "overrides" and maintaining a references directory!
     - Much easier merging in of Core Theme upgrades--you can use Git's existing, famously robust merge tools!
   - To support this new workflow, we've overhauled the Yeoman generator for Mozu themes. **This is the recommended method for creating and upgrading Mozu themes.**
     - Install the new theme generator with `npm install -g yo generator-mozu-theme`
     - Run it with `yo mozu-theme`
     - Run it in an empty directory to create a new theme, or an existing theme directory to **upgrade the existing theme in-place to use the new inheritance system!**
* Improvements to the build process:
   - We have removed use of the Bower frontend package manager from the Core theme. The much larger and faster NPM package manager, already in use for build tool dependencies, is now used for frontend dependencies as well. There is a simple script in the Gruntfile which copies dependencies into the `scripts/vendor` directory that Bower used to maintain.
* Numerous bugfixes.


### Upgrading to the Mozu Core 9 Theme

Core 9 is the latest version of the Mozu Core theme. It was introduced with the Mozu November 2015 Service Update.

**Note:** The Base Blank theme has been deprecated. You should use the Mozu Core theme instead.

### Theme Upgrade Requirements

The following table shows you which features from the Mozu November 2015 Service Update require a theme upgrade. If you choose not to upgrade to a specified theme, you must manually integrate feature updates into your existing theme. The table also provides links to the Mozu Github repository where we explain what we’ve changed for these new features. Click the file diff links to see the code we updated. To review the differences between Core 8 and Core 9, view the theme comparison [here](https://github.com/Mozu/core-theme/compare/core8...master).

| FEATURE	| REQUIRED THEME | FILE DIFF |
| :-------|:---------------|:----------|
| Discount and Coupon Messaging | [Core 9](https://github.com/Mozu/core-theme) | [https://github.com/Mozu/core-theme/pull/25/files](https://github.com/Mozu/core-theme/pull/25/files) |
| Express Checkout Usability Improvements | [Core 9](https://github.com/Mozu/core-theme) | [https://github.com/Mozu/core-theme/pull/26/files](https://github.com/Mozu/core-theme/pull/26/files) |
| PayPal Express Application by Mozu	| [PayPal Express](https://github.com/Mozu/PayPalExpress-Theme) | N/A |

### How to Upgrade Your Theme
You can use the [Mozu Theme Generator](https://www.npmjs.com/package/generator-mozu-theme) to update an existing theme to include changes in this version. You can also run the generator in an empty directory to clone these files as the basis for a brand new theme. 

When you run the Mozu Theme Generator, the tools create a git remote to the Mozu [core-theme](https://github.com/Mozu/core-theme/tree/master) repository. In the future, if you run the generator from your local theme directory, the tool will automatically check the Mozu Core theme for updates and offer to merge them for you.

