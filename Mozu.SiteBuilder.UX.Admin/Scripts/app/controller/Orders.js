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
            Taco.app.context.setCurrentContext( Taco.app.context.findSite(cfg.record.data.siteId), false );
        }
        return this.callParent(arguments);
        
        
        
    }
});


