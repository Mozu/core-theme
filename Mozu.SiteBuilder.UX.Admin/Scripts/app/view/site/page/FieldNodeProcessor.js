/**
 * @class Taco.view.site.page.FieldNodeProcessor
 */
    Ext.define('Taco.view.site.page.FieldNodeProcessor', {
        fieldType: 'text',
        dom: null,

        constructor: function (config) {
            
            Ext.apply(this, config || {});
            switch (this.fieldType) {
                case 'text':
                    this.getFn = this.gettors.html;
                    this.setFn = this.setters.html; 
                    this.convertForStorageFn=this.storageConverters.html;
                    break;
                case 'html':
                    this.getFn = this.gettors.html;
                    this.setFn = this.setters.html;
                    this.convertForStorageFn=this.storageConverters.html;
                    break;
                case 'image':
                    this.getFn = this.gettors.image;
                    this.setFn = this.setters.image;
                    this.convertForStorageFn=this.storageConverters.image;
                    break;
             
                }

        },
        
        convertForStorage:function  (value){
            return this.convertForStorageFn(value);
        },
        get: function () {
            return this.getFn(this.dom);
        },
        set: function (value) {
            this.setFn(this.dom, value);
        },
        gettors: {

            html: function (dom) {
                return Ext.htmlDecode(dom.innerHTML);
            },
            image: function (dom) {
                var data = {
                    html: Ext.htmlDecode(dom.innerHTML)
                };
                Ext.Array.each(dom.attributes, function (att) {
                    data[att.name] = att.value;
                });
                return data;
            }
        },
        storageConverters:{
            html: function (value) {
                return value;
            },
            image: function (value){
                var copy=Ext.apply({}, value );
                copy['data-editing-element']= null;
                return Ext.JSON.encode(value);
            }
        },
        setters: {
            html: function (dom, value) {
                dom.innerHTML = value;
            },
            image: function (dom, value) {
                dom.innerHTML = value.html;

                Ext.Object.each(value, function (k, v) {
                    if ( k !== 'html'){
                        dom.setAttribute(k, v);
                    }
                });

            }
        }



    });

