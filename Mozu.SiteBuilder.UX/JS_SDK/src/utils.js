// BEGIN UTILS
var utils = {
    // TODO: factor out jQuery
    extend: $.proxy($.extend, $),
    ajax: function (method, url, headers, data, success, failure) {
        if (typeof data !== "string") data = JSON.stringify(data);
        return $.ajax({
            type: method || 'GET',
            url: url,
            dataType: 'json',
            contentType: 'application/json',
            headers: headers, 
            data: data,
            success: success,
            failure: failure
        });
    },
    // the definewrapper.tpl uses a super-slim override of "define" that pushes AMD deps into an array.
    // this allows us to cleanly vendor AMD-compatible scripts without polluting scope.
    // only downside is, you have to refer to the build script (Gruntfile) to see what order you brought them in.
    when: amds[0],
    uritemplate: amds[1]
};
// END UTILS

/*********/
