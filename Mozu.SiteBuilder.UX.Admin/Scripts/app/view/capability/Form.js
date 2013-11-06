Ext.define('Taco.view.capability.Form', {
    extend: 'Ext.panel.Panel',
   // alias: 'widget.taco.customer.subform',
    width: 960,
    ui: 'subform',
    bodyPadding: '19 0',
    margin: '0 0 20 0',
    requires: [
        'Taco.store.Capability'
    ],

    title: 'Applications',

    initComponent: function () {
     
        this.title = this.record.get('applicationName');
        this.buildFormComponents();
        this.callParent(arguments);
    },

    buildFormComponents: function () {
        var me = this,
             data = this.record;

        console.log(data);

        me.enableBtn = Ext.create('Ext.button.Button', {
            name: 'enabled',
            text: 'Enable App',
            ui: 'button'
        });

        me.items = [{
            xtype: 'container',
            layout: 'hbox',
            items: [me.enableBtn,
                {
                xtype: 'component',
                renderData: data,
                renderTpl: [
                    '<div><span>Capability Type: </span><span>{[values.data.capabilityTypeName]}</span></div>',
                    '<div><span>Publisher Name: </span><span>{[values.data.publisherName]}</span></div>',
                    '<div><span>Publisher Date: </span><span>{[values.data.id]}</span></div>',
                    '<div><span>Enabled: </span><span>{[Ext.util.Format.date(values.data.effectiveStartDate, "m/d/Y")]}</span></div>'
                ]
            }, {
                xtype: 'component',
                renderData: data,
                renderTpl: [
                   '<div><span>Initialized: </span><span>{[values.data.initialized]}</span></div>',
                    '<div><span>Purchase Date: </span><span>{[Ext.util.Format.date(values.data.effectiveStartDate, "m/d/Y")]}</span></div>',
                    '<div><span>License Type: </span><span>{[values.data.licenseType]}</span></div>'
                ]
            }]
        }, {
            xtype: 'uxiframe',
            src: 'http://aus02ncfrnt002.dev.volusion.com:8080/Console/storeprofile/241/en-us'
            //src: data.get('uiSupportUrl')  
        }];


    }
});
