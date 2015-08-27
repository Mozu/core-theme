Ext.create('Ext.form.Panel', {
    title: 'Entity Editor',


// Fields will be arranged vertically, stretched to full width
    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },

    // The fields
    defaultType: 'textfield',


    items: [
        {
            xtype: 'taco-arrayField',
            fieldLabel: 'document Types',
            name: 'documentTypes',

        },
        {
            xtype: 'taco-arrayField',
            fieldLabel: 'document Lists',
            name: 'documentLists',

        },
        {
            xtype: 'taco-arrayField',
            fieldLabel: 'entity Lists',
            name: 'entityLists',

        }, {
            fieldLabel: 'Priority',
            name: 'priority',
            xtype: 'numberfield',
            hideTrigger: true
        }, {
            fieldLabel: 'Code',
            name: 'code',
            mode:'javascript',
            xtype: 'taco-codefield',
            height: 400
        }
    ],


    setData: function (data) {
        this.getForm().setValues(data);
        this.data = data;
    },
    getData: function () {

        var data = this.getValues(false, false, false, true);
        return Ext.applyIf(data, this.data);

    },
    getContainerData: function () {
        return false;
    }


});