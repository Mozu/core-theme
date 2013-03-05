StartTest(function (t) {
    
    Chalupa.Core.applyHelpers(t);

    var m = {
        init: function () {
            t.setContext('collection');

            t.loadIndex('Attributes', m.onIndexLoad, m);
        },

        onIndexLoad: function () {
            t.diag('Index Rendered');

            //t.indexCmp
            var createCmp = t.indexCmp.query('primaryaction')[0];

            t.ok(createCmp, 'Create button found');

            t.click(createCmp.getEl(), m.onCreateClick, m);
        },

        onCreateClick: function () {
            t.diag('Create Clicked');

            m.createStaticFields();

            t.waitForRender(m.inputType, m.createTextBox);
        },

        createStaticFields: function () {
            t.diag('Check static fields');

            m.form = Taco.app.contentView.down('formform');

            t.ok(m.form, 'Form exists');

            m.name = m.form.findField('name');

            t.ok(m.name, 'Name field found');

            m.inputType = m.form.findField('inputType');

            t.ok(m.inputType, 'InputType field found');

        },

        createTextBox: function () {
            t.diag('Create Text Box Attribute');



            t.type(m.name.inputEl, 'Test Text Box Attribute Name', function () {
                t.ok(m.inputType, 'Input Type field found');
                t.ok(m.inputType.rendered, 'done');
                t.clickSelect(m.inputType, 'Text box');

                t.waitFor(function () {
                    m.attributeType = m.form.findField('attributeType');
                    return m.attributeType;
                }, function () {

                    t.ok(m.attributeType, 'AttributeType found');

                    t.clickSelect(m.attributeType, 'Extra');

                    m.dataType = m.form.findField('dataType');

                    t.clickSelect(m.dataType, 'Text');

                });

            });
        }
    };

    m.init();
    
});