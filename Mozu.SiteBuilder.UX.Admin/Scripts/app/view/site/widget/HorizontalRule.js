/**
 * @author Michael Speed Elder
 * Date: 9/10/12
 * Time: 12:17 PM
 * @class Taco.view.site.widget.HorizontalRule
 * Widget editor for a horizontal rule
 */
Ext.define('Taco.view.site.widget.HorizontalRule', {
    extend: 'Taco.view.site.widget.Editor',
    requires: [
        'Taco.core.ux.ColorPicker',
        'Taco.core.ux.form.ColorField'
    ],

    title: 'Horizontal Rule',
    // instructionText: 'Customize the horizontal rule with the options below.',

    width: 480,
    // autoSize: false,

    initComponent: function () {
        var me = this;
            me.flex = Ext.create('Ext.Container', {
            cls: Taco.baseCSSPrefix + 'hr-widget-container',
            defaults: {
                xtype: 'combobox',
                editable: false,
                labelAlign: 'top',
                labelSeparator: '',
                width: 120,
                padding: '0 20 20 0',
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
                    name: 'hrBorderStyle',
                    boxLabelCls: 'taco-hr-line-style-label'
                },
                layout: 'vbox',
                items: [{
                    inputValue: 'solid'
                    , boxLabel: '<span class="taco-hr-line-style"></span>'
                }, {
                    inputValue: 'dashed'
                    , boxLabel: '<span class="taco-hr-line-style" style="border-style: dashed;"></span>'
                }, {
                    inputValue: 'dotted'
                    , boxLabel: '<span class="taco-hr-line-style" style="border-style: dotted;"></span>'
                }]
            }, {
                fieldLabel: 'Spacing Above',
                name: 'hrMarginTop',
                store: ['None', 'Small (4px)', 'Medium (8px)', 'Large (12px)']
            }, {
                fieldLabel: 'Spacing Below',
                name: 'hrMarginBottom',
                store: ['None', 'Small (4px)', 'Medium (8px)', 'Large (12px)']
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

        me.mon(
            me.flex,
            'afterrender',
            me.updatePreview,
            me
        );

        this.fields = [me.flex];

        this.callParent( arguments );
    },

    updatePreview: function () {
        // console.log('preview?', form.getComponent('preview-container').getComponent('preview'), field.name, newVal, oldVal);
        // console.log("form values:", me.form.getForm().getValues());
        // console.log('updatePreview:', this, arguments);

        var previewEl = this.flex.getComponent('preview-container').getComponent('preview').getEl(),
            formValues = this.form.getForm().getValues(),
            newStyles = {},
            marginMap = {
                'None': 0,
                'Small (4px)': '4px',
                'Medium (8px)': '8px',
                'Large (12px)': '12px'
            };

        if( previewEl ) {
            newStyles['border-top-width'] = formValues['hrBorderWidth'];
            newStyles['border-color']     = formValues['hrBorderColor'];
            newStyles['border-style']     = formValues['hrBorderStyle'];
            newStyles['margin-top']       = marginMap[ formValues['hrMarginTop'] ];
            newStyles['margin-bottom']    = marginMap[ formValues['hrMarginBottom'] ];

            previewEl.applyStyles( newStyles );
        }
    },

    initWidgetConfig: function () {
        return {
            'hrBorderWidth': '1px',
            'hrBorderColor': '#000',
            'hrBorderStyle': 'solid',
            'hrMarginTop': 'None',
            'hrMarginBottom': 'None'
        };
    }
});
