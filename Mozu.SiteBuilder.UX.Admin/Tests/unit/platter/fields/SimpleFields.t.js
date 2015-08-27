StartTest(function (t) {
    var m = {};
   // Ext.getDoc().first().removeCls('x-viewport')

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
            url: '/admin/app/discount/list',
            jsonFile: '/admin/tests/mocks/Mystic1/Discounts1.json'
        },
        {
            url: '/admin/app/navigation/list',
            jsonFile: '/admin/tests/mocks/Mystic1/NavigationTreeNodes1.json'
        },
        {
            url: '/admin/app/Product/edit',
            stype: 'json',
            getData: function () {
                return [
                    {
                        productName: m.newName
                    }
                ];
            },
            doPost: function () {
                return this.doGet.apply(this, arguments);
            }
        }
    ]);



    t.chain(
        function (next) {

            t.requireOk('Taco.platter.fields.SimpleFields', next);
        },
        function (next) {
            m.form = Ext.create('Ext.form.Panel', {
                title: 'Contact Info',
                width: 950,
                height:740,
                bodyPadding: 10, 
                margin:10,
                renderTo: Ext.getBody(),
                overflowY: 'scroll',
                overflowX: 'scroll',
                layout: {
                    type: 'vbox',
                    align:'stretch'
                }
            });

            
             m.form.add({
                 xtype: 'mz-input-text',
                 name: 'mz-input-text',
                 fieldLabel: 'text',
                 allowBlank: false,
                 width:600
             });
             m.form.add({
                 xtype: 'mz-input-code',
                 name: 'mz-input-code',
                 fieldLabel: 'mz-input-code',
                 allowBlank: false,
                 width: 600
             });
             m.form.add({
                 xtype: 'mz-input-date',
                 name: 'mz-input-date',
                 fieldLabel: 'mz-input-date',
                 allowBlank: false,
                 width: 600
             });
             m.form.add({
                 xtype: 'mz-input-richtext',
                 name: 'mz-input-richtext',
                 fieldLabel: 'mz-input-richtext',
                 allowBlank: false,
                 width: 600
             });
             m.form.add({
                 xtype: 'mz-input-number',
                 name: 'mz-input-number',
                 fieldLabel: 'mz-input-number',
                 allowBlank: false,
             });
             m.form.add({
                 xtype: 'mz-input-dropdown',
                 name: 'mz-input-dropdown',
                 fieldLabel: 'dropdown',
                 allowBlank:false,
                 store: [
                     ['value1','title1'],
                     [ 'value2','title2']
                 ]
             });
             m.form.add({
                 xtype: 'mz-input-image',
                 name: 'mz-input-image',
                 fieldLabel: 'mz-input-image',
             });
             m.form.add({
                 xtype: 'mz-input-image-nostyle',
                 name: 'mz-input-image-nostyle',
                 fieldLabel: 'mz-input-image-nostyle',
             });
             m.form.add({
                 xtype: 'mz-input-imageurl',
                 name: 'mz-input-imageurl',
                 fieldLabel: 'mz-input-imageurl',
             });

             m.form.add({
                 xtype: 'mz-input-product',
                 name: 'mz-input-product',
                 fieldLabel: 'mz-input-product',
             });

             m.form.add({
                 xtype: 'mz-input-productmulti',
                 name: 'mz-input-productmulti',
                 fieldLabel: 'mz-input-productmulti',
             });


             m.form.add({
                 xtype: 'mz-input-category',
                 name: 'mz-input-category',
                 fieldLabel: 'mz-input-category',
             });

             m.form.add({
                 xtype: 'mz-input-categorymulti',
                 name: 'mz-input-categorymulti',
                 fieldLabel: 'mz-input-categorymulti',
             });

             m.form.add({
                 xtype: 'mz-input-discount',
                 name: 'mz-input-discount',
                 fieldLabel: 'mz-input-discount',
             });

             m.form.add({
                 xtype: 'mz-input-discountmulti',
                 name: 'mz-input-discountmulti',
                 fieldLabel: 'mz-input-discountmulti',
             });

             m.form.add({
                 xtype: 'mz-input-navnode',
                 name: 'mz-input-navnode',
                 fieldLabel: 'mz-input-navnode',
             });

             m.form.add({
                 xtype: 'mz-input-navnodemulti',
                 name: 'mz-input-navnodemulti',
                 fieldLabel: 'mz-input-navnodemulti',
             });

             m.form.add({
                 xtype:'box',
                 html:'<div style="height:100px;"></div>'
                 
             });
            var date = new Date();
            var testDateStr = Ext.util.Format.date(date, "c");
           
            m.form.getForm().setValues({
                'mz-input-date': testDateStr,
                'mz-input-categorymulti':[2, 29]
            });
        

            var vals = m.form.getValues(false, false, false, true);
            var catMulti = m.form.getForm().findField('mz-input-categorymulti');
       
            t.isLessOrEqual(vals['mz-input-date'] - date, 100, ' date set correctly');
            t.waitFor(function () {
                    return Ext.Array.equals(catMulti.getValue(), [2, 29]);
                },
                next,
                2000);
            



        });
});