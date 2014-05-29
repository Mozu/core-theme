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
        'Taco.view.order.Edit'
    ],
    editorView: 'Taco.view.order.Edit',
    views: ['order.Index'],


    //todo:  changing to s until orders support siteId  in resource
    createContentView: function (view, cfg) {
        var ctx = Taco.app.context.getCurrentContext();
        if (cfg.record && (ctx.contextType != 's' || (cfg.record.data.siteId && ctx.id != cfg.record.data.siteId))) {
            Taco.app.context.setCurrentContext(Taco.app.context.findSite(cfg.record.data.siteId), false);
        }
        return this.callParent(arguments);



    },
    split: function () {
        this.createContentView("Taco.view.order.Split", {
            record: null,
            options: null
        });

        
    },
    create: function () {
        var ctx = Taco.app.context.getCurrentContext(),
            record;


        if (ctx.contextType !== 's') {
            Taco.app.context.setCurrentContext(Taco.app.context.getStore().findRecord('contextType', 's').raw );
            return;
        }
        
        Taco.app.setLoading();

        record = Ext.create('Taco.model.Order');

        record.save({
            callback: function (records, operation, success) {               

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


