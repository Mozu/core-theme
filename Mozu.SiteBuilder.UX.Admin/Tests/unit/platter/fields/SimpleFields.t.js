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
                 name: 'text',
                 fieldLabel: 'text',
                 allowBlank: false,
             });
             m.form.add({
                 xtype: 'mz-input-dropdown',
                 name: 'dropdown',
                 fieldLabel: 'dropdown',
                 allowBlank:false,
                 store: [
                     ['value1','title1'],
                     [ 'value2','title2']
                 ]
             });
             m.form.add({
                 xtype: 'mz-input-image',
                 name: 'image',
                 fieldLabel: 'mz-input-image',
             });
             m.form.add({
                 xtype: 'mz-input-image-nostyle',
                 name: 'imageBasic',
                 fieldLabel: 'mz-input-image-nostyle',
             });
             m.form.add({
                 xtype: 'mz-input-imageurl',
                 name: 'imageurl',
                 fieldLabel: 'mz-input-imageurl',
             });

             m.form.add({
                 xtype: 'mz-input-product',
                 name: 'product',
                 fieldLabel: 'mz-input-product',
             });

             m.form.add({
                 xtype: 'mz-input-productmulti',
                 name: 'productmulti',
                 fieldLabel: 'mz-input-productmulti',
             });


             m.form.add({
                 xtype: 'mz-input-category',
                 name: 'category',
                 fieldLabel: 'mz-input-category',
             });

             m.form.add({
                 xtype: 'mz-input-categorymulti',
                 name: 'category',
                 fieldLabel: 'mz-input-categorymulti',
             });

             m.form.add({
                 xtype: 'mz-input-discount',
                 name: 'discount',
                 fieldLabel: 'mz-input-discount',
             });

             m.form.add({
                 xtype: 'mz-input-discountmulti',
                 name: 'discount',
                 fieldLabel: 'mz-input-discountmulti',
             });

             m.form.add({
                 xtype:'box',
                 html:'<div style="height:100px;"></div>'
                 
             });

            next();



        });
});