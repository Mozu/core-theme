StartTest(function (t) {
    var m = {};


    t.setOnlyMocks();
    
    t.chain(
        function (next) {
            t.diag('base image test');
            t.requireOk('Taco.core.ux.form.field.BaseImageField', next);
        },
        function (next) {
            SetupModesAndViewForCreateTests(t, next, m);
        },
        
        function (next) {

            t.subTest('bla', function (t) {
                t.chain([
                    function (next) {
                        next();
                    },
                   
                ]);

            }, next);
        },
        function (next) {
            t.subTest('bla bla ', function (t) {
                t.chain(
                    function (next) {
                       
                        next();
                      
                    }
                );

            }, next);
        });



});
function SetupModesAndViewForCreateTests (t, next, m) {

    m.imageField = Ext.create('Taco.core.ux.form.field.BaseImageField',
    {
        fieldLabel: 'steve',
        allowBlank:false,
        flex: 1,
        renderTo: Ext.getBody()
    });

    t.chain(
        function (next) {
            t.waitForComponentVisible(m.imageField, next);
        },
        //function (next) {
        //    m.itemAdder = m.form.down('#itemAdder');
        //    next();
        //},
        next);


}
