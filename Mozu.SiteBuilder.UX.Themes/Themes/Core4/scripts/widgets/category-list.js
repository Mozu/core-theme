define(['modules/jquery-mozu', 'hyprlive', 'shim!vendor/underscore>_', "modules/api", "modules/backbone-mozu"],
    function ($, Hypr, _, api, Backbone) {
        
        var categoryView = Backbone.MozuView.extend({
                templateName: 'modules/category/category-list',
            });

        $(document).ready(function () {
            $.getJSON('/nav').then(function (json) {
                //grabs the div 
                //creates the hyper template
                //allows it to render with a generic model
                //pumps in the json response to the items field
                //it then auto renders
                //Note: this is a very simple widget, which doesn't req all that we gain from a mozu model
                $('.mz-categorylist').html(Hypr.getTemplate('modules/category/category-list').render({
                    model: {
                        items: json
                    }
                }));

            });
            
        });

    });