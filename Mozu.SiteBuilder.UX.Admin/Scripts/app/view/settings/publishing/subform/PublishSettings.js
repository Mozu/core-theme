/**
 * @class Taco.view.settings.publishing.subform.PublishSettings
 *
 */

Ext.define('Taco.view.settings.publishing.subform.PublishSettings', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.content.Tooltip'
    ],
    title: false,
    margin: "0 0 20 0",
    ui: "subform",
    width: "100%",
    initComponent: function () {
        var me = this;

  		this.contentPubStore = Ext.create('Ext.data.Store',
        	{
            fields: [
                "id",
                "mcid",
                "catid",
                "siteid",
                'isPubEnabled',
                'isLiveEditEnabled',
                "scopeType"
            ],
            proxy: {
                type: 'ajax',
                url: '/admin/app/cmspublishing/settingsList',
                reader: {
                    type: 'json',
                    root: 'items',
                    successProperty: 'success',
                    messageProperty: "message"
                }
            },
            listeners: {
                load: this.onContentPubStore.bind(this),
                scope:this
            },
            autoLoad: true
        })

        this.items = [];
        this.callParent(arguments);
    },

    onContentPubStore: function () {

        this.contentPubStore.each(function (rec) {

            var context, scope = rec.get('scopeType');

            if (scope == 'm') {
                context = Taco.app.context.findMasterCatalog(rec.get('mcid'));
            }
            if (scope == 'c') {
                context = Taco.app.context.findCatalog(rec.get('catid'));
            }
            if (scope == 's') {
                context = Taco.app.context.findSite(rec.get('siteid'));
            }
            if (context) {
                context.contentPublishingEnabled = rec.get('isPubEnabled');
            }
            
        });
      	
        this.add(this.buildItems());
    },

    buildItems: function () {
        var items = [],
            me = this;

        this.suspendSetValue = false;

        Ext.each(Taco.app.context.masterCatalogs, function (masterCatalog) {

            var subitems = [],
                isLiveProduct = masterCatalog.productPublishingMode === 'Live',
                isLiveEdit = masterCatalog.isLiveEditEnabled(),
                liveProductRadio,
                stagedProductRadio,
                liveEditProductCheckbox,
                liveEditColumnHeading;

            liveProductRadio = Ext.widget({
                xtype: 'radio',
                checked: isLiveProduct,
                name: 'product-publishing-' + masterCatalog.id,
                cellCls: 'product radio',
                listeners: {
                    change: function (field) {
                        var publishMode,
                            isLiveEdit = null,
                            liveEditCheck = me.down('#isLiveEditEnabled-' + masterCatalog.id);

                        if (field.getValue()) {
                            publishMode = 'Live';
                            isLiveEdit = false;
                            if (liveEditCheck) {
                                liveEditCheck.setValue(false);
                                liveEditCheck.disable();
                            }
                        } else {
                            publishMode = 'Pending';
                            if (liveEditCheck) {
                                liveEditCheck.enable();
                            }
                        }
                        masterCatalog.updateProductPublishingMode(publishMode, isLiveEdit);
                    },
                    click: {
                        fn: function () {
                            this.confirmLive(liveProductRadio);
                        },
                        element: 'inputEl'
                    },
                    scope: this
                }
            });

            liveProductRadio.setValue = Ext.bind(function () {
                if (!this.suspendSetValue) {
                    liveProductRadio.__proto__.setValue.apply(liveProductRadio, arguments);
                }
            }, this);

            stagedProductRadio = Ext.widget({
                xtype: 'radio',
                checked: !isLiveProduct,
                name: 'product-publishing-' + masterCatalog.id,
                cellCls: 'product radio'
            });

            stagedProductRadio.setValue = Ext.bind(function () {
                if (!this.suspendSetValue) {
                    stagedProductRadio.__proto__.setValue.apply(stagedProductRadio, arguments);
                }
            }, this);

            liveEditProductCheckbox = Ext.widget('checkboxfield',
                {
                    xtype: 'checkbox',
                    name: 'isLiveEditEnabled-' + masterCatalog.id,
                    itemId: 'isLiveEditEnabled-' + masterCatalog.id,
                    checked: isLiveEdit,
                    cellCls: 'product radio',
                    //fieldLabel: 'Live Edit',
                    labelAlign: 'left',
                    labelWidth: 75,
                    disabled: isLiveProduct,
                    listeners: {
                        change: function (field) {
                            masterCatalog.updateProductPublishingMode(null, field.getValue());
                        },
                        scope: me
                    }
                }
            );

            liveEditColumnHeading = Ext.widget('fieldcontainer', {
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Live Edit',
                    cellCls: 'header radio',
                    itemId: 'live-edit-field-container-' + masterCatalog.id,
                    tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                        elementId: 'live-edit-field-container-' + masterCatalog.id,
                        hoverTarget: 'label',
                        messageKey: 'settings.publishing.liveEdit',
                        offsetLeft: 82,
                        offsetTop: 15
                    })
                }
            );

            Ext.Array.push(subitems, {}, 
            	{
	                xtype: 'fieldcontainer',
	                fieldLabel: 'Live',
	                cellCls: 'header radio',
                    width: 50
	            }, 
	            {
	                xtype: 'fieldcontainer',
	                fieldLabel: 'Staged',
	                cellCls: 'header radio',
                    width: 50
	            }, 
	            liveEditColumnHeading,   
	            {
	                html: 'Product Publishing',
	                width: 200,
	                cellCls: 'product'
	            },
	            liveProductRadio,
	            stagedProductRadio,
	            liveEditProductCheckbox
            );

            if (!masterCatalog.sites.length) return;

            if (!me.hideCmsOptions) {
                Ext.Array.push(subitems, {
                    html: 'Content Publishing',
                    cellCls: 'content'
                }, {}, {}, {});

                
                this.addContentPublishOptions(masterCatalog, subitems);

                Ext.each(masterCatalog.catalogs, function (catalog) {
                    this.addContentPublishOptions(catalog, subitems);
                    Ext.each(catalog.sites, function (site) {
                        this.addContentPublishOptions(site, subitems);
                    }, this);

                }, this);
            }

            items.push({
                xtype:'panel',
                title: masterCatalog.name,
                layout: {
                    type: 'table',
                    columns: 4
                },
                margin: '0 0 30',
                defaults: {
                    xtype: 'component'
                },
                items: subitems
            });

        }, this);

        return items;
    },

    addContentPublishOptions: function (site, subitems) {
        var liveContentRadio,
                        stagedContentRadio;

        if (!Ext.isBoolean(site.isContentPublishingEnabled())) {
            return;
        }
        liveContentRadio = Ext.widget({
            xtype: 'radio',
            inputValue: 'Live',
            checked:   !site.isContentPublishingEnabled(),
            name: 'content-publishing-' + site.urlToken,
            cellCls: 'site radio',
            listeners: {
                change: function (field) {
                    site.updateContentPublishingMode(field.getValue() ? 'Live' : 'Pending');
                },
                click: {
                    fn: function () {
                        this.confirmLive(liveContentRadio);
                    },
                    element: 'inputEl'
                },
                scope: this
            }
        });

        liveContentRadio.setValue = Ext.bind(function () {
            if (!this.suspendSetValue) {
                liveContentRadio.__proto__.setValue.apply(liveContentRadio, arguments);
            }
        }, this);

        stagedContentRadio = Ext.widget({
            xtype: 'radio',
            inputValue: 'Pending',
            checked: site.isContentPublishingEnabled(),
            name: 'content-publishing-' + site.urlToken,
            cellCls: 'site radio'
        });

        stagedContentRadio.setValue = Ext.bind(function () {
            if (!this.suspendSetValue) {
                stagedContentRadio.__proto__.setValue.apply(stagedContentRadio, arguments);
            }
        }, this);

        Ext.Array.push(subitems, {
            html: site.name,
            cellCls: 'site site-name'
        },
            liveContentRadio,
            stagedContentRadio,
            {}
        );
    },

    confirmLive: function (field) {

        // If switching from Live to Stage, do nothing
        if (field.getValue()) return;

        // If switching from Stage to Live, confirm the change 
        this.suspendSetValue = true;
        
        Taco.MessageBox.confirm({
            title: 'Are you sure?',
            msg: 'Switching to Live Edits will automatically publish any staged edits.',
            modal: true,
            fn: function (btn) {
                
                this.suspendSetValue = false;

                if (btn === 'ok') {
                    field.setValue(true);
                }
            },
            scope: this
        });
    }
});