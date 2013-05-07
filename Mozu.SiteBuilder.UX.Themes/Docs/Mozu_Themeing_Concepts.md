# Mozu Theming Concepts

Mozu themes determine how a Mozu store looks, and to a certain extent how it works. Themes contain a "look and feel", consisting of colors, typography, typesetting, images, and other formatting, but they can also include widgets and custom functionality, written in JavaScript, that can change or augment the eCommerce workflow. A theme producer has almost total control over the appearance of a Mozu store, down to every line of HTML. Customize Mozu to your heart's content; the only risk you run is that the more you change, the harder it may be for your theme to take advantage of Mozu upgrades.

The Mozu team has provided a Core Theme that we believe embodies the best practices that we want to encourage. The Core Theme organizes NDjango templates in a modular way, uses the full power of Less to produce a single, centralized, quickly customizable stylesheet, and provides a few very useful JavaScript abstractions that make it easy to build dynamic views using KnockoutJS. We believe that a web producer can extend the neutral-looking Core theme and produce a fully personalized, visually distinct experience, while still taking advantage of some of the best practices our team has already put into practice. Of course, you can choose to write a theme from scratch instead of extending the Core theme, and we'd think no worse of you. It's a big tent.

## Theme Ingredients

A theme consists of:

 -   a set of *templates* that tell the server how to construct HTML pages
 -   a set of *stylesheets* that tell web browsers how to display those pages
 -   a set of *script modules* that add dynamic behaviors to those pages
 -   some *metadata files* that describe the features, settings, and capabilities of the theme.

Each of these sections of the theme use some industry-standard technologies:

 -   The template files use a version of the Django template language, which offers variable evaluation, conditionals, loops, filters, includes and blocks to render server data into HTML.
 -   The stylesheets can use plain CSS, but Mozu supports and recommends the use of the LessCss preprocessor, which adds variables, nesting, mixins and other goodies to CSS. Mozu renders Less files as CSS in real time. The stylesheets can also contain evaluated variables from the Theme Settings, defined in the metadata section of the theme.
 -   The JavaScript is organized in Asynchronous Module Declarations, allowing scripts to define and inject their dependencies using RequireJS.
 -   The metadata uses XML and JSON to describe the admin-user-accessible theme settings and 
In the usual manner of Web pages, the templates include references to the scripts and stylesheets. The metadata is used by the Mozu store, the Dev Center, and the Theme Gallery to organize and manage the theme. It is written in JSON and XML. 