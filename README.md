# Upgraded Mozu Core Theme

For latest enhancements, see release notes [Release Notes](````RELEASE_NOTES.md).


This release includes an upgraded Core theme called **Core9**.


## Upgrading to Mozu Core Theme Version 9

You must manually upgrade themes that extend Core4, Core5, Core6, Core7, and Core8 to use Core9 instead. We recommend user acceptance, automated unit, and end-to-end testing of your site to ensure Core9 works for your site.

Use the new [Mozu Theme Generator](http://npmjs.com/package/generator-mozu-theme) to create new themes **and to update existing themes!**

0. Examine the [theme comparison](https://github.com/Mozu/core-theme/compare/core8...master) to see changes from Core 8 to Core 9.

0. Use the `yo mozu-theme` command to update your theme to use the new system.

0. Once the generator is complete, you'll have a functioning Git repository that is effectively a "fork" of this one!

0. Your theme will be automatically set to inherit from the last version of the Core theme that it appears to support. You can now upgrade it to use Core9 by simply running `grunt mozutheme:check` to see what versions of Core9 are available, and then merging the appropriate commit. The Grunt task will instruct you in detail.

0. Install your new Core9-based theme on a development sandbox and activate it.

0. Activate Debug Mode in the storefront by adding the query parameter `debugMode=true` to any storefront URL.

0. Visually examine your theme for problems. 

0. Test your site for issues: view a category, search for products, configure a product, manipulate the cart, check out and place an order, make changes to your account page, etc.

0. Make any necessary corrections based on visual errors or console errors.

0. Repeat the last two steps until your theme is free from errors and regressions.
