/**
 * @author Travis Johnson
 * @class Taco.view.option.preview.TextField
 */

    Ext.define('Taco.view.option.preview.TextField', {
        extend: 'Ext.container.Container',

        optionName: 'Sizes',
        cls: 'taco-preview-area',

      

        items: [{
            xtype: 'label',
            baseCls: 'taco-label'
        }, {
            xtype: 'component',
            loadMask: false,
            tpl: '<input type="text" placeholder="{placeholder}" min="{min}" max="{max}" maxlength="{max}">',
            data: {
                placeholder: '',
                min: 0,
                max: 128
            }
        }],

        initComponent: function() {
            var optionValueStore;

            this.callParent(arguments);
            
            this.label = this.down('label');
            this.input = this.items.get(1);
            
            this.setOptionName(this.optionName);
            
            window.opt = this.option;
            
            this.store = Ext.create('Ext.data.Store', {
                model: this.option.modelName
            });
            
            this.store.add(this.option);
            
            this.store.on({
                update: {
                    fn: function (store, record) {
                        this.update();
                    },
                    scope: this
                }
            });
            
            optionValueStore = this.option.optionValues();
            console.log('bing') ;
            // optionValueStore.removeAll();
//             
            // optionValueStore.add({});
            //this.optionValue = optionValueStore.getAt(0);
            
            optionValueStore.on({
                update: {
                    fn: function (store, record) {
                        // if (record !== this.optionValue) {
                            // return;
                        // }
                        this.input.update()
                    },
                    scope: this
                }
            });
            
            this.on({
                afterrender: {
                    fn: this.update,
                    scope: this
                }
            });
        },
        
        setOptionName: function (name) {
            this.label.setText(name + ':', false);
        },
        
        update: function () {
            console.log('UPDATE');
            this.input.update({
                placeholder: this.option.optionValues().getAt(0).get('value'),
                min: this.option.get('min'),
                max: this.option.get('max')
            });
        }
    });
