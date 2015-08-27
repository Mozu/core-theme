StartTest(function (t) {
    var form1,
        form2,
        nameField,
        codeField,
        record1;

    var m = {
        initUI: function () {
            t.diag('Initialized the form');

            m.defineModel();
            
            record1 = Ext.create('Product', {
                name: 'Soccer Ball',
                code: 'SB101'
            });

            form2 = Ext.create('Taco.core.ux.form.Form', {
                items: [{
                    xtype: 'textfield',
                    id: 'test-code',
                    name: 'code'
                }]
            });

            form1 = Ext.create('Taco.core.ux.form.Form', {
                id: 'test-outer-form',
                items: [{
                    xtype: 'textfield',
                    id: 'test-name',
                    name: 'name'
                }, form2],
                record: record1,
                renderTo: Ext.getBody()
            });

            t.waitForRender(t, form1, m.afterFormRender); 
        },

        afterFormRender: function () {
            //t.diag('Form rendered');
            t.ok(form1.rendered, 'Form rendered properly');

            m.testModelBinding();

            //m.testStateChanges();
        },

        testModelBinding: function () {
            t.diag('Testing Model Binding');

            // Find Name field
            nameField = Ext.ComponentManager.get('test-name');

            t.ok(nameField.getValue() === record1.get('name'), 'Model loaded direct field correctly');

            // Find Code field
            codeField = Ext.ComponentManager.get('test-code');

            t.ok(codeField.getValue() === record1.get('code'), 'Model loaded descendant form field correctly');

        },

        testStateChanges: function () {
            t.diag('Testing State Changes');

            t.ok(!form1.getSavableState(), 'Outer form is not yet savable');
            form1.on({
                savablestatechange: function (c, s) { t.diag('statechange ' + s)}
            });
            
            t.waitForEvent('#test-outer-form', 'savablestatechange', function (cmp, newState) {
                t.ok(newState, '"Name" field changed, form is now savable');
            });

            nameField.setValue(record1.get('name') + '1');
        },

        defineModel: function () {
            Ext.define('Product', {
                extend: 'Ext.data.Model',
                fields: [
                    {name: 'name', type: 'string'},
                    {name: 'code', type: 'string'}
                ]
            });
        }


    };

    t.requireOk('Taco.core.ux.form.Form', function () {
        m.initUI();
    });
});