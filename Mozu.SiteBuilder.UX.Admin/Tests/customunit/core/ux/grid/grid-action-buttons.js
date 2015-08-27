StartTest(function (test) {
   // Chalupa.Core.showViewPort();

    test.wait('actionClicked');
    test.requireOk('Taco.store.Products', "Taco.core.ux.BaseGrid", function () {
        var store = Ext.create('Taco.store.Products', {
            data: [
                { productCode: '123', productName: '123' },
                { productCode: '234', productName: '234' }
            ]
        }),
    
        gridpanel = Ext.create('Taco.core.ux.BaseGrid', {
        renderTo: Ext.getBody(),
        store: store,
        enableColumnHide: true,
        disableSelection: true,
            width: 500,
        columns: [{
            xtype: 'gridcolumn',
            dataIndex: 'productName',
                text: 'Name'
        }, {
            xtype: 'gridcolumn',
            dataIndex: 'productCode',
            text: 'Code',
            hidden: false
        }],

        actions: [{
            tooltip: 'View in Store',
            iconCls: 'taco-action-hide',
            eventName: 'viewproduct'
        }, {
            tooltip: 'Duplicate Product',
            iconCls: 'taco-action-addsub',
            eventName: 'duplicateproduct'
        }, {
            tooltip: 'Delete',
            iconCls: 'taco-action-delete',
            eventName: 'deleteproduct'
        }],

        listeners: {
            deleteproduct: function (v, index, idx, action, e, record) {
                test.pass('action clicked');
                test.endWait('actionClicked');
                test.done();
            }
        }
        });

        test.waitForRowsVisible(gridpanel, function() {
            test.click('.taco-action-delete');
    });
    });
});