
StartTest(function (test) {
    test.wait('productEditLoaded');
    test.wait('dirtyButtonChanged');
    Taco.core.StateManager.attemptNavigate('products');

    var prodIndex = Taco.app.viewPort.down('prodindex');

  
    test.waitForRowsVisible(prodIndex.gridpanel, function() {
        test.click('.taco-launch-editor', function() {
            var productEdit = Taco.app.viewPort.down('productedit');
            test.ok(productEdit, 'Product edit loaded');

            var db = productEdit.down('dirtybutton');
            test.endWait('productEditLoaded');

            var formPanel = productEdit.down('form'),
            form = formPanel.getForm(),
            packageWeight = form.findField('packageWeight'),
            val = packageWeight.getValue();

            if (val) {
                packageWeight.setValue(parseFloat(val)+1);
            } else {
                packageWeight.setValue(10);
            }

            setTimeout(function() {
                test.ok(db.isDirty(), 'dirty button');
                test.endWait('dirtyButtonChanged');
                test.click(db, function() {
                test.done();
                });
            }, 1000);            
        });
    });
});