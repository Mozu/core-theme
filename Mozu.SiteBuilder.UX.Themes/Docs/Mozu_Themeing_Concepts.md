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
 -   Widgets consist of a combination of these technologies; they can incorporate a Django template, a Less stylesheet, and an AMD module, all pulled together by a JSON description file.
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

#### Naming Conventions

Our convention is to name templates using CamelCase with initial capitals. Templates in the Core theme are prefixed with an underscore, which is a convenience for you: a template with a prefixed underscore will only work if it's in the Core theme, so you can copy templates from the Core theme without worrying about forgetting one and accidentally overriding when you didn't mean to.

### Layouts

The Layouts folder should contain only one template, and it must be called Default.vol. This template contains the outer wrapper of the site, from the `<!doctype html>` declaration to the `</html>` tag. Individual page templates 

    0.  Template Architecture and Organization
        0.  The root "Layout" template
        0.  The Pages folder and basic inheritance
        0.  The Modules folder
        0.  The Widgets folder
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
        0.  The `morrissey` tool
    0.  The thumbnail
 
        
