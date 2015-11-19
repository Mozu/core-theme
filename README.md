# Upgraded Mozu Core Theme

This release includes an upgraded Core theme called **Core9**.

## What's New

* Significant usability enhancements to the cart and checkout workflow
   - Visual changes
   - Sensible UX changes
   - Increased clarity around discount application
* We've upgraded our PayPal Express payment experience and forked it into a new variant of the Core Theme.
   - In doing so, we've removed the older version of PayPal Express support from the Core Theme proper.
   - With the new theme inheritance system, adding PayPal Express should be as easy as attaching a Git remote to the PayPal Express theme and merging it.
* Improvements to the theme creation and upgrade process
   - We've officially deprecated the `extends` directive in `theme.json`. It will continue to work, but rather than using runtime resolution of your base theme's assets, you can now use Git to inherit directly from the base theme. This has many advantages:
     - Better stability in production
     - Much easier development workflow--no more "overrides" and maintaining a references directory!
     - Much easier merging in of Core Theme upgrades--you can use Git's existing, famously robust merge tools!
   - To support this new workflow, we've overhauled the Yeoman generator for Mozu themes. **This is the recommended method for creating and upgrading Mozu themes.**
     - Install it with `npm install -g yo generator-mozu-theme2`
     - Run it with `yo mozu-theme2`
     - Run it in an empty directory to create a new theme, or an existing theme directory to **upgrade the existing theme in-place to use the new inheritance system!**
* Improvements to the build process
   - We have removed use of the Bower frontend package manager from the Core theme. The much larger and faster NPM package manager, already in use for build tool dependencies, is now used for frontend dependencies as well. There is a simple script in the Gruntfile which copies dependencies into the `scripts/vendor` directory that Bower used to maintain.
* Numerous bugfixes
* Other enhancements listed in [Mozu Release Notes](http://developer.mozu.com/sites/default/files/feeds/learn/article_files/MozuQ32015ReleaseNotes.pdf).

## Upgrading to Mozu Core Theme Version 8

You must manually upgrade themes that extend Core4, Core5, Core6, Core7, and Core8 to use Core9 instead. We recommend user acceptance, automated unit, and end-to-end testing of your site to ensure Core9 works for your site.

Use the new [Mozu Theme Generator](http://npmjs.com/package/generator-mozu-theme2) to create new themes **and to update existing themes!**

0. Examine the [merged Pull Requests](pulls?q=is%3Apr+is%3Aclosed+milestone%3Acore9) to see what individual features are coming over from Core.

0. Use the `yo mozu-theme2` command to update your theme to use the new system.

0. Once the generator is complete, you'll have a functioning Git repository that is effectively a "fork" of this one!

0. Your theme will be automatically set to inherit from the last version of the Core theme that it appears to support. You can now upgrade it to use Core9 by simply running `grunt mozutheme:check` to see what versions of Core9 are available, and then merging the appropriate commit. The Grunt task will instruct you in detail.

0. Install your new Core9-based theme on a development sandbox and activate it.

0. Activate Debug Mode in the storefront by adding the query parameter `debugMode=true` to any storefront URL.

0. Visually examine your theme for problems. 

0. Test your site for issues: view a category, search for products, configure a product, manipulate the cart, check out and place an order, make changes to your account page, etc.

0. Make any necessary corrections based on visual errors or console errors.

0. Repeat the last two steps until your theme is free from errors and regressions.
