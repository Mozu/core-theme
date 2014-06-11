/**
 * @class Taco.view.order.Index
 */


Ext.define('Taco.view.order.Split', {
    extend: 'Taco.core.ux.form.SplitEditor',
    alias: 'widget.order.split',
    requires: [
        'Taco.model.Order',
        'Taco.view.order.Grid',
        'Taco.store.OrderGrid',
        'Taco.view.order.Form',
        'Taco.view.order.modal.ProductConfigurator',
        'Taco.view.order.AdvancedSearchForm'
    ],

    stateId: 'taco-orders',
    title: 'Orders',

    mixins: {
        navHeader: 'Taco.core.ux.mixins.NavHeader'
    },
    
    statics: {
        eastConfigs: {
            placeholder: {
                xtype: 'component',
                html: 'hello world'
            },
            form: {
                xtype: 'panel',
                html: 'test'
            }
        }
    },

    // cls: "taco-content-navcontainer-padding",

    initComponent: function () {
        this.store = Taco.core.data.StoreManager.getOrCreate('Taco.store.OrderGrid');

        this.editor = this.statics().eastConfigs.form;

        this.config.east = [this.editor];
        
        this.orderList = Ext.create('Taco.view.order.Grid', {

            header: false, // hides the header (the title)
            addContentViewPadding: false,
            enableNavHeader: false, // disables the navHeader Mixin
            launchEditorOnClick: false, // this disables the default behavior in the LaunchEditor Mixin
            listeners: {
                itemkeydown: {
                    scope: this,
                    fn: function (grid, record, item, index, e) {
                        if (e.getKey() == Ext.EventObject.ENTER) {
                            this.setRecord(record)
                        }
                    }
                },
                itemclick: {
                    scope: this,
                    fn: function (grid, record, item, index, e) {
                        this.setRecord(record);
                    }
                }
            }
        });

        this.config.west = [this.orderList];
        
        this.callParent(arguments);
    },

    // override of template method in splitEditor.js. Used to delegate the title to the views
    getWestTitle: function () {
        return this.orderList.getTitle();
    },

    // override of template method in splitEditor.js. Used to delegate the title to the views
    getEastTitle: function () {
        var title = (this.editor && this.editor.getTitle) ? this.editor.getTitle() : "Edit";
        return title;
    },

    onRecordChange: function (nextRecord) {
        if (nextRecord) {
            this.replaceEastItems('form', { record: nextRecord });
        } else {
            this.replaceEastItems('placeholder');
        }

        this.callParent(arguments);
    },

    replaceEastItems: function (key, config) {
        var east = this.getEast();
        var defaults = this.statics().eastConfigs[key];
        var url = 'orders/split';

        east.removeAll(true);

        if (defaults) {
            config = Ext.apply({}, config || {}, defaults);
        }

        if (config && config.record) {
            url = "orders/edit/" + config.record.getId();
        }

        if (key === 'form') {
            // uriOrState, metadata, useReplace
            Taco.core.StateManager.attemptNavigate(url, { complexMetaData: { container: east } });
        } else {
            east.removeAll();
            east.add(config);
        }
    }
});
