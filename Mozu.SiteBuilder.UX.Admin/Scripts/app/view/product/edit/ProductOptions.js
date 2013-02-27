///**
//* @author Travis Johnson
//* @class Taco.view.product.edit.ProductOptions
//*/

//    Ext.define('Taco.view.product.edit.ProductOptions', {
//        extend: 'Taco.core.ux.form.Module',
//        title: 'stuff',
//        disabledTitle: 'add options to this product',
//        disabledMessage: 'Options can be anything "optional" about your product, typically things like size or color.',
//        form: {
//            width: 600,
//            //height: 800,
//            layout: {
//                type: 'vbox',
//                align: 'stretch'
//            },
//            items: []
//        },
//        forConfiguration: false,
//        product: null,
//        productOptionsStore: null,
        

//        initSaveTasks: function (chain) {
//            var me = this;

//            chain.addSyncStoreTask({
//                key: 'productOptions',
//                depends: ['main'],
//                store: this.productOptionsStore,
//                errorMsg: 'error saving poods'
//            });

//            Ext.Array.each(me.productOptionEditors, function (editor) {
//                editor.initSaveTasks(chain);
//            }, me);
//        },

//        loadRecord: function (product) {
//            var me = this;
//            me.product = product;
//            me.productOptionsStore = me.product.productOptions();


//            if (me.product.phantom)
//            {
//                me.product.on('idchanged', function () { me.loadProductOptions() });
//            } else
//            {
//                me.productOptionsStore.load({
//                    scope: me,
//                    callback: me.loadProductOptions
//                });

//            }
//        },
//        loadProductOptions: function () {
//            var me = this;

//            if (!me.rendered)
//            {
//                this.on({
//                    render: this.loadProductOptions,
//                    scope: this
//                });

//            }

//            me.saveFirstMessage.hide();


//            me.productOptionsStore.each(me.addProductOption, me);

//        },
//        productOptionEditors: [],
//        addProductOption: function (record) {
//            var me = this,
//            editor = Ext.create('Taco.view.product.edit.ProductOption', {
//                data: record
//            });
//            me.productOptionEditors.push(editor);
//            me.form.add(editor);

//        },
//        createProductOption: function () {
//            var me = this,
//                oEdit = Ext.create('Taco.view.option.Edit', {
//                    autoComplete: true,
//                    readOnly: false,
//                    isModal: true
//                    , height: 500
//                }),
//                modal = Ext.create('Taco.core.ux.modal.Content', {
//                    autoShow: true,
//                    content: {
//                        items: [oEdit]
//                    }
//                });
//            //            modal = Ext.create('Taco.core.ux.modal.Modal', {
//            //                autoShow: true,
//            //                width: 800,
//            //                height:600,
//            //                items: [oEdit]
//            //            });

//            oEdit.on({
//                close: {
//                    fn: function () {
//                        modal.hide();
//                    },
//                    scope: me
//                },
//                save: {
//                    fn: function () {
//                        if (oEdit.getSelectedIds().length > 0)
//                        {
//                            Ext.each(oEdit.getSelectedIds(), function (item) {
//                                var mdm = Ext.create('Taco.model.ProductOptionValue');
//                                mdm.set('productCode', me.product.getId());
//                                mdm.set('option_id', oEdit.data.getId());
//                                mdm.set('id', item);
//                                mdm.set('forConfiguration', me.forConfiguration);
//                                me.productOptionValueStore.add(mdm);
//                            }, me);
//                        }
//                        me.productOptionValueStore.sync({
//                            callback: function () {
//                                me.productOptionValueStore.load();
//                                modal.hide();
//                            }
//                        });

//                    },
//                    scope: me
//                }
//            });



//        },
//        initComponent: function () {
//            var me = this;
//            me.productOptionValueStore = Ext.create('Ext.data.Store', {
//                model: 'Taco.model.ProductOptionValue'
//            });
//            me.saveFirstMessage = Ext.create('Ext.Component', {
//                html: '<h5>save the product first to do stuff</h5>'
//            });
//            me.header = Ext.create('Ext.Component', {
//                html: '<div >Stand along optoins bla bla bla   <span style="text-decoration:underline;cursor:pointer">+add</span></div>',
//                listeners: {
//                    click: {
//                        element: 'el',
//                        fn: function () {
//                            me.createProductOption();
//                        },
//                        scope: me
//                    }
//                }
//            });


//            me.form.items.push(me.saveFirstMessage);
//            me.form.items.push(me.header);
//            me.callParent(arguments);
//        }
//    });
