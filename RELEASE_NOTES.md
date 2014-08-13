# Core5

The Mozu Core5 theme is an incremental update to the Core4 theme. In a future release, Mozu theming will support a more dynamic and feature-rich versioning system, but for the time being, even the minor changes included in Core5 necessitate a full release. Here is a short summary of the changes between Core4 and Core5, followed by a short description of the upgrade process.

## New Features

### Paginated Lists

#### Sorting

Core5 supports sorting in paginated lists of products and items. In Core4, the Category and Search Results page had only pagination controls, for navigating between pages and setting the page size. Core5 now includes sorting.

* The `templates/modules/product/faceted-products.hypr` file has changed. Instead of only `paging-controls` above the product list, it now has `header` and `footer` submodules. The `footer` still contains only `page-numbers`. The `header` now contains `page-numbers`, `paging-controls`, and `page-sort`. The corresponding Less file `stylesheets/layouts/l-paginatedlist.less` has also changed.

* The `templates/modules/common/page-sort.hypr.live` template has been added. This contains only a label and a dropdown for page sorts. The dropdown populated itself out of a `sorts` property present on the model:
      
        {% block sort-types %}
        {% for sort in model.sorts %}
          <option value="{{ sort.value }}"{% if model.currentSort == sort.value %} selected="selected"{% endif %}>{{  sort.text }}</option>
        {% endfor %}
        {% endblock sort-types %}

* The storefront product collection model now contains a `sorts` array, which is used in the `page-sort` template. The `sorts` array is initially populated by the storefront controllers, and then maintained by the JavaScript model in `models-product`.
  
* The `model.currentSort` parameter will be blank if no sort has been specified (in Search Results, this equates to a relevance-based sort). Otherwise, it will contain the value of the last sort. 

### Autocomplete

