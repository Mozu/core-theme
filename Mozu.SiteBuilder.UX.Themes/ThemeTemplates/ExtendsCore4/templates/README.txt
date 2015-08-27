 Mozu Theme Scaffolding                                                    v1.0
================================================================================

The `templates` directory contains Hypr templates. The `templates/pages` subdir-
ectory contains page templates for the individual page types supported by Mozu
and specified by your theme. The default catalog, commerce, and system pages can
be seen in the Core4 version of theme.json.

Mozu strongly recommends that the page templates use the Hypr `{% extends %}`
feature to extend a common base template. In Core4 that template is called
`page.hypr` and all other page templates inherit from it, overriding different
blocks to make their changes or additions.

Hypr templates meant only for use on the server (like `page.hypr`) should have
the file extension `.hypr`. Templates that should be available for use on the
client side by a Web browser should have the file extension `.hypr.live`. Just
adding this extension ensures that Mozu will provide this template to Hypr
upon page load.