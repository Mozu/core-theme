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

            t.click(createCmp.getEl(), m.createTextBox, m);
        },

        createTextBox: function () {
            t.diag('Create Clicked');

            m.form = Taco.app.contentView.down('formform');

            t.setFormValues(m.form, {
                name: 'Test name',
                inputType: 'Text box',
                attributeType: 'Extra'
            }, function () {
                t.ok(m.form, 'Form is set');
            }, 1000);
        }
    };

    m.init();
    
});