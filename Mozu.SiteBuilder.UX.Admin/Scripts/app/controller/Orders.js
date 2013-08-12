/**
 * @class Taco.controller.Orders.
 * The Orders controller.
 */
Ext.define('Taco.controller.Orders', {
    extend: 'Taco.core.Controller',
    modelName: 'Order',
    requires: [
        'Taco.view.order.Index',
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
                this.createContentView(this.getEditorView(), {
                    record: record
                });
                Taco.app.setLoading(false);
            },
            scope: this
        });
    }
});


