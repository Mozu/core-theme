/**
 * @class  Taco.view.priceList.form.Resolution
 * @description Price List Resolution Form
 */
Ext.define('Taco.view.priceList.form.Resolution', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-priceList-resolution',
    requires: [
        'Taco.core.util.Validation',
        'Taco.store.CustomerSegments',
        'Ext.ux.form.field.BoxSelect',
        'Ext.container.Container',
        'Taco.view.customers.segments.Modal',
        'Ext.tree.Panel',
        'Ext.selection.CheckboxModel',
        'Taco.core.ux.content.Tooltip'
    ],
    ui: 'subform',
    margin: '0 0 20 0',

    title: 'Resolution',
    record: null,

    initComponent: function() {
        var me = this,
            segStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerSegments');

        var catalogChildren = Ext.Array.map(Taco.app.context.getMasterCatalog().catalogs, function (cat) {
            var validSites = me.record.get('validSites'),
            defaultForSites = me.record.get('defaultForSites');
            var siteChildren = Ext.Array.map(cat.sites, function (site) {
                return {
                    id: site.id,
                    text: site.name,
                    parentId: cat.id,
                    type: 'site',
                    expanded: true,
                    loaded: true,
                    leaf: 'true',
                    checked: validSites.indexOf(site.id) !== -1,
                    "default": defaultForSites.indexOf(site.id) !== -1
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
        });

        /*this.defaultHeading = Ext.widget('fieldcontainer', {
            fieldLabel: 'Default',
            cellCls: 'header radio',
            itemId: 'default-field-container',
            tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                elementId: 'default-field-container',
                hoverTarget: 'label',
                messageKey: 'priceList.resolution.default',
                offsetLeft: 82,
                offsetTop: 15
            })
        });*/

        this.siteTreeStore = Ext.create('Ext.data.TreeStore', {
            root: {
                expanded: true,
                children: catalogChildren
            },
            fields: [{
                name: 'default',
                type: 'boolean'
            }, {
                name: 'text',
                type: 'string'
            }, {
                name: 'id',
                type: 'int'
            }]
        });

        this.sitesTree = Ext.create('Ext.tree.Panel', {
            rootVisible: false,
            displayField: 'text',
            store: this.siteTreeStore,
            columns: [{
                xtype: 'treecolumn',
                dataIndex: 'text',
                text: 'Name',
                flex: 1,
            }, {
                xtype: 'checkcolumn',
                text: 'Default',
                dataIndex: 'default',
                hideable: false,
                listeners: {
                    checkchange: function(cmp, rowIndex, checked, eOpts) {
                        var records = me.siteTreeStore.getUpdatedRecords();
                        Ext.Array.each(records, function(record) {
                            if (record.get('default') && !record.get('checked')) {
                                record.set('checked', true);
                            }
                        });
                    }
                },
                renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {
                    if (record.get('leaf')) {
                        var checked = (val) ? 'x-grid-checkcolumn-checked' : '';
                        return '<img class="x-grid-checkcolumn ' + checked + ' " src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==">';
                    }
                    else {
                        return '';
                    }
                }
            }],
            selectPath: function (path, field, separator, callback, scope) {
                // override: set keepExisting to true when calling select()
                var me = this,
                    root,
                    keys,
                    last;

                field = field || me.getRootNode().idProperty;
                separator = separator || '/';

                keys = path.split(separator);
                last = keys.pop();
                if (keys.length > 1) {
                    me.expandPath(keys.join(separator), field, separator, function (success, node) {
                        var lastNode = node;
                        if (success && node) {
                            node = node.findChild(field, last);
                            if (node) {
                                me.getSelectionModel().select(node, true);
                                Ext.callback(callback, scope || me, [true, node]);
                                return;
                            }
                        }
                        Ext.callback(callback, scope || me, [false, lastNode]);
                    }, me);
                } else {
                    root = me.getRootNode();
                    if (root.getId() === last) {
                        me.getSelectionModel().select(root, true);
                        Ext.callback(callback, scope || me, [true, root]);
                    } else {
                        Ext.callback(callback, scope || me, [false, null]);
                    }
                }
            },

            listeners: {
                checkchange: function (node, checked, eOpts) {
                    if (!checked) {
                        me.specificSitesRadio.setValue(true);
                        node.set('default', false);
                    }
                },
                select: function (cmp, record) {
                    this.selectChildren(record, 'select');
                },
                deselect: function (cmp, record) {
                    this.selectChildren(record, 'deselect');
                },
                scope: this
            }
        });

        this.allSitesRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel: 'All Sites',
            name: 'validForAllSites',
            inputValue: 'true',
            id: 'sitesChoiceAll',
            checked: (!this.record.phantom) ? this.record.get('validForAllSites') : true,
            margin: '0 30 0 0',
            listeners: {
                change: function(cmp, newVal, oldVal, eOpts) {
                    if (newVal) {
                        me.selectAllSites(me.siteTreeStore.getRootNode())
                    }
                },
                render: function(cmp, eOpts) {
                    if (cmp.getValue()) {
                        me.selectAllSites(me.siteTreeStore.getRootNode())
                    }
                }
            }
        });
        this.specificSitesRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel: 'Specific Sites',
            name: 'validForAllSites',
            inputValue: 'false',
            checked: (!this.record.phantom) ? !this.record.get('validForAllSites') : false,
            id: 'sitesChoiceSelect'
        });

        this.sitesPanel = {
            xtype: 'panel',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'fieldcontainer',
                    itemId: 'scope-field-container',
                    fieldLabel: "Scope",
                    flex: 1,
                    minWidth: 200,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    margin: '0 30 0 0',
                    items: [
                        me.allSitesRadio, 
                        me.specificSitesRadio
                    ]
                },
                this.sitesTree
            ]
        };

        this.segmentsList = Ext.create('Ext.ux.form.field.BoxSelect', {
                name: 'customerSegments',
                itemId: 'customer-segments-select',
                flex: 9,
                store: segStore,
                getStore: function () {
                    return segStore;
                },
                hideTrigger: true,
                triggerOnClick: false,
                forceSelection: true,
                disableKeyFilter: true,
                typeAhead: false,
                displayField: 'name',
                fieldLabel: 'Customer Segments',
                valueField: 'code',
                style: {
                    display: 'inline-table',
                    verticalAlign: 'bottom'
                }
                //tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                //    elementId: 'customer-segments-select',
                //    hoverTarget: 'label',
                //    messageKey: 'discount.conditions.customerSegments',
                //    arrowPosition: 'left',
                //    offsetLeft: -140
                //})
            }
        );

        this.segmentsBox = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            width: '100%',
            items: [
                this.segmentsList, {
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'action',
                    text: 'Add',
                    margin: '0 0 0 10',
                    flex: 1,
                    maxWidth: 70,
                    //width: '20%',
                    style: {
                        verticalAlign: 'bottom'
                    },
                    handler: function () {
                        this.launchSegmentModal(this.segmentsList);
                    },
                    scope: this
                }
            ]
        });

        this.rankBox = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            width: '100%',
            items: [{
                xtype: 'numberfield',
                name: 'resolutionRank',
                itemId: 'resolutionRankField',
                fieldLabel: 'Resolution Rank',
                allowBlank: true,
                hideTrigger: true,
                margin: '0 30 0 0',
                width: '50%',
                required: false,
                tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                    elementId: 'resolutionRankField',
                    hoverTarget: 'label',
                    messageKey: 'priceLists.resolution.rank',
                    offsetLeft: -122,
                    offsetTop: 0,
                    arrowPosition: 'left'
                }),
            }/*,
            {
                xtype: 'numberfield',
                name: 'searchIndexSequence',
                itemId: 'searchIndexSequenceField',
                fieldLabel: 'Search Index Sequence',
                allowBlank: true,
                hideTrigger: true,
                margin: '0 30 0 0',
                width: '50%'
            }*/]
        });

        Ext.tip.QuickTipManager.init();

        // tree control?
        //   catalog
        //      sites
        //

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
                this.sitesPanel,
                this.segmentsBox,
                this.rankBox
            ]
        }];

        this.callParent(arguments);
    },

    selectChildren: function (record, selectType) {
        var me = this;
        if (!this.selectChildrenFromParent || !record.hasChildNodes()) {
            return;
        }
        Ext.Array.forEach(record.childNodes, function(childNode) {
            //me.sitesTree.getSelectionModel()[selectType](childNode, true);
        });
    },

    selectAllSites: function(node) {
        var me = this;
        if (node.get('leaf')) {
            node.set('checked', true);
        }
        else {
            Ext.Array.each(node.childNodes, me.selectAllSites.bind(me));
        }

    },

    launchSegmentModal: function (list) {
        var gridStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.CustomerSegments',
            clearFilters: true,
            clearSort: true,
            autoLoad: true
        });

        this.modal = Ext.create('Taco.view.customers.segments.Modal', {
            store: gridStore,
            listeners: {
                savesuccess: function (modal, values) {
                    list.addValue(values);
                },
                scope: this
            }
        });
    },

    beforeSave: function () {
        var selectedSites = this.sitesTree.getChecked();
        this.record.set('validSites', Ext.Array.map(selectedSites, function(site) {
            return site.get('id');
        }));
        this.record.set('defaultForSites', Ext.Array.map(selectedSites, function(site) {
            return site.get('default') ? site.get('id') : undefined;
        }));
        Ext.Object.merge(this.record.data, this.form.getValues());
        return true;
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});