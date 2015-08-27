/**
 * @class Taco.view.site.widget.FeaturedProducts
 */
Ext.define('Taco.view.website.widgetEditors.FeaturedProducts', {
    extend: 'Taco.view.website.WidgetEditor',

    title: 'Select Featured Products',
    instructionText: 'Select four featured products.',

    autoSize: false,

    initComponent: function () {
        
        this.store = Ext.create('Taco.store.Products', {
            autoLoad: true
        });

        this.selectionModel = Ext.create('Ext.selection.CheckboxModel', {
            listeners: {
                selectionchange: function (selectionModel, selectedModels) {
                    var productCodes = Ext.Array.pluck(this.selectionModel.getSelection(), 'internalId');
                    this.field.setValue(productCodes);
                },
                scope: this
            }
        });

        this.selector = Ext.create('Taco.core.ux.BaseGrid', {
            store: this.store,
            selModel: this.selectionModel,
            columns: [{
                text: 'Name',
                dataIndex: 'productName',
                flex: 1,
                hideable: false
            }, {
                text: 'Price',
                dataIndex: 'price',

                renderer: function (value) {
                    return Taco.app.context.getCurrent().formatCurrency( value);
                },
            }]
        });

        this.field = Ext.create('Ext.form.field.Hidden', {
            name: 'productCodes',
            isValid: function () {
                return this.getValue().split(',').length > 0;
            }
        });

        this.fields = [
            this.selector,
            this.field
        ];

        this.callParent(arguments);
    },

    buildWidgetConfig: function () {
        return {
            productCodes: this.field.getValue().split(',')
        };
    }
});
