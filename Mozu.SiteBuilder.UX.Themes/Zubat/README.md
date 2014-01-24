# Zubat

<img src="http://pldh.net/media/dreamworld/041.png">

Zubat compresses JavaScript for Mozu themes. The name is too good for just that, so it'll probably be expanded to support other common Mozu theme development activities, like file watching, linting, compression of other resources, publishing, you name it. But here's how it works for now.

## The thing it does

Mozu themes have lots of JavaScript in them to support the fancy, dynamic features of the catalog and commerce pages (think category faceting, product configuration, checkout, your account page). To keep the JavaScript maintainable, extensible, and organized, Mozu themes also use RequireJS (in the form of Mozu-Require) to separate scripts into modules. The downside is that this produces a lot of separate, small files, that at runtime causes a lot of separate, small HTTP requests, resulting in a pretty big performance hit.

Zubat analyzes the dependency tree of your modules (using r.js) and reads any specific build directions you have in your `build.js` file, then uses it to *compile and minify your scripts*, into the `compiled/scripts` directory by default. You can then switch your theme to use the compiled scripts by changing the base URL supplied to Mozu-Require, which the Core4 theme does in `templates/modules/trailing-scripts.hypr`, keyed off the theme setting `useDebugScripts`:

    <script>
        var require = {
            {% if siteContext.cdnPrefix %}
            cdnPrefix: "{{ siteContext.cdnPrefix }}",
            {% endif %}
            cacheKey: "{{ siteContext.hashString }}",
            urlArgs: "theme={{siteContext.themeId}}&cacheKey={{ siteContext.hashString }}",
            baseUrl: "{{ siteContext.cdnPrefix }}{% if not themeSettings.useDebugScripts %}/compiled{% endif %}/scripts",
            paths: {
                jquery: "//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery{% if not themeSettings.useDebugScripts %}.min{% endif %}"
            },
            priority: ['jquery']
        };
    </script>
    <script src="{{siteContext.cdnPrefix}}/js/require-{% if themeSettings.useDebugScripts %}debug{% else %}min{% endif %}.js"></script>
    <script type="text/javascript">
        {% if themeSettings.useDebugScripts %}
        require([{% all_scripts %}]);
        {% else %}
        require(['jquery', 'modules/common'], function() { require([{% all_scripts %}]); });
        {% endif %}
    </script>

This is a good way to do it and you should do it this way.

## Installation

1.  Download from Github