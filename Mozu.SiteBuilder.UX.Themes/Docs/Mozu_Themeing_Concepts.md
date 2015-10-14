# Mozu Theming Concepts

Mozu themes determine how a Mozu store looks, and to a certain extent how it works. Themes contain a "look and feel", consisting of colors, typography, typesetting, images, and other formatting, but they can also include widgets and custom functionality, written in JavaScript, that can change or augment the eCommerce workflow. A theme producer has almost total control over the appearance of a Mozu store, down to every line of HTML. Customize Mozu to your heart's content; the only risk you run is that the more you change, the harder it may be for your theme to take advantage of Mozu upgrades.

The Mozu team has provided a Core Theme that we believe embodies the best practices that we want to encourage. The Core Theme organizes NDjango templates in a modular way, uses the full power of Less to produce a single, centralized, quickly customizable stylesheet, and provides a few very useful JavaScript abstractions that make it easy to build dynamic views using KnockoutJS. We believe that a web producer can extend the neutral-looking Core theme and produce a fully personalized, visually distinct experience, while still taking advantage of some of the best practices our team has already put into practice. Of course, you can choose to write a theme from scratch instead of extending the Core theme, and we'd think no worse of you. It's a big tent.

## Theme Ingredients

A theme consists of one or more, usually all, of:

 -   a set of *templates* that tell the server how to construct HTML pages
 -   a set of *stylesheets* that tell web browsers how to display those pages
 -   a set of *script modules* that add dynamic behaviors to those pages
 -   a set of *widgets*, which are small, self-contained units of HTML/CSS/JS with some functionality, that an admin can drag and drop around in the Site Builder editor
 -   some *metadata files* that describe the features, settings, and capabilities of the theme.

