/**
 * @class Taco.controller.Orders.
 * The Orders controller.
 */
Ext.define('Taco.controller.Orders', {
    extend: 'Taco.core.Controller',
    modelName: 'Order',
    requires: [
        'Taco.view.order.Index',
        'Taco.view.order.Split',
        'Taco.view.order.Grid',
        'Taco.view.order.Edit'
    ],
    editorView: 'Taco.view.order.Edit',
    indexView: 'Taco.view.order.Split',
    // views: ['order.Index'],


    //todo:  changing to s until orders support siteId  in resource
    createContentView: function (viewName, cfg) {
        var split;


        //Ext.suspendLayouts(); 

        //removing initial view  to aviod events firing from the create of the view from messin with the 
        split = Taco.app.contentView.down('order-split');

        if (!split) {
            Taco.app.contentView.removeAll(true);
            split = Ext.create(this.indexView);
            Taco.app.contentView.add(split);
        }

        Ext.resumeLayouts(true);
        if (cfg && cfg.record) {
            split.setRecord(cfg.record);
        } else {
            split.setRecord(null);
        }

        // Ext.resumeLayouts(true);

        return split;


    },


    //copy and paste override to disable the load mask turn offing
    doEditInternal: function (id, additionalParams, appState, viewName, model) {
        var record = appState ? appState.record : null,
            options = appState ? appState.options : null;
        if (appState && appState.container) {
            options = options || {};
            options.container = appState.container;
        }



        if (record) {
            Taco.app.setLoading();
            record.reload({
                success: function () {
                   // Taco.app.setLoading(false);

                    this.ensureRequiredStores(function () {
                        this.createContentView(viewName, {
                            record: record,
                            options: options
                        });
                    });
                },
                failure: function () {
                    Taco.app.setLoading(false);
                },
                scope: this
            });


        } else {
            Taco.app.setLoading();
            model.load(id, {
                success: function (record) {
                    //Taco.app.setLoading(false);

                    this.ensureRequiredStores(function () {
                        this.createContentView(viewName, {
                            record: record,
                            options: options
                        });
                    });
                },
                failure: function () {
                    Taco.app.setLoading(false);
                },
                scope: this
            });
        }
    },



    orderlist: function (cfg) {

        var ctx = Taco.app.context.getCurrentContext();
        if (cfg.record && (ctx.contextType !== 's' || (cfg.record.data.siteId && ctx.id !== cfg.record.data.siteId))) {
            Taco.app.context.setCurrentContext(Taco.app.context.findSite(cfg.record.data.siteId), false);
        }

        this.superclass.createContentView('Taco.view.order.Grid', {
            record: null,
            options: null
        });

    },


    create: function () {
        var ctx = Taco.app.context.getCurrentContext(),
            record;


        if (ctx.contextType !== 's') {
            Taco.app.context.setCurrentContext(Taco.app.context.getStore().findRecord('contextType', 's').raw);
            return;
        }

        Taco.app.setLoading();

        record = Ext.create('Taco.model.Order');

        record.save({
            callback: function () {

                //changing the path to be edit instead of create so that the user can refresh the page and get back to it if they accidently navigate away;
                Taco.core.StateManager.attemptNavigate('s-' + record.data.siteId + '/orders/edit/' + record.data.id);

                /*
                this.createContentView(this.getEditorView(), {
                    record: record
                });
                Taco.app.setLoading(false);
                */
            },
            scope: this
        });
    }
});
