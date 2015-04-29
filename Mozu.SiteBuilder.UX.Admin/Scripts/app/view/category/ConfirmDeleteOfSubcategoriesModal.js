/**
 * @class Taco.view.category.ConfirmDeleteOfSubcategoriesModal
 */

Ext.define('Taco.view.category.ConfirmDeleteOfSubcategoriesModal', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Ext.form.field.Checkbox'
    ],

    autoShow: true,
    closeAction: 'destroy',
    scale: "",
    height: 320,
    width: 400,
    layout: {
        type: 'fit'
    },

    //customize
    title: 'Delete',
    confirmMessage: 'Are you sure you want to delete this record?',
    primaryText: 'OK',
    onDeleteIt: Ext.emptyFn,
    record: null,
    
    initComponent: function() {
        var me = this,
            subcategoryText = (this.record.get('childCount') > 1 ? 'subcategories' : 'subcategory'),
            tooltipKey = Ext.util.Format.format('category.confirmDelete.delete{0}',(this.record.get('childCount') > 1 ? 'Categories' : 'Category')),
            childCountMsg = Ext.util.Format.format('{0} ({1}) contains {2} {3}.',
                                                    this.record.get('name'),
                                                    this.record.get('categoryCode'),
                                                    this.record.get('childCount'),
                                                    subcategoryText);

        this.deleteSingleCategory = Ext.widget(
            Taco.core.ux.TooltipLabel.wrapConfig(tooltipKey, me, {
                xtype: 'radio',
                name: 'cascadeDeleteType',
                persistSelectedValueOnly: true,
                boxLabel: Ext.util.Format.format('Delete {0} ({1}) only.', this.record.get('name'), this.record.get('categoryCode')),
                inputValue: "single",
                width: 300,
                checked: true
            })
        );

        this.deleteMultipleCategories = Ext.widget({
            xtype: 'radio',
            name: 'cascadeDeleteType',
            persistSelectedValueOnly: true,
            boxLabel: Ext.util.Format.format('Delete {0} ({1}) and its {2}.', this.record.get('name'), this.record.get('categoryCode'), subcategoryText),
            inputValue: "multiple",
            width: 300,
            checked: false
        });

        me.items = [
            {
                xtype: 'container',
                items: [
                    {
                        xtype: 'label',
                        text: me.confirmMessage,
                        margin: '10 0 0 0'
                    }, {
                        xtype: 'container',
                        layout: {
                            type: 'hbox',
                            align: 'left'
                        },
                        margin: '20 0 20 0',
                        items: [{
                                xtype: 'panel',
                                title: ' ',
                                glyph: 'XE02F@mozicons',
                                width: 20,
                                margin: '0 5 0 0'
                            }, {
                                xtype: 'label',
                                text: childCountMsg,
                                flex: 1
                            }
                        ]
                    },
                    this.deleteSingleCategory,
                    this.deleteMultipleCategories
                ]
            }
        ];

        me.callParent(arguments);
    },

    doSave: function () {
        var cascadeDelete = this.deleteMultipleCategories.getValue();
        this.onDeleteIt(this, cascadeDelete);
        this.saveSuccess(cascadeDelete);
    }
});
