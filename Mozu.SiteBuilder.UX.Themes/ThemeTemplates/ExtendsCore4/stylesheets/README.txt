 Mozu Theme Scaffolding                                                    v1.0
================================================================================

The `stylesheets` directory should contain Less and/or CSS files. Mozu can run
the Less CSS preprocessor on the fly, serving Less files as rendered CSS. The
Core theme uses this feature extensively--all of its stylesheets are written in 
Less. However, you are not required to use Less; this directory can also serve a
plain CSS file.

Theme settings are also available in stylesheets, both Less and CSS. You can
render them into a stylesheet using the familiar Hypr syntax for variables, e.g.

    margin-left: {{ themeSettings.gutterWidth }}px;

If a theme setting will be used in multiple places, it's good practice to assign
it to a Less variable:

    @gutterWidth: {{ themeSettings.gutterWidth }}px;

The version of Less the Mozu storefront uses is currently ~1.4.