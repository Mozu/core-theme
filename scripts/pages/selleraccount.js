define([
    "modules/jquery-mozu",
    'modules/api',
    "underscore",
    "hyprlive",
    "modules/backbone-mozu",
    "hyprlivecontext",
    'modules/models-customer',
    'modules/models-b2b-account',
    "modules/backbone-pane-switcher",
    "modules/b2b-account/account-info",
    'modules/b2b-account/quotes'
],
    function ($, api, _,
        Hypr,
        Backbone,
        HyprLiveContext,
        CustomerModels,
        B2BAccountModels,
        PaneSwitcher,
        AccountInfo,
        Quotes) {

        var paneSwitcherModel = new PaneSwitcher.PaneSwitcherModel({});
        var hash = false;
        if (window.location.hash) {
            // Fix escaped characters, remove spaces, and make lowercase
            hash = decodeURI(window.location.hash.substring(1)).split(' ').join('').toLowerCase();
        }

        var panes = [
            {
                name: 'Quotes',
                view: new Quotes.QuotesView({
                    model: CustomerModels.EditableCustomer.fromCurrent()
                })
            }
        ];

        // Switch to the pane matching the hash in the URL.
        if (hash) {
            // If we don't find a pane matching the hash given, perform the
            // default and open on the first pane.
            var indexOfPane = 0;
            // .some is like forEach but it short circuits upon returning true.
            panes.some(function (pane, idx) {
                var name = pane.name.split(' ').join('').toLowerCase();
                if (name === hash) {
                    indexOfPane = idx;
                    return true;
                }
            });
            paneSwitcherModel.setPane(indexOfPane);
        }

        paneSwitcherModel.set('panes', panes);

        $(document).ready(function () {
            var views = {
                paneSwitcherView: new PaneSwitcher.PaneSwitcherView({
                    templateName: "modules/b2b-account/pane-switcher",
                    el: $('.mz-b2b-pane-switcher'),
                    model: paneSwitcherModel
                })
            };
            window.views = views;
            _.invoke(views, 'render');

        });
    });
