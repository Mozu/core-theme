 Mozu Theme Scaffolding                                                    v1.0
================================================================================

The `scripts` directory is for JavaScript. Mozu strongly recommends that you use
the AMD (Asynchronous Module Definition) pattern to make your JavaScript files
into reusable, dependency-managed modules. To encourage this, the Hypr template
engine provides:

*   an `{% include_script %}` tag that enables you to declare dependencies on 
    JavaScript files anywhere in the document, but load them in a non-blocking 
    and asynchronous way at the end of page load

*   an `{% all_scripts %}` tag that emits all the scripts on the page that were
    included using the `{% include_script %}` tag, in a JS array format
    suitable for use by an AMD loader like RequireJS

*   a customized version of the RequireJS module loader library, that includes
    special routes for Hypr and the Mozu JavaScript SDK, plus a simple syntax
    for shimming non-AMD scripts

Almost all the JavaScript files in the Core theme are AMD modules, and the Core
theme configures RequireJS to expect all modules to be in the `scripts` directory.