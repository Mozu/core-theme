/**
 * @class  Taco.view.discount.Taco.view.couponSet.GeneratedCodeForm
 * @author Travis Johnson
 * @description Dicounts General Form
 */
Ext.define('Taco.view.couponSet.GeneratedCodeForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-couponset-general',

    requires: [
        'Taco.core.util.ExceptionWhiner'
    ],

    require: [
        'Taco.core.ux.TooltipLabel'
    ],
    ui: 'subform',
    margin: '0 0 39 0',

    title: 'Code Configuration',
    isCreateMode: false,

    initComponent: function() {
        var me = this;

        // horizontal space between fields
        var defaultFieldMargin = 50;
        // how wide should fields be that display currency amounts
        var defaultFieldWidth = 166; // 3 column width
        //widest width that will fit in an override container at the smallest browser width;
        var fullFieldWidth = (defaultFieldWidth * 3) + (2 * defaultFieldMargin);
        // field width when part of a two column layout
        var twoColumnFieldWidth = (fullFieldWidth / 2)  -  (defaultFieldMargin/2);

        Ext.tip.QuickTipManager.init();

        this.numberOfCodes = Ext.create('Ext.form.field.Number', {
            name: 'setSize',
            hideTrigger: true,
            width: twoColumnFieldWidth,
            margin: "0 50 0 0",
            fieldLabel: 'Number of Codes',
            //emptyText: '',
            minValue: 0,
            allowBlank: false
        });


        this.codePrefix = Ext.create('Ext.form.field.Text',
            Taco.core.ux.TooltipLabel.wrapConfig('couponSet.generatedCode.prefix', me,{
                name: 'couponSetCode',
                fieldLabel: "Code Prefix",
                labelAlign: 'top',
                allowBlank: true,
                enforceMaxLength: true,
                maxLength: 32,
                emptyText: 'Generated if blank',
                enableKeyEvents: true,
                regex: /^[BCDFGHJKLMNPQRSTVWXYZ1-9\$!]+$/i,
                regexText: 'Invalid character. Vowels, the number 0, and any special characters, except "$" or "!", are not allowed.',
                listeners: {
                    keyup: me.updatePreview,
                    scope: me
                }

            })
        );

        this.suggestButton = Ext.create('Ext.button.Button', {
            ui: "action",
            disabled: !me.isCreateMode,
            scale: "medium",
            margin: "41 0 0 5",
            text: "Suggest",
            handler: me.suggestPrefix,
            scope: me
        });

        this.previewCode = Ext.widget('displayfield', {
            height: 100,
            width: twoColumnFieldWidth,
            fieldStyle: {
                color: 'grey'
            },
            fieldBodyCls: 'taco-readonly-display-preview',
            value: "Enter number of codes & code prefix."
        });

        this.items = [{
                xtype: 'fieldcontainer',
                layout: 'hbox',
                width: '100%',
                items: [{
                        xtype: 'fieldcontainer',
                        layout: 'vbox',
                        width: twoColumnFieldWidth,
                        items: [
                            this.numberOfCodes,
                            {
                                xtype: 'fieldcontainer',
                                layout: 'hbox',
                                width: twoColumnFieldWidth,
                                items: [
                                    this.codePrefix,
                                    this.suggestButton
                                ]
                            }
                        ]
                    }, {
                        xtype: 'component',
                        padding: '0 50 0 0'
                    },
                    {
                        xtype: 'container',
                        layout: 'vbox',
                        width: twoColumnFieldWidth,
                        items: [{
                            xtype: 'label',
                            cls: 'x-form-item-label x-form-item-label-top',
                            text: 'Preview'
                            },
                            this.previewCode
                        ]
                    }
                ]
            }
        ];

        this.callParent(arguments);
    },

    updatePreview: function (field) {
        this.previewCode.setValue(field.getValue() + "XXXXXXXXX");
    },

    suggestPrefix: function() {
        var me = this;
        Ext.Ajax.request({
            url: '/admin/app/couponset/uniqueCode',
            success: function (response) {
                var data = Ext.JSON.decode(response.responseText);
                if (!data || !data.items) return;
                me.codePrefix.setValue(data.items.value);
                me.updatePreview(me.codePrefix);
            },
            failure: Taco.core.util.ExceptionWhiner.handleRemoteFailure
        });

    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});