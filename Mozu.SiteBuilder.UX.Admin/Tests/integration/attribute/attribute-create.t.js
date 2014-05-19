StartTest(function (t) {
    
   
    Taco.core.StateManager.attemptNavigate('Attributes');

    var m = {};
    t.chain(
       function (next) {
           t.waitForComponent('Taco.view.attribute.Index', true, next);
       }
       ,
      function (next) {
          t.click('>> #createbutton');
          t.waitForComponent('Taco.view.attribute.Edit', true, next);
      },
        function (next, res) {
            m.editor = res[0];
            m.newName = t.randomStringSuffix('test name-');
          
            t.setFormValues(m.editor.form, {
                name: m.newName,
                adminName:  t.randomStringSuffix('test admin name'),
                inputType: 'TextBox'
              
            }, next);
          
        },
        function (next) {
            t.setFormValues(m.editor.form, {
                attributeType: 'Property',
                dataType: 'String'
            }, next);
        }
        ,
         function (next) {
             t.waitForEvent(m.editor.form, 'savecomplete');
             t.click('>> #save', next);

         },
        function (next) {
            var record = m.editor.record;
            t.is(record.get('name'), m.newName);
            next();
        }
        ,
        function (next) {
            var record = m.editor.record;
            record.destroy({
                callback: function (r, o) {
                    t.ok(o.success, 'destroyed record');
                    next();
                }
            });

        }
        // ,
       // function (next, res) {

       //     var inputType = m.editor.form.findField('inputType');
            
       //    t.clickSelect(inputType, 'TextBox', next);
       //}
       //,
        
        //function (next) {
        //    var record = editor.record;
        //    t.is(record.get('productName'), 'banannas');
        //}
    );



    
});