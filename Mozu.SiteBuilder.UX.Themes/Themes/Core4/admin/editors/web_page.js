Ext.create('Ext.form.Panel', {
    title: 'A Simple core4 page',



    // Fields will be arranged vertically, stretched to full width
    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },

    // The fields
    defaultType: 'textfield',
    items: [{
        fieldLabel: 'title',
        name: 'title',
        allowBlank: false
    }, {
        fieldLabel: 'meta_title',
        name: 'meta_title',
        allowBlank: false
    }, {
        fieldLabel: 'link_title',
        name: 'link_title',
        allowBlank: true
    }, {
        fieldLabel: 'template',
        name: 'template',
        allowBlank: true
    }, ],


    setData: function (data) {
        this.getForm().setValues(data);
        this.data = data;
    },
    getData: function () {

        var data = this.getValues(false, false, false, true);


        return Ext.applyIf(data, this.data);

    },



});