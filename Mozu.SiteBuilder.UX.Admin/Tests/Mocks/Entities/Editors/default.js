Ext.create('Ext.form.Panel', {
    title:false,



    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },

    // The fields
    defaultType: 'textfield',
    items: [],


    setData: function (data) {
    

        Ext.Object.each(data, function (k, v) {
            var editor;
            if (Ext.isArray(v)) {
                editor = {
                    xtype: 'boxselect',
                    fieldLabel: k,
                    name: k,
                    store: [],
                    value: v,
                    "queryMode": 'local',
                    "forceSelection": false,
                    "createNewOnEnter": true,
                    "createNewOnBlur": true

                };
            } else if (!Ext.isObject(v)) {
                editor = {
                    xtype: 'textfield',
                    name: k,
                    value: v,
                    fieldLabel: k
                };

            }
            if (editor) {
                if (Ext.isArray(this.items)) {
                    this.items.push(editor);
                } else {
                    this.add(editor);
                }
            }


        }, this);

        this.data = data;
    },
    getData: function () {

        var data = this.getValues(false, false, false, true);


        return Ext.applyIf(data, this.data);

    }


});