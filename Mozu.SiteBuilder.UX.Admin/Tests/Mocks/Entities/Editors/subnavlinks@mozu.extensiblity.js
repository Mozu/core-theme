Ext.create('Ext.form.Panel', {
    title: 'Sub Nav Link Editor',
    requires: ['Ext.data.UuidGenerator', 'Ext.window.MessageBox'],


    // Fields will be arranged vertically, stretched to full width
    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },

    // The fields
    defaultType: 'textfield',
    items: [
        {
            fieldLabel: 'parentId',
            xtype: 'combobox',
            name: 'parentId',
            queryMode: 'local',
            store: ['customers', 'catalog', 'orders', 'marketing', 'sitebuilder', 'settings', 'locations', 'publishing', 'reports'],
            allowBlank: false,
            editable: false
        }, {
            fieldLabel: 'Path',
            name: 'path',
            xtype: 'boxselect',
            delimiter: '/',
            store: [],
            queryMode: 'local',
            forceSelection: false,
            createNewOnEnter: true,
            createNewOnBlur: true,
        }, {
            name: 'href',
            fieldLabel: 'Href'

        }, {
            name: 'appId',
            fieldLabel: 'Application Id'
        }, {
            fieldLabel: 'windowTitle',
            name: 'windowTitle'
        }
    ],


    setData: function (data) {
        data.guid = data.guid || Ext.data.IdGenerator.get('uuid').generate();

        this.getForm().setValues(data);
        this.data = data;
    },
    getData: function () {

        var data = this.getValues(false, false, false, true);

        return Ext.applyIf(data, this.data);

    },


});