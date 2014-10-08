/**
 * @class Taco.shared.view.modal.ImageMetadata
 */
Ext.define('Taco.shared.view.modal.ImageMetadata', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [

    ],

    closeAction: 'destroy',
    autoShow: true,
    scale: 'medium',
    title: 'Image Alternative Text',

    //modelName: 'Taco.model.CustomShippingRate',

    initComponent: function () {
        var me = this;


        this.form = Ext.create('Taco.core.ux.form.Form', {
            requireDirty: false,
            layout: {
                type: 'anchor'
            },
            items: [{
                xtype: 'textfield',
                name: 'alt',
                fieldLabel: 'Enter Alt Text for this Image',
                allowBlank: true,
                selectOnFocus: true,
                maxLength: 150,
                width: "100%"
            }
            //, {
            //    xtype: 'fieldcontainer',
            //    // note this layout is required for radiogroups to have the proper height;
            //    layout: "column",
            //    items: [{
            //        xtype: "radiogroup",
            //        fieldLabel: "Custom Rate Type",
            //        flex: 1,
            //        name: "typeGroup",
            //        layout: {
            //            layout: "hbox"
            //        },
            //        columns: 1,
            //        items: [
            //            { xtype: "radiofield", boxLabel: "Flat Rate Per Item", inputValue: "CUSTOM_FLAT_RATE_PER_ITEM_EXACT_AMOUNT", id: "radio1", name: "type" },
            //            { xtype: "radiofield", boxLabel: "Flat Rate Per Order", inputValue: "CUSTOM_FLAT_RATE_PER_ORDER_EXACT_AMOUNT", id: "radio2", name: "type" },
            //            { xtype: "radiofield", boxLabel: "Percentage of Order", inputValue: "CUSTOM_PERCENTAGE_PER_ORDER", id: "radio3", name: "type" }
            //        ]
            //    }]
            //}, {
            //    xtype: 'numberfield',
            //    name: 'amount',
            //    fieldLabel: 'Amount',
            //    allowBlank: false,
            //    hideTrigger: true,
            //    keyNavEnabled: false,
            //    mouseWheelEnabled: false,
            //    width: 160
            //}
            ]
        });

        this.items = [this.form];

        this.form.getForm().setValues(me.record.getData());

        this.callParent(arguments);
        //this.amountField = this.form.findField('amount');
        //window.amountField = this.amountField;
        this.on({
            show: {
                scope: this,
                fn: function () {
                    var field = this.form.findField('alt');
                    if (field && field.rendered) {
                        field.focus(true, 10);
                    }
                }
            }
        });
    },

    //loadForm: function () {
    //    var me = this,
    //        form = me.getForm(),
    //        value = me.record.get("type"),
    //        fieldGroup = form.findField("typeGroup");

    //    // need to manualy set radio buttons. Auto setvalues in form.Form doesn't work.
    //    // radioButton.setValue() only works for a set of radio buttons when the value is a string instead of boolean. boolean values only set the first field with that field name.6 years later and extjs still screws radio buttons up.
    //    fieldGroup.setValue({
    //        "type": value
    //    });

    //    this.callParent(arguments);
    //},

    doSave: function () {
        var me = this,
            data = me.form.getValues();

        me.record.set(data);
        me.saveSuccess(me.record);
        //me.fireEvent('image_metadata_updated', me.record);
    }

    //onDestroy: function () {
    //    this.form.destroy();
    //    this.form = null;
    //    this.callParent(arguments);
    //}
});





//Ext.define('Taco.shared.view.modal.ImageMetadata', {
//    extend: 'Taco.core.ux.window.Modal',
//    requires: [
//        'Ext.data.Store',
//        'Taco.store.Wishlists',
//        'Taco.model.WishlistItem'
//    ],
//    autoShow: true,
//    width: 900,
//    title: 'Image Alternative Text',
//    formCfg: null,
//    closable: true,
//    layout: "fit",
//    actions: [{
//        xtype: 'button',
//        itemId: 'primaryAction',
//        text: 'Close',
//        handler: function () {
//            var me = this;
//            me.close();
//        },
//        formBind: true
//    }],

//    initComponent: function () {
//        var me = this;
//        me.cls += ' ' + Taco.baseCSSPrefix + 'address-editor';

//        //me.wishlistStore = Ext.create('Taco.store.Wishlists', { customerAccountId: this.record.getId() });
//        //me.wishlistItemStore = Ext.create('Ext.data.Store', { model: 'Taco.model.WishlistItem', autoLoad: false });

//        //me.wishlistStore.on('load', function() {
//        //    var defaultWishlist = this.first();
//        //    if (defaultWishlist)
//        //        me.wishlistItemStore.loadData( defaultWishlist.getData().items );
//        //});

//        me.altTextInput = {
//            fieldLabel: 'Enter Alt Text for this Image',
//            allowBlank: true,
//            minLength: 3,
//            maxLength: 150,
//            name: 'alt',
//            required: false,
//            //listeners: {
//            //    change: function(cmp, newValue) {
//            //        cmp.productForm = cmp.productForm || cmp.up('productform');
//            //        cmp.productForm.fireEvent('productnamechange', this.productInCatalogInfo || this.product, newValue);
//            //    },

//            //    scope: this
//            //}
//        };

//        var metadataPanel = Ext.create('Ext.panel.Panel')

//        me.container = {
//            xtype: 'fieldcontainer',
//            layout: 'hbox',
//            width: '100%',
//            defaults: {
//                width: 250,
//                margin: '0 50 0 0'
//            },
//            items: [
//                me.altTextInput
//                //this.productUsageField
//            ]
//        };

//        this.items = [me.container];

//        //me.wishlistGrid = Ext.create('Ext.grid.Panel', {
//        //    store: this.wishlistItemStore,
//        //    viewConfig: {
//        //        deferEmptyText: false,
//        //        stripeRows: false,
//        //        emptyText: '<div class="empty-grid-message">No items to display</div>'
//        //    },
//        //    columns: {
//        //        defaults: {
//        //            draggable: false,
//        //            resizable: true,
//        //            sortable: false,
//        //            menuDisabled: true
//        //        },
//        //        items: [
//        //            { text: 'Product Code', dataIndex: 'product', renderer: function (product) { return product.productCode } },
//        //            { text: 'Name', dataIndex: 'product', renderer: function (product) { return product.name }, flex: 1 },
//        //            //really need site context to format price properly... assuming its been set as the currenct to call whishlist
//        //            { text: 'Price', dataIndex: 'product', renderer: function (product) { var value = product.price.price; return value ? Taco.app.context.getCurrent().formatCurrency(value) : ""; } },
//        //            { text: 'Sale Price', dataIndex: 'product', renderer: function (product) { var value = product.price.saleprice; return value ? Taco.app.context.getCurrent().formatCurrency(value) : ""; } },
//        //            { text: 'Quantity', dataIndex: 'quantity' },
//        //            { text: 'Purchasable', dataIndex: 'purchasableStatusType' },
//        //            { text: 'Date Added', dataIndex: 'auditInfo', renderer: function (auditinfo) { return Ext.util.Format.date(auditinfo.createDate, 'm/d/Y'); } }
//        //        ]
//        //    },
//        //    scope: this
//        //});

//        //this.items = [me.wishlistGrid];

//        this.callParent(arguments);
//    }
//});
