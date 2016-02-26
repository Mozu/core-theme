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
        'Taco.view.customers.segments.Modal'
    ],
    ui: 'subform',
    margin: '0 0 20 0',

    title: 'Resolution',
    record: null,

    initComponent: function() {
        var me = this,
            segStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerSegments');

                var siteData = Ext.Array.map(Taco.app.context.getMasterCatalog().sites, function (site) {
            return {
                id: site.id,
                name: site.name
            };
        });

        this.setVisible( this.record.phantom || this.record.get('resolvable') );

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
            fieldLabel: 'Active Sites',
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
            flex: 10,
            hidden: (this.record.phantom || this.record.get('validForAllSites')),
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
                    handler: function () {
                        this.launchSiteModal(this.validSitesList);
                    },
                    scope: this
                }
            ]
        });

        this.scopePanel = {
            xtype: 'panel',
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            width: '100%',
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
                        {
                            xtype: 'radiofield',
                            boxLabel: 'All Sites',
                            name: 'validForAllSites',
                            inputValue: 'true',
                            id: 'sitesChoiceAll',
                            checked: (!this.record.phantom) ? this.record.get('validForAllSites') : true,
                            margin: '0 30 0 0',
                            listeners: {
                                change: function(cmp, isValidForAll){
                                    this.validSitesBox.setVisible(!isValidForAll);
                                    this.validSitesList.focus(false, 200);
                                },
                                scope: this
                            }
                        }, {
                            xtype: 'radiofield',
                            boxLabel: 'Specific Sites',
                            name: 'validForAllSites',
                            inputValue: 'false',
                            checked: (!this.record.phantom) ? !this.record.get('validForAllSites') : false,
                            id: 'sitesChoiceSelect'
                        }
                    ]
                },
                this.validSitesBox
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
                this.scopePanel,
                this.segmentsBox
            ]
        }];

        this.callParent(arguments);
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
        Ext.Object.merge(this.record.data, this.form.getValues());
        return true;
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});