Ext.define('Taco.view.capability.Form', {
    extend: 'Ext.panel.Panel',
    ui: 'subform',
    bodyPadding: '19 0',
    margin: '0 0 20 0',
    requires: [
        'Taco.store.Capability',
        'Taco.core.ux.window.Window'
    ],

    title: 'Applications',

    initComponent: function () {
     
        this.title = this.record.get('applicationName');
        this.buildFormComponents();
       
        this.record.on("aftercommit", function () {
            this.updateForm();
        }, this);

        this.callParent(arguments);
    },
    updateForm: function () {
        this.templateLeft.update(this.record);
        this.templateRight.update(this.record);
    },
    buildFormComponents: function () {
        var me = this,
             data = this.record;

        me.enableBtn = Ext.create('Ext.button.Button', {
            text: data.get('enabled') ? 'Disable App' : 'Enable App',
            ui: 'action-toggle',
            scale: 'medium',
            enableToggle: true,
            toggleHandler: function (btn, state) {
                btn.setText(state ? 'Disable App' : 'Enable App');
                this.record.set('enabled', state);
                this.record.save({
                    callback: function (records, operation, success) {
                        this.record.reload();
                    },
                    scope: this
                });
            },
            scope: this
        });
        
        //This is a test btn and will be removed //////////////////////////
        me.initBtn = Ext.create('Ext.button.Button', {
            text: data.get('initialized') ? 'No init App' : 'init App',
            ui: 'action-toggle',
            scale: 'medium',
            enableToggle: true,
            toggleHandler: function (btn, state) {
                btn.setText(state ? 'No init App' : 'init App');
                this.record.set('initialized', state);
                console.log(this.record.get('initialized'));
                this.record.save({
                    callback: function (records, operation, success) {
                        this.record.reload();
                    },
                    scope: this
                });
            },
            scope: this
        });
        /////////////////////////////////////////////////////////////////
        if (data.get('enabled')) {
            me.enableBtn.toggle();
        }
        
        me.templateLeft = Ext.create('Ext.Component', {
            data: data,
            padding: '0 0 0 50',
            width: 320,
            tpl: [
                '<div><span>Capability Type: </span><span>{[values.data.capabilityName]}</span></div>',
                '<div><span>Publisher Name: </span><span>{[values.data.developerAccountName]}</span></div>',
                '<div><span>Publisher Date: </span><span>{[Ext.util.Format.date(values.data.effectivesStartDate, "m/d/Y")]}</span></div>',
                '<div><span>Enabled: </span><span>{[values.data.enabled]}</span></div>'
            ]
        });
        me.templateRight = Ext.create('Ext.Component', {
            data: data,
            width: 320,
            tpl: [
                '<div><span>Initialized: </span><span>{[values.data.initialized]}</span></div>',
                '<div><span>Purchase Date: </span><span>{[Ext.util.Format.date(values.data.effectiveStartDate, "m/d/Y")]}</span></div>',
                '<div><span>License Type: </span><span>{[values.data.licenseType]}</span></div>'
            ] 
        });
        
        me.infoPanel = Ext.create('Ext.container.Container', {
                layout: 'hbox',
                items: [
                    me.enableBtn,
                    me.initBtn,
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
           
        me.configPanel = Ext.create('Ext.container.Container', {
                layout: 'hbox',
                items: [{
                    xtype: 'label',
                    text: data.get('applicationName') + ' | '
                }, {
                    xtype: 'button',
                    ui: 'button',
                    text: 'Configuration',
                    handler: function () {
                        var modal = Ext.create('Taco.core.ux.window.Window', {
                            autoShow: true,
                            scale: 'large',
                            shadow: true,
                            items: [
                                {
                                    xtype: 'uxiframe',
                                    height: '100%',
                                    //src: 'http://aus02ncfrnt002.dev.volusion.com:8080/Console/storeprofile/241/en-us'
                                    src: this.record.get('uiConfigurationUrl')
                                }
                            ],
                            listeners: {
                                close: function () {
                                    this.record.reload();
                                },
                                scope: this
                            }
                        });
                    
                    },
                    scope: me
                }]
            }
        );
        
        me.items = [
            me.infoPanel,
            me.contactIframe,
            me.configPanel];

    }
});
