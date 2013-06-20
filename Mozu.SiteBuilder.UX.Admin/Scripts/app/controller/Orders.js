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
    //createContentView: function (view, cfg) {
    //    var ctx = Taco.app.context.getCurrentContext();
    //    if (ctx.contextType != 's' || ctx.id != cfg.record.siteId) {
            
    //    }
        
        
        

    //    var viewClass = Ext.ClassManager.get(view);
    //    if (this.confirmContext(viewClass)) {
    //        //removing initial view  to aviod events firing from the create of the view from messin with the 
    //        Taco.app.contentView.removeAll(true);
    //        view = view.$className ? view : Ext.create(view, cfg);
    //        if (view.requiresContextOfType) {
    //            view.mon(Taco.app.context, "beforecontextchange", function (newContext) {
    //                var works = this.worksInContext(view, newContext);
    //                if (!works) Taco.app.context.setCurrentContext(Taco.app.context.getStore().findRecord('contextType', Ext.isArray(view.requiresContextOfType) ? view.requiresContextOfType[0] : view.requiresContextOfType).raw);
    //                return works;
    //            }, this);
    //        }

    //        Taco.app.contentView.add(view);
    //        return view;
    //    }
    //},
    


    //edit: {
        
    //}
    
    /*,

    index: function (params) {
        this.createContentView('Taco.view.order.Index');
    },
    edit: function (params) {
        var id = params.id || params;

        Taco.model.Order.load(id, {
            success: function (record, o) {
                var editorView;

                editorView = Ext.create('Taco.view.order.Edit', {
                    recordId: record
                });

                Taco.app.contentView.add(editorView);
            }
        });
    }
    */
});


