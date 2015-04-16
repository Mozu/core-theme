
//StartTest(function (t) {
   
    
//    Taco.core.StateManager.attemptNavigate('products');


//    var m = {};
  
//    t.chain(
//       function (next) {
//           t.waitForComponent('Taco.view.product.Index', true, next);
//       },
//       function (next, res) {
//           m.index = res[0];
//           t.waitForRowsVisible(m.index.gridPanel, next);
//       },
//       function (next) {
//           var row = t.getFirstRow(m.index.gridPanel);
//           t.click(row);
//           t.waitForComponent('Taco.view.product.Edit', true, next);
//       },
//       function (next, res) {
//           m.editor = res[0];
//           m.record = m.editor.record;
//           m.newName = t.randomStringSuffix("banannas-", m.record.get('productName'));

//           t.setFormValues(m.editor.form, {
//               productName: m.newName,
//               //     productShortDescription: t.randomStringSuffix('bla bla bla - '),
//               price: 56
//           }, next);

//           //t.waitForComponentQuery( '[name=price]',m.editor, next);
//       },

//       // function (next, res) {
//       //    t.setFormValues(m.editor.form, {
//       //        productName: m.newName,
//       //        //     productShortDescription: t.randomStringSuffix('bla bla bla - '),
//       //        price: 56
//       //    }, next);

//       //},
//        function (next) {
//            t.waitForEvent(m.editor.form, 'savecomplete', next);
//            t.click('>> #saveActionButton');

//        },
//        function (next) {
//            var record = m.editor.record;
//            t.is(record.get('productName'), m.newName);

//        }
       
//    );








//});