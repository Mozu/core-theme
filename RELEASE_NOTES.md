
# Core5

The Mozu Core5 theme is an incremental update to the Core4 theme. Here are the new features and updates in the Core5 theme.

### Upgrade Instructions

The [Core Theme Readme](README.md) includes instructions on how to upgrade from Core4 to Core5. These updates are breaking changes. In order to preserve your live site’s functionality, upgrading to Core5 is optional. If you don’t update your theme, you can skip adapting your prior work to the new theme’s breaking changes; however, you cannot get the new features without updating your site to be compatible to Core5.

### Extending the Core5 Theme

To extend the Core5 theme, you can use the [base-blank-theme](https://github.com/mozu/base-blank-theme).

## New Features

### Paginated Lists

#### Sorting

Core5 supports sorting in paginated lists of products and items.

*   The `templates/modules/product/faceted-products.hypr` file and corresponding Less file `stylesheets/layouts/l-paginatedlist.less` have changed. Instead of only `paging-controls` above the product list, this template now has header and footer submodules. The footer still contains only `page-numbers`. The header now contains `page-numbers`, `paging-controls`, and `page-sort`. 

*   The `templates/modules/common/page-sort.hypr.live` template is new. This template contains only a label and a dropdown for page sorts. The dropdown populates out of a `sorts` property present on the model:
    ```
    {% block sort-types %}
        {% for sort in model.sorts %}
            <option value="{{ sort.value }}"{% if model.currentSort == sort.value %} selected="selected"{% endif %}>{{  sort.text }}</option>
        {% endfor %}
    {% endblock sort-types %}
    ```

*   The storefront product collection model now contains a `sorts` array, which is used in the `page-sort` template. The storefront controllers initially populate the `sorts` array and then the JavaScript model in `models-product` maintains it.

*   If you do not specify a sort, the `model.currentSort` parameter is blank (in Search Results, this equates to a relevance-based sort). Otherwise, this parameter contains the value of the last sort.

### Typeahead

Core5 now has a rich search-suggestion engine that appears as a typeahead prompt on the Search box in the page header. The open-source [typeahead.js](http://twitter.github.io/typeahead.js/) library powers the engine. This search engine shows *simple results*, which are simple search term suggestions, and *complex results*, which are currently products, but could in the future be more types of Mozu documents or object, such as categories or CMS pages. There are two theme settings which govern its effect:

* `useSearchAutocomplete`: Turn the autocomplete feature on or off. `true` by default.
* `searchExpandOnFocus`: Widen the search field when it is focused. `true` by default. **Setting this to `false` when `useSearchAutocomplete` is `true` is not recommended.**

The `templates/modules/search-box.hypr` template has changed. The markup has changed minimally to accommodate new JavaScript (i.e., the addition of a data attribute for script targeting), and a `require_script` tag has been added for the new `search-autocomplete.js` script.

There is a new file, `scripts/modules/search-autocomplete.js`, which implements the typeahead library. Override this file to modify details about the autocomplete implementation.

There are also two new Hypr templates, used in `search-autocomplete.js` to render the autocomplete UI: 

*  `templates/modules/search/autocomplete-page-result.hypr.live` is the outer wrapper for each complex result
*  `templates/modules/search/autocomplete-listing-product.hypr.live` is the inner template for complex results of type "product" (currently the only type)

### Gift Cards

**Core4** supported store credits in checkout. In **Core5**, support now includes purchasing digital gift cards and payment with gift cards. When purchasing a digital gift card, Mozu requires an email address to fulfill the order. Mozu refers to this as a *Digital Fulfillment*.

**Purchase Gift Card**

---

![Purchase Gift Card](https://cloud.githubusercontent.com/assets/1643758/3913570/d8ecf1bc-2337-11e4-9416-539cee2a1a3a.png)

The shopper can enter the gift card's redemption code during checkout, or if applicable, they will be able to choose from previously added gift cards to their account. We refer to this as payment with *Digital Credit*.  

**Payment with Gift Card**

---

![Pay with gift card](https://cloud.githubusercontent.com/assets/1643758/3913569/d8ec7836-2337-11e4-95b2-17f34cc5aaec.png)


The following new Hypr files and JavaScript methods enable gift card purchase and payment.
    
**New `checkout-digital-credit` and `checkout-digital-fulfillment` Hypr files**    

---

![Gift Card Hypr files (yUml.me)](https://cloud.githubusercontent.com/assets/1643758/3913567/d8e8b25a-2337-11e4-824c-d3a9d7490b15.png)


**New Digital Credit and Fulfillment Methods in `models-checkout.js`**   

---

![Gift Card models-checkout.js (yUml.me)](https://cloud.githubusercontent.com/assets/1643758/3913571/d8ef69a6-2337-11e4-97a9-7d5aec76c533.png)


**New DigitalCredit in `models-paymentmethods.js`**    

---

![Payment Methods (yUml.me)](https://cloud.githubusercontent.com/assets/1643758/3913568/d8e9d522-2337-11e4-8ab6-630ed7d94f21.png)


**Supplemented Mozu Storefront SDK for Order to recognize GiftCard payments and for Customer to retrieve saved gift cards**
  
---

![Mozu SDK Changes (yUml.me)](https://cloud.githubusercontent.com/assets/1643758/3913572/d8f9a614-2337-11e4-9cd3-e67cd52bbda9.png)


**New Gift Card email template for purchase of digital gift cards**
  
---

![Mozu Gift Card Email Template (yUml.me)](https://cloud.githubusercontent.com/assets/1643758/3913566/d8e858b4-2337-11e4-8cb9-a2f9e09adc60.png)

## Changes

### Paginated Lists

#### Backbone.MozuPagedCollection

Core4's paging mixin has been replaced with a base `Backbone.MozuModel` extension called `Backbone.MozuPagedCollection`. Instead of having to use `$.extend` or `_.extend` to add the paging mixin to your models, you can now simply extend `Backbone.MozuPagedCollection`. The `FacetingModels.FacetedProductCollection`, `OrderModels.OrderCollection`, and other collections are all extensions of this model. It is defined in `scripts/modules/backbone-mozu-pagedcollection` and packaged into the dependency `modules/backbone-mozu`. It closely matches the consistent shape of collections that the Mozu APIs provide; they have an `items` array and a few informational paging parameters. 

A `Backbone.MozuPagedCollection` maintains some internal state in the form of a `lastRequest` instance property. In order to paginate and sort consistently, the collection builds server requests based on the values of the last request it made, stored in the `lastRequest` property. Modifying this property will change the next server operation the collection performs.

To support these new integrated collections, there is a new view factory module in `scripts/modules/views-collections`. That module has a factory function, `createFacetedCollectionViews`, which accepts a configuration object consisting of:

* `data`: a JSON object that will be turned into the underlying `FacetingModels.FacetedProductCollection`
* `$body`: a jQuery object containing one DOM element for the outer container of the paged collection view, encompassing the product list and the paging views (marked up with data-mz-pagingcontrols, data-mz-pagenumbers, and data-mz-pagesort attributes)
* `$facets`: an optional jQuery object containing one DOM element for the facet panel if one should exist

You can see this new factory function in action in the new `scripts/pages/category` and `scripts/pages/search` files.

### models-checkout.js

Updates to `models-checkout.js` fixed issues with saving new contacts to the customer account. `models-checkout.js` also includes new methods in the `CheckoutPage` model.

![Saving contacts in models-checkout.js (yUml.me)](https://cloud.githubusercontent.com/assets/1643758/3913565/d8e37cb8-2337-11e4-9a89-5974d044572b.png)



### Upgraded Vendored Libraries

Core5 has upgraded its references to third-party libraries, such as jQuery, Backbone, Underscore, and others.

* Instead of manually copying libraries into the `scripts/vendor` directory, Core5 now uses the [Bower frontend package manager](http://bower.io) in conjunction with the existing Grunt build process. The versions of these libraries required by Core5 are now specified in the `bower.json` file, and are automatically installed by the `grunt-bower-task`. **This changes all of the references to these libraries in other JavaScript modules!**

* The Core5 version of jQuery is now 1.11. According to the jQuery release notes, this should have no affect on downstream code.

* The Core5 version of Backbone is now 1.1.2. According to the [Backbone release notes](http://backbonejs.org/#upgrading), there is a small number of breaking changes which we have adapted to in our downstream code. **The backbone module is now defined in the `paths` collection in `require.config` in the `templates/modules/trailing-scripts.hypr` file, so all dependencies on `vendor/backbone` can change to `backbone`.** However, it is unlikely that your theme is directly dependent on `backbone`; it's far more likely that your theme depends on the augmented `modules/backbone-mozu` module, which will stay in the same place.

* The Core5 version of Underscore is now 1.6.0. According to the [Underscore release notes](http://underscorejs.org/#changelog), there are no breaking changes. **The underscore module is now defined in the `paths` collection in `require.config` in the `templates/modules/trailing-scripts.hypr` file, so all dependencies on `shim!vendor/underscore>_` can change to `underscore`.** Since Backbone and Underscore now both natively support AMD, they no longer need Mozu-Require's `shim!` plugin.

* The Core5 version of Modernizr is now a custom build of Modernizr 2.8.3. It no longer includes Respond.js bundled. If your theme uses Modernizr extensively and needs to use more Modernizr features than our slim custom build, you can replace this with your own. Some bugs (including a bug that displayed blank pages in Google Cache) should be fixed.

### Modified Build Process

The Core5 build process includes the Bower package manager and its dependencies. As a result, the Core5 dependency graph has enlarged and now poses some problems on Windows. The NTFS file system used by Windows has a 260-character limit for file paths, and some of the Node dependencies violate that limit. We've tried to mitigate this by adding named dependencies in the `package.json` file to flatten out the NPM dependency graph. Inside `package.json` there is a block of dependencies not directly used by the Core5 build tools. This stack of dependencies is not directly used by the Core5 theme; they are named only to trace and flatten the especially deep dependencies required by some of the other NPM modules. If you're building on a Mac, you can remove those dependencies. In the future, Mozu might remove these dependencies if the Bower dependency graph gets more manageable.