Core5 now has a rich search-suggestion engine that appears as a typeahead prompt on the Search box in the page header. The engine is powered by the open-source [typeahead.js](http://twitter.github.io/typeahead.js/) library. It shows *simple results*, which are just search terms, and *complex results*, which are currently just products, but could in the future be more types of Mozu document or object, such as categories or CMS pages. There are two theme settings which govern its effect:

* `useSearchAutocomplete`: Turn the autocomplete feature on or off. `true` by default.
* `searchExpandOnFocus`: Widen the search field when it is focused. `true` by default. **Setting this to `false` when `useSearchAutocomplete` is `true` is not recommended.**

The `templates/modules/search-box.hypr` template has changed. The markup has changed minimally to accommodate new JavaScript (mostly the addition of a data attribute for script targeting), and a `require_script` tag has been added for the new `search-autocomplete.js` script.

There is a new file, `scripts/modules/search-autocomplete.js`, which implements the typeahead library. Override this file to modify details about the autocomplete implementation.

There are also two new Hypr templates, used in `search-autocomplete.js` to render the autocomplete UI: 

*  `templates/modules/search/autocomplete-page-result.hypr.live` is the outer wrapper for each complex result
*  `templates/modules/search/autocomplete-listing-product.hypr.live` is the inner template for complex results of type "product" (currently the only type)

### Gift Cards

**Core4** supported store credits in checkout.  In **Core5** we are expanding support to include purchasing digital gift cards and payment with gift cards.  When purchasing a digital gift card, Mozu will require an email address to fulfill the order.  We refer to this as *Digital Fulfillment*.  

**Purchase Gift Card**

---

![Purchase Gift Card](https://cloud.githubusercontent.com/assets/1643758/3913570/d8ecf1bc-2337-11e4-9416-539cee2a1a3a.png)

The shopper can enter the gift card's redemption code during checkout or if applicable they will be able to choose from previously added gift cards to their account.  We refer to this as payment with *Digital Credit*.  

**Payment with Gift Card**

---

![Pay with gift card](https://cloud.githubusercontent.com/assets/1643758/3913569/d8ec7836-2337-11e4-95b2-17f34cc5aaec.png)


We added the following Hypr files and JavaScript methods to enable gift card purchase and payment.
    
**Added checkout-digital-credit and checkout-digital-fulfillment Hypr files**    

---

![Gift Card Hypr files (yUml.me)](https://cloud.githubusercontent.com/assets/1643758/3913567/d8e8b25a-2337-11e4-824c-d3a9d7490b15.png)


**Added Digital Credit and Fulfillment Methods to models-checkout.js**   

---

![Gift Card models-checkout.js (yUml.me)](https://cloud.githubusercontent.com/assets/1643758/3913571/d8ef69a6-2337-11e4-97a9-7d5aec76c533.png)


**Added DigitalCredit to PaymentMethods**    

---

![Payment Methods (yUml.me)](https://cloud.githubusercontent.com/assets/1643758/3913568/d8e9d522-2337-11e4-8ab6-630ed7d94f21.png)


**Supplemented Mozu SDK for Order to recognize GiftCard payments and for Customer to retrieve saved gift cards**
  
---

![Mozu SDK Changes (yUml.me)](https://cloud.githubusercontent.com/assets/1643758/3913572/d8f9a614-2337-11e4-9cd3-e67cd52bbda9.png)


**Added new Gift Card email template for purchase of digital gift cards**
  
---

![Mozu Gift Card Email Template (yUml.me)](https://cloud.githubusercontent.com/assets/1643758/3913566/d8e858b4-2337-11e4-8cb9-a2f9e09adc60.png)

## Changes

### Paginated Lists

#### Backbone.MozuPagedCollection

Core4's paging mixin has been replaced with a base `Backbone.MozuModel` extension called `Backbone.MozuPagedCollection`. Instead of having to use `$.extend` or `_.extend` to add the paging mixin to your models, you can now simply extend `Backbone.MozuPagedCollection`. The `FacetingModels.FacetedProductCollection`, `OrderModels.OrderCollection`, and other collections are all extensions of this model. It is defined in `scripts/modules/backbone-mozu-pagedcollection` and packaged into the dependency `modules/backbone-mozu`. It closely matches the consistent shape of collections that the Mozu APIs provide; they have an `items` array and a few informational paging parameters. 

Backbone.MozuPagedCollections maintain some internal state in the form of a `lastRequest` instance property. In order to paginate and sort consistently, the collections build server requests based on the values of the last request they made, stored in the `lastRequest` property. Modifying this property will change the next server operation the collection performs.

To support these new integrated collections, there is a new view factory module in `scripts/modules/views-collections`. That module has a factory function `createFacetedCollectionViews` which accepts a configuration object consisting of:

* `data`: a JSON object that will be turned into the underlying `FacetingModels.FacetedProductCollection`
* `$body`: a jQuery object containing one DOM element for the outer container of the paged collection view, encompassing the product list and the paging views (marked up with data-mz-pagingcontrols, data-mz-pagenumbers, and data-mz-pagesort attributes)
* `$facets`: an optional jQuery object containing one DOM element for the facet panel if one should exist

You can see this new factory function in action in the new, slimmed-down `scripts/pages/category` and `scripts/pages/search` files.

### models-checkout.js

Fixed saving new contacts to customer account.  Added new methods to the CheckoutPage in models-checkout.js.

![Saving contacts in models-checkout.js (yUml.me)](https://cloud.githubusercontent.com/assets/1643758/3913565/d8e37cb8-2337-11e4-9a89-5974d044572b.png)



### Upgraded Vendored Libraries

Core5 has upgraded its references to third-party libraries, like jQuery, Backbone, Underscore, and others.

* Instead of manually copying libraries into the `scripts/vendor` directory, Core5 now uses the [Bower frontend package manager](http://bower.io) in conjunction with the existing Grunt build process. The versions of these libraries required by Core5 are now specified in the `bower.json` file, and are automatically installed by the `grunt-bower-task`. **This changes all of the references to these libraries in other JavaScript modules!**

* Core5's version of jQuery is now 1.11. According to the jQuery release notes, this should have no affect on downstream code.

* Core5's version of Backbone is now 1.1.2. According to the [Backbone release notes](http://backbonejs.org/#upgrading), there is a small number of breaking changes which we have adapted to in our downstream code. **The backbone module is now defined in the `paths` collection in `require.config` in the `templates/modules/trailing-scripts.hypr` file, so all dependencies on `vendor/backbone` can change to `backbone`.** However, it is unlikely that your theme is directly dependent on `backbone`; it's far more likely that your theme depends on the augmented `modules/backbone-mozu` module, which will stay in the same place.

* Core5's version of Underscore is now 1.6.0. According to the [Underscore release notes](http://underscorejs.org/#changelog), there are no breaking changes. **The underscore module is now defined in the `paths` collection in `require.config` in the `templates/modules/trailing-scripts.hypr` file, so all dependencies on `shim!vendor/underscore>_` can change to `underscore`.** Since Backbone and Underscore now both natively support AMD, they no longer need Mozu-Require's `shim!` plugin.

* Core5's version of Modernizr is now a custom build of Modernizr 2.8.3. It no longer includes Respond.js bundled. If your theme uses Modernizr extensively and needs to use more Modernizr features than our slim custom build, you can replace this with your own. Some bugs (including a bug that displayed blank pages in Google Cache) should be fixed.

### Modified Build Process

As mentioned above, Core5's build process has been augmented to include the Bower package manager and vendored libraries. As a result, its dependency graph has enlarged and now poses some problems on Windows. The NTFS file system used by Windows has a 260-character limit for file paths, and some of the Node dependencies violate that limit. We've tried to mitigate this by adding named dependencies in the `package.json` file to flatten out the NPM dependency graph. Inside `package.json` there is a block of dependencies separated on either side by several blank lines. This stack of dependencies are not directly used by the Core5 theme; they are named only to trace and flatten the especially deep dependencies required by some of the other NPM modules. If you're building on a Mac, you can remove those dependencies. In the future, they may be removed if the Bower dependency graph gets more manageable.
