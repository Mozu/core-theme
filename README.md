# Upgraded Mozu Core Theme

This release includes an upgraded Core theme called **Core5**.

## What's New

* New checkout UI for gift cards
* New sorting UI for category and search pages
* Support for digital downloads as a fulfillment type
* Typeahead engine for searching
* CMS Enhancements

Refer to the [release notes](RELEASE_NOTES.md) for more information about the new features.

## Breaking Changes

The changes to the Mozu core theme include the following updates:

*  Updates to storefront.less
*  Updates to vendor libraries
*  Paginated list model changes

These updates are breaking changes. In order to preserve your live site's functionality, upgrading to Core5 is optional. If you don't update your theme, you can skip adapting your prior work to the new theme's breaking changes; however, you cannot get the new features without updating your site to be compatible with Core5. 

## Upgrading to Mozu Core THeme Version 5

You must manually upgrade themes that extend Core4 to use Core5 instead. We recommend user acceptance, automated unit, and end-to-end testing of your site to ensure Core5 works for your site.

1.   Download [Core5](releases) from GitHub.
2.   If you aren't using source control that allows you to rewind changes, make a backup copy of your theme before proceeding. If you are using source control, we suggest making a branch of your theme.
3.  Unzip your download and copy it to your theme's `references` directory alongside Core4.

    You should have two directories now in `references`: `references/core4` and `references/core5`. Because the themes sit side by side with each other, you can easily diff the two themes and reference previous work you've done in Core4.
4.  Change the `extends` property in your `theme.json` from this:
   ```
   "extends": "core4",
   ```
   to this:
   ```
   "extends": "Core5",
   ```

5.  Merge the Core5 version of `stylesheets/storefront.less` with your site's version.

6.  Update all references to vendor libraries, including underscore, Backbone, and the Bootstrap JavaScript plugins. For example,

    * `shim!vendor/underscore>_` should become `underscore`
    * `shim!vendor/backbone[jquery=jQuery,shim!vendor/underscore>_]>Backbone` should become `backbone`
    * `shim!vendor/bootstrap-popover[jquery=jQuery]` should become `shim!vendor/boostrap/popover[shim!vendor/bootstrap/tooltip[jquery=jQuery]>jQuery=jQuery]>jQuery`

7.  Update any instances of `scripts/modules/mixin-paging` with `Backbone.MozuPagedCollection`. If you have overridden these files, consider merging your changes with Core5's new version:

    *  `scripts/modules/models-order`
    *  `scripts/modules/models-product`
    *  `scripts/modules/models-faceting`

8.  Install your new Core5-based theme on a development sandbox and activate it.

9.  Activate Debug Mode in the storefront by adding the query parameter `debugMode=true` to any storefront URL.

10. Visually examine your theme for problems. 

11. Test your site for issues: view a category, search for products, configure a product, manipulate the cart, check out and place an order, make changes to your account page, etc.

12. Make any necessary corrections based on visual errors or console errors.

13. Repeat steps 11 and 12 until your theme is free from errors and regressions.