/**
 * @class Taco.view.site.page.dataViews.Blog
 */
Ext.define('Taco.view.site.page.dataViews.Blog', {
    extend: 'Ext.form.Panel',
    requires: ['Taco.core.ux.CategoryComboBox', 'Taco.core.ux.form.SlugField', 'Taco.core.ux.form.SelectField', 'Taco.core.ux.action.DirtyButton'],

    style: { backgroundColor: '#F2F0ED', padding: '10px' },
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    trackResetOnLoad: true,
    minWidth: 300,

    // The fields
    defaults: {
        xtype: 'textfield',
        labelAlign: 'top',
        labelSeparator: '',
        //componentCls: 'taco-form-field-float',
        width: 250
    },
    items: [{
        fieldLabel: 'Author\'s Name',
        name: 'author'
        //allowBlank: false
    }, {
        fieldLabel: 'Number of Posts on Page',
        name: 'numOfPosts',
        xtype: 'slider',
        value: 5,
        minValue: 1,
        maxValue: 20,
        increment: 1
    }, {
        fieldLabel: 'Post Format',
        name: 'postListFormat',
        xtype: 'combo',
        mode: 'local',
        store: [['expandLatest', 'Expand Latest Post'], ['collapsed', 'Collapse All Posts']]
    }, {
        fieldLabel: 'Enable Share Buttons on the bottom of your posts',
        xtype: 'checkbox',
        name: 'enableShare'
        //labelAlign: 'left',
        //allowBlank: false
    }],

    initComponent: function () {
        var me = this,
            formData;
        me.on('dirtychange', function () {
            var ogCfg = me.record.getItem('page_configuration', true) || [],
                formCfg = me.getForm().getValues();

            if (Ext.encode(ogCfg) != Ext.encode(formCfg)) {
                
                me.record.setItem('page_configuration', formCfg, true);
            }
            //resets dirty state
            me.getForm().setValues(formCfg);
        });

        formData = me.record.getItem('page_configuration', true) || {};

        me.callParent(arguments);
        me.getForm().trackResetOnLoad = true;
        me.getForm().setValues(formData);
        //
    }
});