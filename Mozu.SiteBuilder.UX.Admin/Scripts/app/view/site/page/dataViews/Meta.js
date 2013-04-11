/**
 * @class Taco.view.site.page.dataViews.Meta
 */
Ext.define('Taco.view.site.page.dataViews.Meta', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.core.ux.CategoryComboBox', 'Taco.core.ux.form.SlugField', 'Taco.core.ux.form.SelectField', 'Taco.core.ux.action.DirtyButton'],


    initComponent: function () {

        Ext.apply(this, this.formCfg);
        this.callParent(this);
        this.loadEditor();
    },
    formCfg:{
        defaults: {
                    xtype: 'textfield',
                    labelAlign: 'top',
                    labelSeparator: '',
                    width: 544
        },
        items: [
            {
                fieldLabel: 'Meta Title',
                name: 'meta_title'

            },
            {
                fieldLabel: 'Meta Description',
                name: 'meta_description'

            }, {
                fieldLabel: 'Link Title',
                name: 'link_title'

            },
            {
                fieldLabel: 'Hide',
                name: 'hidden',
                xtype: 'checkbox',
                inputValue:'true'

            },
            {
                fieldLabel: 'Redirect',
                input: { type: 'url' },
                name: 'redirect_url' 

            }
        ]
    },
    loadForm: function(record, noCascade) {
        this.callParent(arguments);
        this.loadEditor();
    },
    beforeSave: function () {
        var res = this.callParent(arguments);
        if (res === false) {
            return res;
        }
        //todo val check
        this.update();
        return res;
    },
    loadEditor: function () {
        var items = this.record.get('items');
        Ext.each(items, function (item) { item.id = item.key });

        this.getForm().setValues(items);
        
    },
    addSaveTasks:function() {
        console.log('ast');
    },
    update: function () {
        
        var form = this.getForm(),
            vals = form.getValues(false,false,false,true),
            record = this.record,
            fieldNames = record.fields.keys;
        Ext.Object.each(vals, function (key, val) {
            if (fieldNames.indexOf(key) == -1) {
                record.setItem(key, val);
            } else {
                record.set(key, val);
            }

        });
        

    }
   });