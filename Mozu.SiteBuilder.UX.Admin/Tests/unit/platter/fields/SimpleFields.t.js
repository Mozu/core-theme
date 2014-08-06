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
                width: 500,
                height:10000,
                bodyPadding: 10,
                renderTo: Ext.getBody(),
                overflowY: 'scroll',
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
             m.form.add({
                 xtype: 'mz-input-image',
                 name: 'image',
                 fieldLabel: 'mz-input-image',
             });
             m.form.add({
                 xtype: 'mz-input-image-nostyle',
                 name: 'imageBasic',
                 fieldLabel: 'mz-input-image-nostyle',
             });
             m.form.add({
                 xtype: 'mz-input-imageurl',
                 name: 'imageurl',
                 fieldLabel: 'mz-input-imageurl',
             });


            next();



        });
});