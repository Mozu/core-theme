# Upgraded Mozu Core Theme

This release includes an upgraded Core theme called **Core7**.

## What's New

* Enhanced widget controls
* Ability to automatically hide empty categories
* Ability to display duty fees
* Ability to display and accept Japanese Credit Bureau (JCB) credit cards
* Ability to store affiliate tracking strings in Cart
* Resolved issues with theme files
* Other enhancements listed in [Mozu Release Notes](http://developer.mozu.com/sites/default/files/feeds/learn/article_files/MozuQ22015ReleaseNotes.pdf).

## Upgrading to Mozu Core Theme Version 7

You must manually upgrade themes that extend Core4, Core5, and  Core6 to use Core7 instead. We recommend user acceptance, automated unit, and end-to-end testing of your site to ensure Core7 works for your site.

1.   If you are using the [Mozu Base Blank Theme](https://github.com/mozu/base-blank-theme), then just run `grunt updatereferences` from the command line and skip to step 5.
2.   Download [Core7](releases) from GitHub.
3.   If you aren't using source control that allows you to rewind changes, make a backup copy of your theme before proceeding. If you are using source control, we suggest making a branch of your theme.
4.  Unzip your download and copy it to your theme's `references` directory alongside Core4, Core5, and Core6.

    You should have four directories now in `references`: `references/core4`, `references/core5`, `references/core6`, and `references/core7`. Because the themes sit side by side with each other, you can easily diff the two themes and reference work you've done in previous versions of Core. However, the differences between Core6 and Core7 are also here: https://github.com/Mozu/core-theme/compare/core6...master
5.  Change the `extends` property in your `theme.json` to this:
   ```
   "extends": "Core7",
   ```

6.  Merge the Core7 version of commonly overridden files, such as `stylesheets/storefront.less` and the outer Hypr templates.

7.  Install your new Core7-based theme on a development sandbox and activate it.

8.  Activate Debug Mode in the storefront by adding the query parameter `debugMode=true` to any storefront URL.

10. Visually examine your theme for problems. 

11. Test your site for issues: view a category, search for products, configure a product, manipulate the cart, check out and place an order, make changes to your account page, etc.

12. Make any necessary corrections based on visual errors or console errors.

13. Repeat steps 11 and 12 until your theme is free from errors and regressions.
