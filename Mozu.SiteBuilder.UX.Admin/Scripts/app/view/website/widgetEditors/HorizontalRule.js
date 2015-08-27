// still used by core 4
//depricated
Ext.define('Taco.view.website.widgetEditors.HorizontalRule', {
    extend: 'Taco.view.website.WidgetEditor',
    requires: [
        'Taco.core.ux.ColorPicker',
        'Taco.core.ux.form.ColorField'
    ],
    alias: 'widget.taco-horizontalrule-widgeteditor',

    title: 'Horizontal Rule',

    width: 480,

    initComponent: function () {
        var me = this;

        this.form = Ext.create('Taco.core.ux.form.Form', {
            defaults: {
                xtype: 'combobox',
                editable: false,
                listeners: {
                    change: {
                        fn: me.updatePreview,
                        scope: me
                    }
                }
            },
            items: [{
                fieldLabel: 'Thickness',
                name: 'hrBorderWidth',
                store: ['1px', '2px', '3px', '4px', '5px', '6px', '7px', '8px', '9px', '10px', '11px', '12px', '13px', '14px', '15px', '16px', '17px', '18px', '19px', '20px']
            }, {
                xtype: 'colorfield',
                fieldLabel: 'Color',
                name: 'hrBorderColor'
            }, {
                xtype: 'radiogroup',
                fieldLabel: 'Style',
                defaults: {
                    name: 'hrBorderStyle'
                },
                items: [{
                    inputValue: 'solid',
                    boxLabel: 'solid'
                }, {
                    inputValue: 'dashed',
                    boxLabel: 'dashed'
                }, {
                    inputValue: 'dotted',
                    boxLabel: 'dotted'
                }]
            }, {
                fieldLabel: 'Spacing Above',
                name: 'hrMarginTop',
                store: [['0px', 'None'], ['4px', 'Small (4px)'], ['8px', 'Medium (8px)'], ['12px', 'Large (12px)']]
            }, {
                fieldLabel: 'Spacing Below',
                name: 'hrMarginBottom',
                store: [['0px', 'None'], ['4px', 'Small (4px)'], ['8px', 'Medium (8px)'], ['12px', 'Large (12px)']]
            }, {
                xtype: 'component',
                width: '100%',
                padding: 0,
                html: 'Preview',
                cls: 'x-form-item-label-top'
            }, {
                xtype: 'container',
                width: '100%',
                padding: '20 0 20 0',
                itemId: 'preview-container',
                cls: Taco.baseCSSPrefix + 'hr-preview',
                items: [{
                    xtype: 'component',
                    itemId: 'preview',
                    autoEl: 'hr'
                }]
            }]
        });

        this.callParent(arguments);

        me.mon(
            me.form,
            'afterrender',
            me.updatePreview,
            me
        );
    },

    updatePreview: function () {
        // console.log('preview?', form.getComponent('preview-container').getComponent('preview'), field.name, newVal, oldVal);
        // console.log("form values:", me.form.getForm().getValues());
        // console.log('updatePreview:', this, arguments);

        var previewEl = this.down('#preview').getEl(),
            formValues = this.form.getForm().getValues(),
            newStyles = {};

        if (previewEl) {
            newStyles['border-top-width'] = formValues.hrBorderWidth;
            newStyles['border-color']     = formValues.hrBorderColor;
            newStyles['border-style']     = formValues.hrBorderStyle;
            newStyles['margin-top']       = formValues.hrMarginTop;
            newStyles['margin-bottom']    = formValues.hrMarginBottom;

            previewEl.applyStyles(newStyles);
        }
    }
});
