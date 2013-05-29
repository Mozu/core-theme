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
    views: ['order.Index']
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


