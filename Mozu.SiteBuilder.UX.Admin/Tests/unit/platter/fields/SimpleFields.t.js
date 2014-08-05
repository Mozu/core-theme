StartTest(function (t) {
    var m = {};


    t.setOnlyMocks();


    t.chain(
        function (next) {

            t.requireOk('Taco.platter.fields.SimpleFields', next);
        },
        function (next) {
            m.form = Ext.create('Ext.form.Panel', {
                title: 'Contact Info',
                width:500,
                bodyPadding: 10,
                renderTo: Ext.getBody(),
                layout: {
                    type: 'vbox',
                    align:'stretch'
                }
            });

            
             m.form.add({
                 xtype: 'mz-input-text',
                 name: 'text',
                 fieldLabel: 'text',
                 allowBlank: false,
             });
             m.form.add({
                 xtype: 'mz-input-dropdown',
                 name: 'dropdown',
                 fieldLabel: 'dropdown',
                 allowBlank:false,
                 store: [
                     ['value1','title1'],
                     [ 'value2','title2']
                 ]
             });

            next();



        });
});