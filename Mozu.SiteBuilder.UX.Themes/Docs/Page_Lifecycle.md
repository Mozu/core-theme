# Mozu Core Theme: *Page Lifecycle*

Mozu makes no compromises between simplicity and spectacular user experience. The Core theme does this with a simple set of patterns that add some of the advantages of rich single-page apps, while retaining the simplicity and SEO-friendliness of plain Web documents.

If you've built a website in a CMS like WordPress, an e-commerce engine like Magento or ZenCart, or (closer to the metal) in an MVC framework like Rails, Django, or Express, then you might be familiar with the classic front-end page lifecycle of such an application.

### The Classic

1. User navigates to a URL, like `/p/clock`.
2. Application retrieves the Clock product from its database.
3. Application renders the product page template against the product object it retrieved.
4. Application delivers the rendered HTML page to the user's browser.
5. User clicks on a link, or fills out a form and clicks a submit button.
6. If user submitted a form, application processes the form data and delivers a response page.

Modern web pages often have AJAX actions, which can change this cycle somewhat:

### The Classic With AJAX

1. User navigates to a URL, like `/p/clock`.
2. Application retrieves the Clock product from its database.
3. Application renders the product page template against the product object it retrieved.
4. Application delivers the rendered HTML page to the user's browser.
5. When the document has loaded, JavaScript runs to subscribe listeners on certain DOM events, like link or button clicks.
5. User clicks on a link or button that causes JavaScript to place an AJAX request.
6. **When the AJAX request completes, JavaScript updates the page with the new data using a DOM manipulation library like jQuery.**

The Mozu core theme mostly adheres to this model, but there is a standard and consistent architecture to how it executes Step 7. Some pages in the Core theme contain complex JavaScript behavior, and as such are really hybrids of a traditional web page and a modern single-page application. They have their own set of Models and Views and their own miniature lifecycle. These pages are:

* Category
* Search Results
* Product Detail
* Store Locator
* Cart
* Checkout
* My Account

These pages respond to user interaction like Web applications, but they're still written in the Hypr template language and customizable by an enterprising theme developer. Their main user workflows are [BackboneJS](http://backbonejs.org) applications. We chose Backbone both for what it is, and what it isn't. Backbone is one of the most popular and stable client-side JavaScript frameworks out there. Its code is readable and battle-tested, and countless implementers have proven that you can build a snappy web application in Backbone. It's also deliberately simple: it offers fewer features than end-to-end app solutions like AngularJS, but it's also easier to extend and customize without creating a giant, unmanageable codebase. Backbone neatly fits the needs of the Core theme: enhancing key areas of a page with application-like functionality while staying more organized than a big pile of jQuery selectors.

We recommend that new, complex workflows be written in Backbone&mdash;especially since we've extended Backbone.Models and Backbone.Views with special Mozu features that add validation, nesting, and connection to Mozu technologies such as the JavaScript SDK and the Hypr template language. Using Backbone.MozuModels, you can create dynamic JavaScript instances of Mozu business objects, that know how to complete common API actions in AJAX with a single method call. Using Backbone.MozuViews, you can enhance a given DOM element on a page&mdash;*most importantly, by re-rendering it with the same Hypr template that was originally used to generate it!* While this is a strong recommendation, and probably the most cost-effective, it's important to note that this is a reference implementation in the Core theme, and not a built-in part of the Mozu storefront So if you feel you must, you can forgo these features and design a theme that doesn't use Backbone.

This is the typical lifecycle of one of the above enhanced pages:

### The Mozu Hypr Live Lifecycle

1.  User navigates to a URL, like `/p/clock`.
2.  Application retrieves the Clock product from its database.
3.  Application renders the product page template against the product object it retrieved.
    The product page template, like all Core templates, builds its inner sections by including module templates with the `{% include %}` tag. These templates will be reused later in JavaScript.
4.  As application builds the product page template, it takes note of all uses of the `{% include_script %}` tag that indicate that a certain JavaScript module is required.
5.  As application builds the product page template, it encounters a `{% preload_json model "product" %}` tag. In place of this tag it renders a JSON representation of the product object (called `model` in Hypr) into a special `<script type="text/json">` tag with the attribute `id="data-mz-preload-product"`. JavaScript will find this JSON and preload it into the JavaScript models, to save an AJAX request.
5.  Application delivers the rendered HTML page to the user's browser.
6.  The rendered HTML page loads the RequireJS library.
7.  The rendered HTML page loads all JS modules that were required by the page, including:
    *   The Mozu JavaScript SDK, for making API requests
    *   The HyprLive library, for retrieving and rendering Hypr templates
    *   The HyprLiveContext object, which contains all available live templates, plus the global template context (such as `siteContext` and `themeSettings`)
    *   The jQuery, Underscore, and Backbone libraries
    *   The Mozu extensions to Backbone.Models and Backbone.Views
    *   The Backbone.MozuModels for Products
    *   The Backbone.MozuViews for the product detail page
    *   Bootstrapping code that will bind views to models and the DOM
8.  When the DOM is ready, the page JavaScript (`product.js`) extracts the JSON preloaded in step 5 with a special Mozu-RequireJS method: `require.mozuData("product");`
9.  The page JavaScript takes the product object created in step 8 and creates a new ProductModel called `productModel`
10. The page JavaScript uses jQuery to retrieve the DOM element of the product detail page
11. The page JavaScript creates a Backbone.MozuView called `productView`, bound to `productModel` created in step 9 and the element created in step 10
12. If necessary, the page JavaScript then re-renders the product view: `productView.render();`
13. Upon its creation, `productView` subscribes to DOM events that would take place in the detail section, like configuring options or adding a product to the cart

### The Event Loop

1. The user takes an action the View is listening for, like configuring an option
2. The View's event listener runs the `productModel.configure();` method
3. The Model asks the SDK to run an AJAX request that will configure the product and view the remaining options
4. When the request returns, `productModel` updates itself with the response from the service and then fires a `sync` event.
5. The View is listening for its Model to `sync`, and responds by running `productView.render();`
6. The HyprLive library retrieves the `/modules/product/product-detail` template and renders it into the DOM element, against the new, updated `productModel` with newly available options

Modifying a page that uses these Backbone.MozuModels and Backbone.MozuViews involves understanding this lifecycle and honoring some of its conventions. You should:

*   Package all your code into a RequireJS module that declares other modules as dependencies
*   Communicate with Mozu business objects using Backbone.MozuModels
*   Handle events and Update the DOM with model changes using Backbone.MozuViews

### Binding HyprLive templates

The HyprLive library allows you to use the same set of templates on the server side and the client side. This is great for organization; you can use the templates as a single source of truth, and avoid the maintenance issues that come with hardcoding HTML structure into JavaScript files a strings. The following pattern connects a DOM element with a Backbone.View that can re-render it with the same template that originally rendered it.

In Hypr:

```html
<div id="product-detail">
    <!-- This div's contents will be rewritten by Backbone. Note that it contains only one line: an include tag to a Hypr template. -->
    {% include "modules/product/product-detail" %}
</div>
```

In JavaScript:

```js
var productModel = new ProductModels.Product(require.mozuData('product'));
var $productDetailEl = $('#product-detail');
var productView = new ProductView({
    // The below template should have the same name as the contents of the include tag inside the corresponding Hypr template
    templateName: "modules/product/product-detail",
    model: productModel
});
```

The client-side pattern of binding a Backbone.MozuView to a DOM element will fill its contents with the template's rendered HTML, just like using an `{% include %}` tag in server-side Hypr does. *(Of course, `{% include %}` tags are also supported in HyprLive, but the root element must be bound with a Backbone.MozuView.)*