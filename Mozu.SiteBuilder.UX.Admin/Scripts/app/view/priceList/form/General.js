/**
 * @class  Taco.view.priceList.form.General
 * @description Price List General Form
 */
Ext.define('Taco.view.priceList.form.General', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-priceList-general',
    requires: [
        'Ext.form.field.ComboBox',
        'Ext.form.field.Date',
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation',
        'Taco.view.priceList.widget.PriceListComboBox',
        'Taco.core.ux.picker.CheckboxTreeModal'
    ],
    ui: 'subform',
    margin: '0 0 20 0',

    title: 'General',
    record: null,

    initComponent: function() {
        var me = this;

        Ext.tip.QuickTipManager.init();

        var siteData = Ext.Array.map(Taco.app.context.getMasterCatalog().sites, function (site) {
            return {
                id: site.id,
                name: site.name
            };
        });

        var siteStore = Ext.create('Ext.data.Store', {
            fields: ['id','name'],
            data: siteData
        });

        this.validSitesList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'validSites',
            flex: 9,
            store: siteStore,
            getStore: function () {
                return siteStore;
            },
            queryMode: 'local',
            hideTrigger: true,
            triggerOnClick: false,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: true,
            lastQuery:"",
            displayField: 'name',
            valueField: 'id',
            fieldLabel: 'Valid Sites',
            style: {
                display: 'inline-table',
                verticalAlign: 'bottom'
            }
        });

        this.validSitesBox = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            width: '100%',
            items: [
                this.validSitesList,
                {
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'action',
                    text: 'Add',
                    margin: '0 0 0 10',
                    flex: 1,
                    maxWidth: 70,
                    style: {
                        verticalAlign: 'bottom'
                    },
                    handler: function () {
                        this.launchSiteModal(this.validSitesList);
                    },
                    scope: this
                }
            ]
        });

        //   vbox
        //     hbox -
        //        1. vbox
        //          hbox
        //              1.name
        //              2.master cat
        //          hbox
        //              1.code
        //              2.status
        //        2. description field

        this.items = [{
            xtype: 'panel',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                //row 1
                {
                    xtype: 'panel',
                    width: '100%',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'panel',
                            layout: {
                                type: 'vbox',
                                align: 'top'
                            },
                            width: '50%',
                            items: [
                                {
                                    xtype: 'panel',
                                    layout: {
                                        type: 'hbox',
                                        align: 'top'
                                    },
                                    width: '100%',
                                    items: [
                                        {
                                            name: 'name',
                                            itemId: 'nameField',
                                            fieldLabel: 'Name',
                                            allowBlank: false,
                                            xtype: 'textfield',
                                            margin: '0 30 0 0',
                                            width: '50%',
                                            required: true,
                                            minLength: 3,
                                            maxLength: 200,
                                            enforceMaxLength: true
                                        }, {
                                            xtype: 'pricelistcombobox',
                                            name: 'parentCode',
                                            fieldLabel: 'Parent Price List',
                                            itemId: 'parentCodeField',
                                            width: '50%',
                                            margin: '0 30 0 0',
                                            valueNotFoundText: 'None',
                                            editable: true,
                                            forceSelection: false,
                                            excludedIds: !me.record.phantom ? [this.record.get("code")] : []
                                        }
                                    ]
                                },
                                {
                                    xtype: 'panel',
                                    layout: {
                                        type: 'hbox',
                                        align: 'top'
                                    },
                                    width: '100%',
                                    items: [
                                        {
                                            name: 'code',
                                            fieldLabel: 'Code',
                                            itemId: 'codeField',
                                            xtype: 'textfield',
                                            margin: '0 30 0 0',
                                            width: '50%',
                                            allowBlank: false,
                                            maxLength: 30,
                                            readOnly: !me.record.phantom,
                                            required: true,
                                            regex: /^[a-z0-9_\-]+$/i,
                                            regexText: 'Invalid character. Please choose from alphanumeric, underscore, or hyphen characters.'
                                        }, {
                                            xtype: 'combobox',
                                            name: 'enabled',
                                            fieldLabel: 'Status',
                                            width: '50%',
                                            margin: '0 30 0 0',
                                            valueField: 'id',
                                            displayField: 'name',
                                            queryMode: 'local',
                                            valueNotFoundText: 'not found',
                                            editable: true,
                                            forceSelection: true,
                                            value: me.record ? me.record.get('enabled') : true,
                                            store: [[true, 'Active'], [false, 'Disabled']]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            xtype: 'textarea',
                            itemId: 'descriptionField',
                            name: 'description',
                            width: '50%',
                            height: '100%',
                            fieldLabel: 'Description',
                            maxLength: 500
                        }
                    ]
                },
                {
                    xtype: 'panel',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        this.validSitesBox
                    ]
                }
            ]
        }];

        this.callParent(arguments);
    },

    /**
     * Opens a modal with a TreePanel.
     * @private
     */
    launchSiteModal: function(list) {
        var catalogChildren = Ext.Array.map(Taco.app.context.getMasterCatalog().catalogs, function (cat) {
            var siteChildren = Ext.Array.map(cat.sites, function (site) {
                return {
                    id: site.id,
                    name: site.name,
                    parentId: cat.id,
                    type: 'site',
                    expanded: true,
                    loaded: true,
                    leaf: 'true'
                };
            });
            return {
                id: cat.id,
                name: cat.name,
                type: 'catalog',
                expanded: true,
                loaded: true,
                children: siteChildren
            };
        }),

        siteTreeStore = Ext.create('Ext.data.TreeStore', {
            root: {
                expanded: true,
                children: catalogChildren
            }
        });

        this.modal = Ext.widget('checkbox-tree-modal', {
            title: 'Select Sites',
            displayField: 'name',
            store: siteTreeStore
        });

        this.modal.on({
            savesuccess: function(modal, values) {
                list.addValue(values);
                list.store.reload();
                this.parentForm.getForm().checkValidity();
            },
            aftercancelclose: function() {
                list.store.reload();
            },
            scope: this
        });
    },

    beforeSave: function () {
        Ext.Object.merge(this.record.data, this.form.getValues());
        return true;
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});