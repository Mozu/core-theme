Ext.define('Taco.view.capability.Form', {
    extend: 'Taco.core.ux.form.Form',
    ui: 'subform',
    bodyPadding: '19 0',
    margin: '0 0 20 0',
    requires: [
        'Taco.store.Capability',
        'Taco.core.ux.window.Window',
        'Ext.ux.IFrame'
    ],

    title: 'Applications',

    initComponent: function () {
        this.title = this.record.get('applicationName');
        this.buildFormComponents();

        this.mon(this.record,"aftercommit", function () {
            this.updateForm();
        }, this);

        this.mon(this, "afterrender", function () {
            var urlHash = window.location.hash;
            if (urlHash != null && urlHash.toUpperCase() === "#CONFIGURE") {
                this.configureCapability();
            }
        }, this);

        this.callParent(arguments);

    },

    allowEnableDisable: function () {
        return this.record.get('capabilityType') == 'Extensions' || this.record.get('initialized');
    },

    updateForm: function () {
        this.templateLeft.update(this.record);
        this.templateRight.update(this.record);
        //Leaving the hide/show code here incase we need to do this later.......
        
        if (this.allowEnableDisable()) {
            //this.shippingCountry.show();
            this.enableBtn.enable();
        } else {
            //this.shippingCountry.hide();  
            this.enableBtn.disable();
        }
        this.enableBtn.toggle(this.record.get('enabled'));

    },
    buildFormComponents: function () {
        var me = this,
             data = this.record;

        me.enableBtn = Ext.create('Ext.button.Button', {
            text: data.get('enabled') ? 'Disable App' : 'Enable App',
            ui: 'action-toggle',
            scale: 'medium',
            disabled: !me.allowEnableDisable(),
            enableToggle: true,
            toggleHandler: function (btn, state) {
                btn.setText(state ? 'Disable App' : 'Enable App');
                this.record.set('enabled', state);

                this.record.save({
                    callback: function (records, operation, success) {
                        //this.record.reload();
                        this.updateForm();
                    },
                    scope: this
                });
            },
            scope: this
        });
        
        if (data.get('enabled')) {
            me.enableBtn.toggle();
        }
        
        me.templateLeft = Ext.create('Ext.Component', {
            data: data,
            padding: '0 0 0 50',
            width: 320,
            tpl: [
                '<div><span>Application Type: </span><span>{[values.data.capabilityName]}</span></div>',
                '<div><span>Publisher Name: </span><span>{[values.data.developerAccountName]}</span></div>',
                '<div><span>Published Date: </span><span>{[Ext.util.Format.date(values.data.publishedDate, "m/d/Y")]}</span></div>',
                '<div><span>Enabled: </span><span>{[values.data.enabled]}</span></div>'
            ]
        });
        me.templateRight = Ext.create('Ext.Component', {
            data: data,
            width: 320,
            tpl: [
                '<div><span>Initialized: </span><span>{[values.data.initialized]}</span></div>',
//                '<div><span>License Dates: </span><span>{[Ext.util.Format.date(values.data.effectiveStartDate, "Y") === "0000" ? "thru" : (Ext.util.Format.date(values.data.effectiveStartDate, "m/d/Y") + " -")]} {[Ext.util.Format.date(values.data.effectiveEndDate, "m/d/Y")]}</span></div>',
                '<div><span>Purchase Date: </span><span>{[Ext.util.Format.date(values.data.createDate, "m/d/Y")]}</span></div>',
                '<div><span>License Type: </span><span>{[values.data.licenseType]}</span></div>'
            ] 
        });
        
        me.infoPanel = Ext.create('Ext.container.Container', {
                layout: 'hbox',
                items: [
                    me.enableBtn,
                    me.templateLeft,
                    me.templateRight
                ]
            }
        );

        me.contactIframe = {
            xtype: 'uxiframe',
            //src: 'http://aus02ncfrnt002.dev.volusion.com:8080/Console/storeprofile/241/en-us'
            src: data.get('uiSupportUrl')
        };
        
        var hideConfig = false;
        if (this.record.get('uiConfigurationUrl') == null || this.record.get('uiConfigurationUrl') == '') {
            hideConfig = true;
        }

        me.configPanel = Ext.create('Ext.container.Container', {
                layout: 'hbox',
                items: [{
                    xtype: 'label',
                    text: data.get('applicationName')
                }, {
                    xtype: 'label',
                    hidden: hideConfig,
                    text: ' | '
                }, {
                    xtype: 'button',
                    ui: 'button',
                    hidden: hideConfig,
                    text: '  Configuration',
                    handler: function() {
                        this.record.reload({ callback: me.configureCapability, scope: me });
                    },
                    scope: me
                }]
            }
        );

        me.shippingCountry = Ext.widget( {
            xtype: 'multiselect',
            hidden: data.get('capabilityType') == 'Extensions',
            msgTarget: 'side',
            fieldLabel: 'Shipping Country',
            name: 'activeShoppingCountries',
            store: data.get('supportedShoppingCountries'),
            valueField: 'value',
            displayField: 'value',
            value: data.get('activeShoppingCountries'),
            ddReorder: true,
            listeners: {
                change: {
                    fn: function () {
                        this.record.set('activeShoppingCountries', this.shippingCountry.getValue());
                        this.record.save({
                            callback: function (records, operation, success) {
                               // this.record.reload();
                            },
                            scope: this
                        });
                    },
                    delay: 500,
                    scope: this
                }
            },
            scope: this
        });
        me.items = [
            me.infoPanel,
            me.contactIframe,
            me.configPanel,
            me.shippingCountry
        ];

    },

    configureCapability: function () {

        var configIframe = Ext.create('Ext.ux.IFrame', {
            height: '100%',
            src: 'about:blank'
        });

        var formHtml = "<form id='configPost' method='POST' action='" + this.record.get('uiConfigurationUrl')
            + "' target='" + configIframe.frameName +  "'>"
            + "<input type=hidden name='x-vol-tenant-domain' value='" + this.record.get("tenantDomain") + "'/>"
            + "<input type=hidden name='x-vol-return-url' value='" + this.record.get("configReturnUrl") + "'/>"
            + "</form>";

        var configForm = {
            xtype: 'component',
            html: formHtml,
            id: 'configHiddenForm',
            listeners: {
                render: function (cmp) {
                    var fm = cmp.el.dom.firstElementChild;
                    fm.submit();
                }
            }
        };

        var modalConfigWindow = Ext.create('Taco.core.ux.window.Window', {
            autoShow: true,
            resizable: true,
            draggable: true,
            scale: 'large',
            shadow: true,
            height: 700,
            items: [
                configIframe,
                configForm
            ],
            listeners: {
                close: function (cmp) {
                    cmp.removeAll(true);
                    this.record.reload();
                },
                scope: this
            }
        });
        modalConfigWindow.center();

        if (Ext.isArray(this.modals)) this.modals.push(modalConfigWindow);
        else this.modals = [modalConfigWindow];
    },

    onDestroy: function () {
        Ext.destroy(this.modals);

        this.callParent(arguments);
    }
});
