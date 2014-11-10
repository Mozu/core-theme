Core5 Changelog
===============

v5.2.0
------
* Fixed an issue where the image widget lightbox would not take up the whole browser dimensions.
* Removed misleading, unsupported templating strings from email template configuration in `theme.json`.
* Fixed misleading page type IDs in `theme.json`.
* Fixed misplaced comment in `templates/pages/parent-category.hypr`.
* Added performance enhancement (reduced payload size) to the call to `.apiConfigure()` in `scripts/modu
* Fixed a typographic error in `templates/modules/common/credit-card-form.hypr.live` which misrepresente
* Updated thumbnail image to clearly distinguish Core5.
* Added behavior in `scripts/modules/models-checkout.js` to reset the selected shipping method whenever 
* Added alt text support to product, cart and wishlist item images.
* Updated image widget to support maintaining aspect ratios.
* Fixed an issue where search results would sort incorrectly on the second page of results.
* Fixed an issue where navigating through category facets would break the back button.


v5.1.4
------
* Fixed an issue with Firefox back-button-cache by adding a cleanup task on `beforeunload` to `scripts/modules/backbone-mozu-model.js` and `scripts/pages/location.js`.
* Fixed an issue with an error message on the Cart page by removing an unnecessary extra AJAX call in `scripts/modules/models-cart.js`.
* Added some low-level entity editors for reference purposes.

v5.1.3
------
* Fixed an issue in `templates/modules/my-account/my-account-addressbook.hypr.live` and `templates/modules/my-account/my-account-paymentmethods.hypr.live` that prevented some of the "Add new" links from working properly.
* Fixed an issue in `scripts/modules/models-customer.js` that prevented a customer from saving an address when address validation was enabled on the site.
* Fixed a rendering issue and added optimistic UI re-rendering in `scripts/pages/myaccount.js`.
