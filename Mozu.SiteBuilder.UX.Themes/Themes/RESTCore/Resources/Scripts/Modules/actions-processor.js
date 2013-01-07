define(['jquery'], function ($) {
    return function (actions) {
        // TODO: Handle common action requests 
        $.each(actions, function (index, action) {
            if (action.redirect) window.location = action.redirect;
        });
    }
});