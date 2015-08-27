StartTest(function (t) {
    var m = {};
    t.setOnlyMocks();
    t.simManager().register([
        {
            url: '/admin/app/Product/list',
            jsonFile: '/admin/tests/mocks/Mystic1/products1.json'
        },
        {
            url: '/admin/app/ProductType/read',
            jsonFile: '/admin/tests/mocks/Mystic1/ProductTypes1.json'
        },
        {
            url: '/admin/app/category/read',
            jsonFile: '/admin/tests/mocks/Mystic1/Categories1.json'
        },
        {
            url: '/admin/app/Product/edit',
            stype: 'json',
            getData:function () {
                return [
                    {
                        productName: m.newName 
                    }
                ];
            },
            doPost:function () {
                return this.doGet.apply(this, arguments);
            }
        }
    ]);
    
    t.chain(
        
        function (next) {
            Taco.core.StateManager.attemptNavigate('products');
            next();
        },
        function (next) {
            t.waitForComponent('Taco.view.product.Index', true, next);
        },
        function (next, res) {
            m.index = res[0];
            t.waitForRowsVisible(m.index.gridPanel, next);
        },
        function (next) {
            var row = t.getFirstRow(m.index.gridPanel);
            t.click(row);
            t.waitForComponent('Taco.view.product.Edit', true, next);
        },
        function (next, res) {
            m.editor = res[0];
            m.record = m.editor.record;
            m.newName = t.randomStringSuffix("banannas-", m.record.get('productName'));

            t.waitForComponentQuery( '[name=price]',m.editor, next);
        },
        function (next, res) {

            t.setFormValues(m.editor.form, {
                productName: m.newName,
                price: 56
            }, next);

        },
        function (next) {
            t.waitForEvent(m.editor.form, 'savesuccess', next);
            t.click('>> #saveActionButton');
        },
        function (next) {
            var record = m.editor.record;
            t.is(record.get('productName'), m.newName);

        }
    );


});