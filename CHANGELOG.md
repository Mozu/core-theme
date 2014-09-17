Core5 Changelog
===============

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
