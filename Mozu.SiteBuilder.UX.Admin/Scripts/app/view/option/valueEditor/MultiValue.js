/**
 * @author Travis Johnson
 * @class Taco.view.option.valueEditor.MultiValue
 */


    Ext.define('Taco.view.option.valueEditor.MultiValue', {
        extend: 'Ext.container.Container',
        alias: 'widget.optionvalueeditor',
        
        requires: ['Taco.core.ux.ComplexDataView'],
        mixins: {
            field: 'Ext.form.field.Field'
        },
        editMode: false,
        
        config: {
            dataType:'string'
        },
        initComponent: function() {
            var me = this,
                tpl;
            
            this.dirtyState = false;
            this.validState = true;
            
            if (this.editMode) {
                tpl = [
                    '<tpl for=".">', 
                        '<div class="taco-option-value-row">',
                            '<input class="taco-option-value-input" type="text" value="{value}" placeholder="{placeholder}" readonly="readonly">',
                            '<span class="checkbox"><input type="checkbox" name="selected-option-values"></span>',
                        '</div>', 
                    '</tpl>'
                ];
            } else {
                tpl = [
                    '<tpl for=".">', 
                        '<div class="taco-option-value-row">',
                            '<input class="taco-option-value-input" type="text" value="{value}" placeholder="{placeholder}">',
                            '<span class="remove">x</span>',
                        '</div>',
                    '</tpl>'
                ];
            }

            this.items = [{
                xtype: 'complexdataview',
                cls: 'taco-option-value-view',
                tpl: tpl,
                itemSelector: 'div.taco-option-value-row',
                loadMask: false,
                store: this.store
            }, {
                xtype: 'action',
                text: '+ Add Another Value',
                click: function() {
                    me.addAnotherValue();
                }
            }];

            this.callParent(arguments);

            this.dataView = this.down('dataview');
            
            this.dataView.customEvents.push({
                selector: 'input.taco-option-value-input',
                blur: {
                    fn: this.inputBlur,
                    scope: this
                },
                keyup: {
                    fn: this.inputKeyup,
                    scope: this
                }
            });
            
            this.dataView.customEvents.push({
                selector: 'span.remove',
                click: {
                    fn: this.clickRemove,
                    scope: this
                }
            });
            
            this.dataView.on({
                beforeupdate: {
                    fn: this.beforeUpdate,
                    scope: this
                }
            });
        },
        
        focus: function () {
            //window.el = this.dataView.getEl();
            if (!this.dataView.getEl().down('input[type=text]')) {
                return;
            }
            this.dataView.getEl().down('input[type=text]').focus(1);
            this.fireEvent('focus', this);
        },
        convertValue:function (value) {
            if (this.getDataType() == 'number') {
                return value !== undefined && value !== null && value !== '' ?
                    parseFloat(String(value).replace(Ext.data.Types.stripRe, ''), 10) : null;
            }
            return value;
        },
        bindStore: function(store) {
            var storeBinding;
            this.store = store;

            this.dataView.bindStore(store);
            
            storeBinding = {
                fn: this.dirtyCheck,
                scope: this
            };
            
            store.on({
                add: storeBinding,
                update: storeBinding,
                remove: storeBinding
            });

            Ext.defer(function () {
               
                this.doLayout();
            }, 1000, this);
        },
        
        isDirty: function() {
            if (!this.store) {
                return false;
            }
            return !!(this.store.getNewRecords().length || this.store.getUpdatedRecords().length || this.store.getRemovedRecords().length);
        },
        
        dirtyCheck: function () {
            var newState = this.isDirty();
            console.log('go bitch');
            if (this.dirtyState === newState) {
                return;
            }
            
            this.dirtyState = newState;
            this.fireEvent('dirtychange', this, this.dirtyState);
        },
        
        setFocus: function (index) {
            var input = this.dataView.getEl().down('.taco-option-value-row:nth-child(' + (index + 1) + ') input');
            
            if (input) {
                input.focus();
                return;
            }
        },

        addAnotherValue: function() {            
            this.store.add({
                value: '',
                placeholder: 'Example: &quot;Medium&quot; ' + this.store.count()
            });
            
            Ext.defer(function () {
                this.setFocus(this.store.count() - 1);
                this.doLayout();
            }, 1, this);
        },
        
        inputBlur: function (el, record, index, e) {
            if (record.get('value') === el.getValue() && !this.preventUpdate) {
                return;
            }
            this.preventUpdate = false;
            record.set('value', this.convertValue(el.getValue()));
        },
        
        inputKeyup: function (el, record, index, e) {
            if (record.get('value') === el.getValue() && e.keyCode !== 13 && e.keyCode !== 8) {
                return;
            }
            
            if (e.keyCode === 8 && record.get('value') === '') {
                this.clickRemove(el, record, index, e);
                return;
            }
            
            this.preventUpdate = true;
            record.set('value', this.convertValue(el.getValue()));
            if (e.keyCode !== 13) {
                return;
            }
            
            e.stopEvent();
            el.dom.blur();
            
            if (index !== this.store.count() - 1) {
                return;
            }
            
            this.addAnotherValue();
        },
        
        clickRemove: function (el, record, index, e) {
            e.stopEvent();
            this.store.remove(record);
        },
        
        changeCheckbox: function (el, record, index, e) {
            record.set('selected', el.dom.checked);
        },
        
        beforeUpdate: function () {
            return !this.preventUpdate;
        }
    });
