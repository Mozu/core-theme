define(['modules/backbone-mozu', "modules/api", 'hyprlive', 'hyprlivecontext', 'modules/jquery-mozu', 'underscore', 'modules/models-customer', 'modules/views-paging', 'modules/editable-view'], function(Backbone, Api, Hypr, HyprLiveContext, $, _, CustomerModels, PagingViews, EditableView) {

    //TODO: need to add quotes grid stuff here
    
    $(document).ready(function () {

        // TODO: upgrade server-side models enough that there's no delta between server output and this render,
        // thus making an up-front render unnecessary.
        _.invoke(window.accountViews, 'render');

    });
});
