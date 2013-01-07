/**
 * @class Taco.view.product.Edit
 */
Ext.define('Taco.view.product.Edit', {
    extend: 'Taco.core.ux.form.Editor',
    alias: 'widget.productedit',
    requires: ['Taco.core.ux.CategoryComboBox',
            'Taco.view.product.edit.ConfigurableOptions',
            'Taco.view.product.edit.Seo',
            'Taco.view.product.edit.Basic', 'Taco.core.ux.form.SlugField', 'Taco.core.ux.form.SelectField', 'Ext.form.field.ComboBox', 'Taco.model.Option', 'Taco.store.Options', 'Taco.core.ux.action.DirtyButton', 'Taco.view.product.edit.StandaloneOptions'],
    title: '',
    instructionText: '',
    model: 'Taco.model.Product',
    type: 'product',
    intentCls: 'producteditor',

    initComponent: function () {
        var me = this;
        if (me.recordId.phantom) {
            me.on('save', me.onCreateSave, me, { single: true });
        }
        me.actions = [
                {
                    xtype: 'secondarybutton',
                    text: 'Edit product in website',
                    margin: '3 20 0 20',
                    listeners: {
                        click: function () {
                            Taco.core.StateManager.attemptNavigate('sites/product/' + me.recordId.getId());
                        }
                    }
                },

                {
                    xtype: 'selectfield',
                    mode: 'local',
                    width: 150,
                    value: "",
                    store: [
                    ["", "More"],
                    ["copyRecord", "Copy"],
                    ["createRecord", "Create"],
                    ["deleteRecord", "Delete"]
                ],
                    listeners: {
                        change: function () {
                            var val = this.getValue();
                            if (me[val]) {
                                me[val].call(me);
                            }
                        }
                    }
                }, {
                    xtype: 'secondarybutton',
                    intentCls: 'cancel',
                    text: 'Cancel',
                    eventName: 'cancel'
                }, {
                    xtype: 'dirtybutton',
                    intentCls: 'save',
                    text: 'Save',
                    eventName: 'save'
                }];

        me.basic = Ext.create('Taco.view.product.edit.Basic', {
            listeners: {
                dirtychange: me.onFormStateChange,
                scope: me
            },
            recordId: me.recordId
        });

        // me.inventoryControl = Ext.create('Taco.view.product.edit.InventoryControl', {
        //     listeners: {
        //         dirtychange: me.onFormStateChange,
        //         scope: me
        //     }
        // });

        me.configurableOptions = Ext.create('Taco.view.product.edit.ConfigurableOptions', {
            listeners: {
                dirtychange: me.onFormStateChange,
                scope: me
            }
        });

        me.standaloneOptions = Ext.create('Taco.view.product.edit.StandaloneOptions', {
            listeners: {
                dirtychange: me.onFormStateChange,
                scope: me
            }
        });

        me.seo = Ext.create('Taco.view.product.edit.Seo');


        me.tabs = [{
            //title: 'Basic',
            items: me.recordId.phantom ? [me.basic, { html: 'to add options to your product first save it...'}] : [me.basic, me.inventoryControl, me.configurableOptions, me.standaloneOptions]
        }


        /*, {
        title: 'Advanced Info',
        items: [Ext.create('Taco.view.product.edit.Shipping'), me.seo, Ext.create('Taco.view.product.edit.Widgets')]
        }*/];
        me.on({
            load: {
                fn: me.onLoad,
                scope: me
            },
            beforesave: {
                fn: me.onBeforeSave,
                scope: me
            },
            render: {
                fn: function () {
                    var titleContainer = me.header.getComponent(0),
                            p = titleContainer.getComponent(1),
                            btn = Ext.create('Taco.core.ux.action.SecondaryButton', {
                                intentCls: 'cancel',
                                text: 'View All Products',
                                eventName: 'cancel',
                                click: {
                                    fn: me['cancel'],
                                    scope: me
                                },
                                style: { width: 'auto !important' }
                            });

                    titleContainer.updateLayout({
                        type: 'vbox',
                        align: 'left'
                    });
                    titleContainer.remove(p);
                    titleContainer.add(btn);
                },
                scope: me
            },
            inventorycontrolchange: {
                fn: function (trigger, enabled) {
                    if (trigger === 'configurableoptions') {
                        me.basic.form.getForm().findField('stockOnHand').setVisible(enabled);
                    }
                }
            }
        });

        me.callParent(arguments);
    },
    onBeforeSave: function () {
        this.seo.form.getForm().updateRecord(this.data);
    },
    onCreateSave: function () {
        this.createSaved = true;
        this.fireEvent('created', this.recordId, this);

    },
    onNavigate: function (newState) {

        var md = newState.getMetaData();
        if (md.controller && md.controller === "products" && (md.action === "index" || !md.action)) {
            this.destroy();
            return false;
        }
    },

    onLoad: function (record) {
        var me = this;
        me.seo.form.loadRecord(record);

        me.configurableOptions.loadRecord(record);
        me.standaloneOptions.loadRecord(record);
        me.basic.data = record;
        if (record.get('productName')) {
            // me.setTitle('Product / ' + record.get('productName'));
            me.setTitle('');
        }

    },

    isDirty: function () {
        var form = this.tabForm.getForm(),
                res = !this.createSaved && form.isValid() && (form.isDirty() || this.configurableOptions.isDirty() || this.standaloneOptions.isDirty());

        return res;


    },
    resetOriginalValues: function () {
        this.callParent(arguments);
        this.configurableOptions.resetOriginalValues();
        this.standaloneOptions.resetOriginalValues();
    },
    //onFormStateChange: function () {
    //    //var form = this.tabForm.getForm(), dirtyFields = [];


    //    //if (form.isDirty()) {
    //    //    form.getFields().each(function (item, index, len) {
    //    //        if (item.isDirty()) {
    //    //            dirtyFields.push(item);
    //    //        }
    //    //        return true;
    //    //    });
    //    //}

    //    this.dirtyButton.setDirty(this.isDirty());

    //},



    initSaveTasks: function (chain) {
        var me = this;


        if (me.configurableOptions) {
            me.configurableOptions.initSaveTasks(chain);
        }
        if (me.standaloneOptions) {
            me.standaloneOptions.initSaveTasks(chain);
        }

        this.callParent(arguments);
    }
});
