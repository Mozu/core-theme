
/**
 * @class Taco.view.filter.EditCodeModal.js
 */

Ext.define('Taco.view.filter.EditCodeModal', {
    extend: 'Taco.core.ux.window.Drawer',
    requires: [
        'Taco.core.ux.form.field.Code'
    ],

    config: {
        type:null
    },

    entityId: null,

    record: null,

    title: "Manualy Edit Expression",

    autoShow: true,

    data: null,

    height: '95%',

    scale: 'large',

    width: '95%',

    layout: 'fit',

    showValidateButton: true,

    initComponent: function(eOpts) {
        var me = this,
            data;
        
        var treeData =this.encodeTree(this.data.tree);

        // need to initialize this since we will need to get the text code regardless when the tabs change.
        // The only time that this.requiresValidataion will be false is right after a validation;
        this.requiresValidation = true;

        this.codeField = Ext.create('Taco.core.ux.form.field.Code', {
            width: "100%",
            mode: "json",
            useWrapMode: false,
            fontSize: "13px",
            value: treeData,
            name: "expression",
            showPrintMargin: false,
            selectOnRender:false,
            listeners: {
                scope: me,
                escKey: function() {
                    console.log("esc");
                    //todo: try and figure out a way to make the code field keyboard accessable;
                    // for now just pass focus to the validate button 
                    this.validateButton.focus();
                },
                change: function (field, newValue, oldValue, e) {
                    if (!this.requiresValidation) {
                        this.requiresValidation = true;
                    }
                }
                //,
                //editorready: function(field, editor) {
                //    editor.clearSelection();
                //}
            }
        });

        this.textField = Ext.create('Taco.core.ux.form.field.Code', {
            mode: "text",
            useWrapMode: false,
            fontSize: "13px",
            value: "",
            name: "textExpression",
            showPrintMargin: false,
            selectOnRender: false,
            listeners: {
                scope: me,
                escKey: function () {
                    console.log("esc");
                    //todo: try and figure out a way to make the code field keyboard accessable;
                    // for now just pass focus to the validate button 
                    this.validateButton.focus();
                },
                change:function(field, newValue, oldValue, e) {
                    if (!this.requiresValidation) {
                        this.requiresValidation = true;
                    }
                },
                editorready: function(field, editor) {
                    editor.clearSelection();
                }
            }
        });

        this.items = [
            {
                xtype: 'tabpanel',
                itemId:"tabPanel",
                layout: 'fit',
                listeners: {
                    scope: me,
                    beforetabchange:this.onTabChange
                },
                items: [
                    {
                        title: "Tree",
                        itemId:"treeCode",
                        layout: 'fit',
                        items: [this.codeField]
                    },
                    {
                        title: "Text",
                        itemId: "textCode",
                        layout: 'fit',
                        items: [this.textField]
                    }
                ]
            }
        ];

        this.callParent(arguments);

        this.mon(this, 'boxready', function() {
            if (me.showValidateButton) {
                var actionBar = this.down('#actionBar');
                actionBar.insert(0, "->");
                this.validateButton = actionBar.insert(0,{
                    text: "Validate",
                    xtype: "button",
                    ui: "action",
                    scale: "medium",
                    handler: function(button) {
                        this.validateCode(null, function() {
                            Ext.MessageBox.show({
                                title: 'Validation',
                                // pushes the buttons to the right to be consistant with our dialog ux.
                                rightJustifyButtons: true,
                                // reverses the order of the buttons
                                reverseOrder: true,
                                msg: 'Your code is valid',
                                closable: true,
                                buttons: Ext.Msg.OK,
                                fn: function(rec) {
                                    button.focus();
                                }
                            });
                        },button);
                    },
                    scope: me
                });
            }
        },me);
    },

    encodeTree: function (data) {
        var treeData = data;

        try {
            
            if (JSON && JSON.stringify) {
                treeData = JSON.stringify(data, null, '\t');
            } else {
                treeData = Ext.JSON.encode(data);
            }
        } catch (e) {
            Taco.app.fireEvent('setmessage', "Text is not a valid JSON", 'error');
            return null;
        }
        return treeData;
        
    },


    decodeTree: function (data) {
        var treeData = data;

        try {
            treeData = Ext.JSON.decode(data);
            
        } catch (e) {
            Taco.app.fireEvent('setmessage', "The tree text is not a valid JSON. Please check your code and try again", 'error');
            return null;
        }
        return treeData;
    },

    onTabChange: function(tabPanel, newCard, oldCard, e) {
        // need to validate the data on tab change if the content of the active tab has change since last validation;
        // check to see if we have any data worth validating. ie empty string or root with no nodes.

        if (this.requiresValidation) {
            var codeTxt = oldCard.down('.taco-codefield').getValue();
            if (!codeTxt) {
                return true;
            }

            if (oldCard.getItemId() == "treeCode") {
                var json = this.decodeTree(codeTxt);
                if (!json || !json.nodes || !json.nodes.length) {
                    // bypass validation nothing to validate;
                    return true;
                }
            }

            this.validateCode(oldCard, function(data) {
                // callback when the validation returns so we can allow the tab change to happen
                
                // change the tabs
                this.requiresValidation = false;
                tabPanel.setActiveTab(newCard);
            });
            // cancel the tab change so we can wait for the callback from the services
            return false;
        } 
        
        // can allow tab change now that both fields have been updated
        return true;
    },

    validateCode: function (tab, callback, cmp) {
        var me = this,
            tabPanel;
        
        // figure out which tab is active.
        if (!tab) {
            tabPanel = this.down('#tabPanel');
            tab = tabPanel.getActiveTab();
        }

        // get active tab panel's field value and call service to check its validity.the response will include the tree and text value.
        var codeField = tab.down('.taco-codefield');
        var codeTxt = codeField.getValue();

        var jsonData = {
            type:this.getType()
        }
        
        if (tab.getItemId() == "treeCode") {
            var treeData =this.decodeTree(codeTxt);
            if (!treeData) {
                // error state;
                return;
            }
            jsonData.tree = treeData;

        } else {
            jsonData.text = codeTxt;
        }

        var config = {
            url: '/admin/app/category/validateexpression',
            method: 'POST',
            jsonData: jsonData,
            success: function (response) {
                
                //Taco.app.viewPort.setLoading(false);

                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    var msg = (config.errorMsg) ? config.errorMsg : "Error";
                    Taco.app.fireEvent('setmessage', msg, 'error');
                    this.setLoading(false);
                    return;
                }
                
                var treeData = this.encodeTree(json.items.tree);

                this.codeField.setValue(treeData);
                this.textField.setValue(json.items.text);

                if (callback) {
                    callback.apply(me, [json]);
                }

                this.setLoading(false);
            },
            failure: function (response) {
                //Taco.app.viewPort.setLoading(false);
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : (config.errorMcallsg) ? config.errorMsg : "Error";
                Taco.app.fireEvent('setmessage', msg, 'error');
                this.setLoading(false);
            },
            scope: this
        };
        
        this.setLoading("Loading...");
        Ext.Ajax.request(config);
    },

    onValidateSuccess:function(data) {
        
    },

    onValidateFailure: function (data) {

    },

    doSave: function () {
        var me = this;
        if (me.requiresValidation) {
            
            me.validateCode(null, function (data) {
                me.requiresValidation = false
                me.doSave();
            });

            return false;
        }
        // validate the data in the codeField locally

        // call to validate the data against the service;
        var codeText = this.codeField.getValue();
        var json = this.decodeTree(codeText);

        this.saveSuccess(json);
    },

    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy : function (destroy) {
        this.callParent(arguments);
    }
});
