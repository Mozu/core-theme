/**
 * @class  Taco.view.account.RoleForm
 * category form
 */
Ext.define('Taco.view.category.Form', {
    extend: 'Taco.view.product.subform.Subform',
    editTitle: 'Edit category',
    createTitle: 'Create a category',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    defaults: {
        xtype: 'textfield',
        labelAlign: 'top',
        labelSeparator: '',
        componentCls: 'taco-form-field-float' //,
        //,width: 500
    },
    items: [{
        name: 'name',
        fieldLabel: 'Category Name',
        allowBlank: false,
        maxLength: 80,
        enforceMaxLength: true
    }, {
        xtype: 'categorycombobox',
        name: 'parentId',
        fieldLabel: 'Assign to Other Category',
        validator: function (value) {
            if (value == this.up().child('component[name="name"]').value) {
                return 'Category name is in use';
            } else {
                return true;
            }
        }
    }, {
        xtype: 'textarea',
        rows: '10',
        name: 'description',
        fieldLabel: 'Description' //,
        //  width: 532
    }, {
        name: 'slug',
        fieldLabel: 'SEO Friendly URL',
        xtype: 'slugfield',
        slugPrefix: 'www.mystore.com/category/'
    }, {
        name: 'code',
        fieldLabel: 'Page Code'
    }, {
        name: 'pageTitle',
        fieldLabel: 'Page Title'
    }, {
        name: 'metaTitle',
        fieldLabel: 'Meta Title'
    }, {
        name: 'metaDescription',
        fieldLabel: 'Meta Description'
    }, {
        name: 'metaKeywords',
        fieldLabel: 'Keywords'
    }, {
        name: 'isHidden',
        xtype: 'checkboxfield',
        boxLabel: 'Hide Category'
    }
    ],
    initComponent: function () {
        this.callParent(arguments);
    },
});