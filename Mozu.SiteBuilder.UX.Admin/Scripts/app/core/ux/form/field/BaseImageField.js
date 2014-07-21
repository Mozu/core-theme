
/**
 * @class Taco.core.ux.form.field.Category
 */

Ext.define('Taco.core.ux.form.field.BaseImageField', {
    extend: 'Ext.form.field.Base',
    alias: ['widget.taco-imagefield'],
    requires: [
        'Taco.view.website.widgetEditors.Image'
    ],
   // height: 300,
    //  width: 800,
      minHeight: 300,
    inputType: 'hidden',
    mode: 'mozufilter',
    showGutter: true,
     
    initComponent: function () {
        var me = this;
        me.on('render', function () {
            me.getEl().on('click', me.showImageEditor, me);
        });
    
        me.on('click', function (cmp) {
            console.log('click');

        });
        this.callParent(arguments);
    },
    showImageEditor: function () {
        var me = this,
            data= {},
            mdl;
        data= Ext.applyIf(data, {
            "height": 400,
            "heightResizable": true,
            "imageHeight": 400,
            "imageSource": "file",
            "linkSource": "externalUrl",
            imageExternalUrl: data.value || this.getValue() || '/admin/scripts/resources/images/noimage.png'
        });
         mdl = Ext.create('Taco.view.website.widgetEditors.Image',
        {
            autoShow: true,
            closeAction: 'destroy',
            widgetData: data,
            title: 'xxx',
            listeners: {
                savesuccess: function (modal, imageData) {
                    me.setValue(imageData.imageExternalUrl);
                   // me.onValueChange();
                  //  console.log('onsave',arguments);
                }
            }
        });
    },
    getEditorId:function () {
        return this.getInputId() + '-editor';
    },

    getEditorEl:function () {
        var me = this;
        me.editorEl = me.editorEl || me.el.getById(me.getEditorId());
        return me.editorEl;
    },
    getValue: function () {
        return this.value;
    },
  //  fieldSubTpl:[],
    setValue: function (value) {
        var me = this,
            data,
            ret = me.mixins.field.setValue.call(me, value);

        if (me.getInputEl()) {
            data = me.getSubTplData();
            me.getInputEl().dom.setAttribute('src', data.imageSrc);
        }
    
        return ret;

    },
    setValueInternal: function (value) {
        var me = this,
            data,
            ret;
        
        ret= me.mixins.field.setValue.call(me, value);
        if (me.getInputEl()) {
            data = me.getSubTplData();
            me.getInputEl().dom.setAttribute('src', data.imageSrc);
        }
        return ret;
    },
    getInputEl: function () {
        if (!this.getEl()) {
            return null;
        }
        return this.inputEl = this.inputEl || this.getEl().getById(this.getInputId());
    },
  

    fieldSubTpl: ['<div id="img-cnt-{id]"> <img src="{imageSrc}" id="{id}" style="icon:pointer;max-height:200px;max-width:200px;" ></div>'],
    getSubTplData: function () {
        var me = this,
            data = this.callParent(arguments);

        data.imageSrc = data.value|| this.getValue() ||  '/admin/scripts/resources/images/noimage.png';
        return data;
    },


   


});



    