Each of these sections of the theme use some industry-standard technologies:

 -   The template files use a version of the Django template language, which offers variable evaluation, conditionals, loops, filters, includes and blocks to render server data into HTML.
 -   The stylesheets can use plain CSS, but Mozu supports and recommends the use of the LessCss preprocessor, which adds variables, nesting, mixins and other goodies to CSS. Mozu renders Less files as CSS in real time. The stylesheets can also contain evaluated variables from the Theme Settings, defined in the metadata section of the theme.
 -   The JavaScript is organized in Asynchronous Module Declarations, allowing scripts to define and inject their dependencies using RequireJS.
 -  [Widgets](#widgets) are a combination of these files; they can incorporate a Django template, a Less stylesheet, and an AMD module, all pulled together by a JSON description file that turns them into drag-and-drop morsels of wonderment.
 -   The metadata uses XML and JSON to describe the admin-user-accessible theme settings and 
In the usual manner of Web pages, the templates include references to the scripts and stylesheets. The metadata is used by the Mozu store, the Dev Center, and the Theme Gallery to organize and manage the theme data.

Each of these technologies deserves explanation and reference material, and this document strives to provide those.

## Table of Contents


0.  Django Templates
    0.  Template Architecture and Organization
        0.  The root "Layout" template
        0.  The Pages folder and basic inheritance
        0.  The Modules folder
        0.  The Widgets folder
    0.  Template Inheritance
    0.  The Django template language and control structures
        0.  Variable evaluation
        0.  Tag usage
        0.  Filter usage
        0.  Includes
        0.  Blocks (used only in layout)
    0.  Variables exposed in the Django templates
        0.  SiteContext and other globals
        0.  Models: when they're direct from the API and when they're not
        0.  Theme settings
    0.  Referencing Resources
        0.  Directory structure
        0.  Stylesheets
        0.  Script Modules
    0.  Best Practices
        0.  Template Organization
        0.  HTML Conventions
        0.  Classes and IDs
        0.  Data Attributes
        0.  KnockoutJS Templates
0.  Stylesheets
    0.  Stylesheet Organization
        0.  The modules folder
        0.  The pages folder
        0.  The storefront stylesheet
        0.  The textonly stylesheet and its special use
    0.  LessCSS usage
        0.  Variables
        0.  Nesting
        0.  Mixins
    0.  Theme Settings
    0.  Best Practices
        0.  Technically all organization is a best practice, not a requirement
        0.  Pixels versus rems
        0.  Stack stylesheets in storefront.less
        0.  Assign themesettings to variables
        0.  Style classes, not IDs
        0.  Use compositional classes
        0.  Limit selector complexity
0.  Script Modules
    0.  AMDs and RequireJS
        0.  Why not to use `<script>` tags
        0.  The `require_script` tag
        0.  The RenderScripts and DebugScripts templates
        0.  The shim plugin
    0.  KnockoutJS ViewModels
        0.  Specifying fields
        0.  Helper methods
        0.  Events
        0.  Populating from SDK
        0.  Populating manually
        0.  Builtin custom bindings
        0.  Builtin custom extenders
    0.  Best Practices
        0.  Targeting HTML
        0.  Binding ViewModels to views
        0.  SDK use
0.  Metadata
    0.  The theme.xml file
        0.  Inheritance
        0.  Supports string
    0.  The ThemeSettings.xml file
        0.  Settings Types
        0.  Availability in templates and stylesheets
        0.  Hiding inherited theme settings
    0.  The build.js file
        0.  The `moz` tool
    0.  The thumbnail

_**Note:** Throughout this document, the term **"you"** refers to a theme developer, the intended audience for these words. If we are describing the experience of a store admin or a shopper, we will say "an admin" or "a shopper"._

##  Django Templates

The HTML for your storefront is all generated by templates, and those templates live inside a theme. Therefore, you (as a theme developer) can modify or override any of them. (We hope, of course, that the templates in the Core theme are flexible and semantic enough that you can use CSS to style them in lieu of changing the markup--that would make your theme easier to make and easier to upgrade when our core functionality changes.).

The templates are written in a simple template language called Django, and organized into several folders depending on how they are used.

##### Naming Conventions

Our convention is to name templates using CamelCase with initial capitals. Templates in the Core theme are prefixed with an underscore, which is a convenience for you: a template with a prefixed underscore will only work if it's in the Core theme, so you can copy templates from the Core theme without worrying about forgetting one and accidentally overriding when you didn't mean to.

### Template Architecture and Organization

#### Layouts

The Layouts folder should contain only one template, and it must be called Default.vol. This template contains the outer wrapper of the site, from the `<!doctype html>` declaration to the `</html>` tag. Individual page templates *inherit* from this Layout template.

Because of its importance, the Layout template must be versatile and therefore generic. It should contain only a basic HTML shell that can be used for almost every type of conceivable page in your theme. It should be marked up with [blocks](#blocks) so that inheriting templates can override small portions of the template.

*(In fact, blocks are only really useful in the layout template. Nothing in Mozu themes can extend page templates, so blocks can only be used to set and override the layout.)*

#### The Pages folder and basic inheritance

The Pages folder contains a template for each of the different types of pages in your store. These page templates should, in almost all cases, *extend the Layout template*. You can think of them as variations on the Layout template, that change various aspects of that template--most notable, the body content.

Example page template:
```html
{% extends "layouts\default" %}

{% block Init %}
	{% setTemplateVariables BodyTagClasses="mz-my-account" %}
{% endblock Init %}

{% require_script "pages/myaccount" %}

{% block BodyContent %}

    ...body HTML here

{% endblock BodyContent %}
```

The first line indicates that the template is a variation of "default", the default layout. The rest of the template file is mostly just a list of `{% block %}` statements, specifying how to override the different areas of the default layout. All page templates in the Templates folder should follow this basic template.

The default page types in your store include:

*   Blank Page (for CMS pages)
*   Blog Archive
*   404 Page
*   Cart
*   Category
*   Checkout
*   Checkout Confirmation
*   Server Error Page
*   My Account Page
*   Blog Post
*   Product
*   Search Results Page
*   Sign In Page

As a theme developer, you can create new [Page Types](#Page_Types) and add their templates to your Templates folder, but at minimum you need to provide the above templates.

#### The Modules folder

Modules are also known as "partials". They contain snippets of HTML that are reusable, or could be considered a separate block of functionality. The Modules folder contains *all template files that are not full page templates or templates belonging to widgets*. So there's a lot of stuff in here. In an effort to keep the directory structure pretty simple, a lot of different kinds of files are in the Modules directory:

*   Commonly used, reusable snippets like `MessageBar.vol` or `PriceStack.vol`
*   Snippets only used in a single place, but broken off into a unit of functionality to allow for more focused and specific overrides in inherited themes, like `CartTableRow.vol` or `CheckoutOrderSummaryPanel.vol`
*   Snippets that do not visibly display anything, but supply the DOM with needed assets like client-side templates for use in JavaScript, like `AddressSummaryTemplate.vol`

Sometimes the separation of pages into component templates can seem excessive, but remember that the more granular the templates, the easier it is to make changes without overriding too many of the default templates and losing future upgrades in functionality.

#### The Widgets folder

Widget templates live in here. All other assets pertaining to widgets live in the [Widget metadata](#Widget_metadata) folder, but the Django templates for widgets must be in this folder, in a subfolder named after the widget. You can reference these templates in the Widget's `description.json` file, specified elsewhere.

### The Django template language

The Django template language is a Mozu-twerked variation of the actual [Django template language](https://docs.djangoproject.com/en/dev/topics/templates/) used by the Python framework of the same name. **TODO: Reproduce that documentation, but someone else can probs do that?** The basics are as follows:

#### Variable Evaluation

Mozu makes almost all your store's data available to the templates. You can emit that data to the rendered HTML using *variables*. Variables are wrapped in double curly braces:

```html
<p>Welcome back, {{ User.FirstName }}!</p>
```

When the template is processed, this will become:

```html
<p>Welcome back, Schroeder!</p>
```

#### Tags

Mozu also makes certain *functions* and *procedures* available inside the templates. These are represented by Django tags.

##### `for` and `if`

The basic looping and conditional code structures.

```html
{% if SiteContext.Navigation %}
<ul>
    {% for item in SiteContext.Navigation %}
        <li><a href="{{ item.url }}">{{ item.name }}</a></li>
    {% endfor %}
</ul>
{% endif %}
```

They work like you'd expect. Many have gone before me and explained this with more limpidity than I can muster here. **TODO: I don't know why I'm still typing this; we need to just adapt the very good Django documentation.**

##### Other default tags

**TODO: the rest of these i guess**

##### The `data_attribute` tag

Add this to elements that should be editable in the WYSIWYG. It adds metadata to them in edit mode.

##### The `json_attribute` tag

This tag turns an objet into a serialized JSON object escaped for insertion into an HTML data attribute, which is the convention we use for safely embedding model data on a page without changing the DOM structure or modifying global JavaScript scope.

#### Filters

Filters are a Django concept that allows you to do something to values before you either use them or argue them to a tag. We added a couple I guess. TODO: not be stupid about this

#### Includes

The templates in the core theme are separated into modules, which are then hooked together using the include tag. Including another template will add it to the current rendering context; it receives the same Model and arguments as the template that called it.

#### Blocks

Blocks are a concept in Django inheriance that the core theme uses in the base layout template to allow inheriting templates to change some aspects of the default. Blocks can be overridden only in templates that begin with the {% extends %} tag, meaning that they extend the Default.vol template. At this time we don't recommend defining your own blocks; it's best to stick with the blocks defined in Default.vol.

### Data Available To Templates

##### SiteContext

The `SiteContext` variable is available throughout all of your templates, and contains information about the current site, current page, navigation state, and other global properties of your Mozu store. **TODO: enumerate all properties**

##### Models

The `Model` variable is available in almost all templates. It is a representation of the piece of relevant store data that the current template is supposed to display. For instance, in the Product.vol template, the `Model` refers to the current Product, and therefore e.g. `{{ Model.ProductName }}` will render the current product name.

**TODO:** Document all models, obvs

##### Theme Settings

In the `MetaData/ThemeSettings.xml` file, you can define a list of variables that store owners can modify themselves, without changing templates or knowing any code. These theme settings become available, *in both templates and stylesheets*, in a `themeSettings` object. For instance, if you've created a Theme Setting called `DisplayImageInListing` then it will be available in your template as `themeSettings.DisplayImageInListing`.

### Referencing Resources

The `Resources` directory of your theme is a public directory, and everything inside it is accessible at `http://your-store-domain.com/resources/path/to/anything`. You can put arbitrary directories in here; by convention, the directories we included in the Core theme are `Fonts`, `Images`, `Scripts`, `Scripts-Built`, `Strings`, and `Stylesheets`, and we find that to be a good organizational approach, but you can add any directories you wish. Mozu will use the file extensions of the files you upload to determine how to serve them; for instance, Less files that end in `.less` will be run through the LessCSS preprocessor and served as plain CSS. **Remember that any dashes in directory names will be removed in the URL. URLs in the `Scripts-Built` directory, for example, will contain `/ScriptsBuilt/` in their URL.**

### Best Practices

The Core theme is meant to be a "reference implementation" of Mozu concepts. Don't use it by itself (its stylesheet is spartan on purpose) but we strongly recommend that when you are creating a new theme, you **base in on the Core theme**. Any files or modules you don't modify get inherited from the Core theme, so you get a lot of functionality for free. We've tried to build the Core theme so that it's "skinnable", in the sense that the HTML is generic enough that you can style it in lots of ways. We've also tried to incorporate good organizational principles into the core theme; Some of our file structure is required by the storefront software--namely, the contents of the `Metadata` and `Templates` folders--but most of the rest of the Core theme is organized in a way that we find to be easy to navigate. You, as a theme developer, may feel differently, and you have tremendous latitude in reorganizing or simplifying the theme structure. However, we hope you see why we made the choices we made; here is a short explanation of some of them.

#### Template Organization

The divisions between templates are arbitrary, but we have tried to make everything that will be *used in multiple places* into a separate template, as well as everything that *a theme developer is most likely to want to modify*. When making your theme, it's best to try to change as little of the HTML as possible, so that your theme is forward-compatible with new features or changes in the storefront software. The smaller the template file itself, the less likely it is that your changes will conflict in the future with HTML changes the Core theme has to make to accommodate a new feature or bugfix. 

There are a couple of conventions of template naming. The first and most obvious is that every template in the Core theme is prefixed with an underscore, e.g. `_Default.vol`. This has a special meaning to the software: **a template whose name begins with an underscore will not work in your theme**. It only works--as in, the software only uses it to render a page--in the Core theme. This feature is meant to prevent you from accidentally overriding templates when you copy parts of the Core theme to make your own. **When you start modifying a template in your theme, make sure to remove the underscore from the beginning of the filename.**

Another convention is that some template filenames end with the word "Template", e.g. `AddressFormTemplate.vol`. This indicates that the template is not written primarily in Django--it is instead written in a client-side template language (KnockoutJS in the Core theme) and will be used in JavaScript-enhanced interfaces. **TODO: Pick another word, that's crazy confusing.** 

#### Stylesheets

The `Resources/Stylesheets` directory has a structure dedicated to producing a single, well-organized stylesheet to reference. In the Core theme, the stylesheet is called `storefront.less`. That file itself contains a list of import declarations (which in LessCSS are done by the server instead of the browser, reducing the number of HTTP requests and therefore the load time of the page). All style rules that pertain to various *modular components* or *common elements* of the theme belong in the `Resources/Stylesheets/Modules` subdirectory, and all rules that pertain only to specific *pages* or *page types* belong in the `Resources/Stylesheets/Pages` subdirectory. At the root directory, there is only `storefront.less`, which compiles all the stylesheets together using a stack of import declarations, and `textonly.less`.

##### The usage of `textonly.less`

The `textonly.less` file is a *partial* stylesheet, that should contain only CSS that pertains to text, rather than box model concerns like positioning, floating, dimensions, or margins and padding. This file is used in the Mozu SiteBuilder, which has rich text editors. In order for the store administrator to edit text as it will actually appear in the theme, SiteBuilder needs to import some of the theme CSS into its text editor widget. Too much of the theme CSS might make the widget unusable, by adding unpredictable margins or positioning. Therefore, a theme should include a version of its default stylesheet that includes only text-based properties, so that the font face, size, style, leading, and kerning can be preserved during WYSIWYG editing.

#### Scripts

The `Resources/Scripts` directory is organized similarly. Much in the same way that Mozu provides the LessCSS preprocessor to compile modular CSS into a single stylesheet, it also provides the RequireJS script loader to load modular JavaScript files on to the page and execute them according to their dependencies. 


x    0.  The Django template language and control structures
x        0.  Variable evaluation
x        0.  Tag usage
x       0.  Filter usage
x       0.  Includes
x       0.  Blocks (used only in layout)
x   0.  Variables exposed in the Django templates
x       0.  SiteContext and other globals
x       0.  Models: when they're direct from the API and when they're not
x       0.  Theme settings
x   0.  Referencing Resources
x       0.  Directory structure
x       0.  Stylesheets
x       0.  Script Modules
x   0.  Best Practices
        0.  Template Organization
        0.  HTML Conventions
        0.  Classes and IDs
        0.  Data Attributes
        0.  KnockoutJS Templates
0.  Stylesheets
    0.  Stylesheet Organization
        0.  The modules folder
        0.  The pages folder
        0.  The storefront stylesheet
        0.  The textonly stylesheet and its special use
    0.  LessCSS usage
        0.  Variables
        0.  Nesting
        0.  Mixins
    0.  Theme Settings
    0.  Best Practices
        0.  Technically all organization is a best practice, not a requirement
        0.  Pixels versus rems
        0.  Stack stylesheets in storefront.less
        0.  Assign themesettings to variables
        0.  Style classes, not IDs
        0.  Use compositional classes
        0.  Limit selector complexity
0.  Script Modules
    0.  AMDs and RequireJS
        0.  Why not to use `<script>` tags
        0.  The `require_script` tag
        0.  The RenderScripts and DebugScripts templates
        0.  The shim plugin
    0.  KnockoutJS ViewModels
        0.  Specifying fields
        0.  Helper methods
        0.  Events
        0.  Populating from SDK
        0.  Populating manually
        0.  Builtin custom bindings
        0.  Builtin custom extenders
    0.  Best Practices
        0.  Targeting HTML
        0.  Binding ViewModels to views
        0.  SDK use
0.  Metadata
    0.  The theme.xml file
        0.  Inheritance
        0.  Supports string
    0.  The ThemeSettings.xml file
        0.  Settings Types
        0.  Availability in templates and stylesheets
        0.  Hiding inherited theme settings
    0.  The build.js file
        0.  The `morrissey` tool
    0.  The thumbnail
 
        
