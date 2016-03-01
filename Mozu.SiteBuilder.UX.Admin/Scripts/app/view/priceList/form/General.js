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
                                            xtype: 'pricelistcombobox',
                                            name: 'parentCode',
                                            fieldLabel: 'Parent Price List',
                                            itemId: 'parentCodeField',
                                            width: '50%',
                                            margin: '0 30 0 0',
                                            valueNotFoundText: 'None',
                                            editable: true,
                                            forceSelection: false,
                                            excludedCode: !me.record.phantom ? this.record.get("code") : null
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
                        type: 'hbox',
                        align: 'bottom'
                    },
                    width: '100%',
                    items: [
                        {
                            xtype: 'panel',
                            layout: {
                                type: 'hbox',
                                align: 'bottom'
                            },
                            width: '50%',
                            items: [
                                {
                                    xtype: 'numberfield',
                                    name: 'resolutionRank',
                                    itemId: 'resolutionRankField',
                                    fieldLabel: 'Resolution Rank',
                                    allowBlank: true,
                                    hideTrigger: true,
                                    margin: '0 30 0 0',
                                    width: '50%',
                                    required: false
                                },
                                {
                                    xtype: 'numberfield',
                                    name: 'searchIndexSequence',
                                    itemId: 'searchIndexSequenceField',
                                    fieldLabel: 'Search Index Sequence',
                                    allowBlank: true,
                                    hideTrigger: true,
                                    margin: '0 30 0 0',
                                    width: '50%'
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Options',
                    layout: {
                        type: 'vbox',
                        align: 'left'
                    },
                    margin: '15 0 0 0',
                    width: '100%',
                    items: [
                        {
                            xtype: 'checkbox',
                            name: 'filteredInStorefront',
                            itemId: 'filteredInStorefrontCheck',
                            boxLabel: 'Exclusive',
                            value: (!this.record.phantom) ? this.record.get('filteredInStorefront') !== true : false,
                            listeners: {
                                change: function (field, newValue) {
                                    this.record.set('filteredInStorefront', !newValue);
                                    this.record.setDirty(true);
                                },
                                scope: this
                            },
                            tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                                elementId: 'applies-sale-price-check',
                                hoverTarget: 'boxLabelEl',
                                messageKey: 'discount.criteria.appliesToSalePrice',
                                offsetLeft: 20,
                                offsetTop: 15
                            })
                        },
                        {
                            xtype: 'checkbox',
                            name: 'resolvable',
                            itemId: 'resolvableCheck',
                            boxLabel: 'Resolvable',
                            value: this.record.phantom || this.record.get('resolvable'),
                            listeners: {
                                change: function (field, newValue) {
                                    this.parentForm.resolution.setVisible(newValue);
                                    this.record.set('resolvable', newValue);
                                    this.record.setDirty(true);
                                },
                                scope: this
                            },
                            tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                                elementId: 'applies-sale-price-check',
                                hoverTarget: 'boxLabelEl',
                                messageKey: 'discount.criteria.appliesToSalePrice',
                                offsetLeft: 20,
                                offsetTop: 15
                            })
                        }
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
                    text: site.name,
                    parentId: cat.id,
                    type: 'site',
                    expanded: true,
                    loaded: true,
                    leaf: 'true'
                };
            });
            return {
                id: cat.id,
                text: cat.name,
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
            displayField: 'text',
            store: siteTreeStore,
            //preselectedIds: list.value,
            selectChildrenFromParent: true
        });

        this.modal.on({
            savesuccess: function(modal, values) {
                Ext.Array.forEach(values, function(selectedNode){
                    if (selectedNode.isLeaf()) {
                        list.addValue(selectedNode);
                    }
                });
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