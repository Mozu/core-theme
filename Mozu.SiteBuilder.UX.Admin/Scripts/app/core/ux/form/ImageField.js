/**
 * @class Taco.core.ux.form.ImageField
 */
Ext.define('Taco.core.ux.form.ImageField', {
    extend: 'Ext.form.field.Base',
    alias: 'widget.imagefield',

    inputType: 'hidden',

    width: 200,
    height: 200,
    imgBaseUrl: '/admin/img/files/',
    imgAddPhoto: '/admin/Scripts/resources/images/legacy/AddPhotos.png',

    fieldSubTpl: [
        // '<div id="{id}-display" class="taco-image-field" style="height: {height}px; width: {width}px;">',
        //     '<div>+</div>',
        //     '<div>select background image</div>',
        // '</div>',
        '<div id="{id}-display" class="taco-image-field" style="height: {height}px; width: {width}px;">',
            '<div id="{id}-image" style="height: {[values.height - 20]}px; width: {[values.width - 20]}px;  background-image: url(\'{src}\');">',
            '</div>',
        '</div>',
        '<input id="{id}" type="{type}" {inputAttrTpl}',
            ' size="1"', // allows inputs to fully respect CSS widths across all browsers
            '<tpl if="name"> name="{name}"</tpl>',
            '<tpl if="value"> value="{[Ext.util.Format.htmlEncode(values.value)]}"</tpl>',
            '<tpl if="placeholder"> placeholder="{placeholder}"</tpl>',
            '{%if (values.maxLength !== undefined){%} maxlength="{maxLength}"{%}%}',
            '<tpl if="readOnly"> readonly="readonly"</tpl>',
            '<tpl if="disabled"> disabled="disabled"</tpl>',
            '<tpl if="tabIdx"> tabIndex="{tabIdx}"</tpl>',
            '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>',
        ' class="{fieldCls} {typeCls} {editableCls}" autocomplete="off"/>',
        {
            disableFormats: true
        }
    ],

    initComponent: function () {

        console.log('this.value', this.value);

        this.subTplData = {
            height: this.height || 100,
            width: this.width || 100,
            src: this.value ? this.imgBaseUrl + this.value : this.imgAddPhoto
        };

        this.height = null;
        this.width = null;

        this.callParent(arguments);

    },

    setValue: function (value) {
        var urlArray;
        console.log('imagefield - set value', value);

        
        if (typeof value === 'string') {
            value = value.replace(/\s|(url\(('|")?)|('|")?\)/g, '');
            urlArray = value.split('/');
            value = urlArray[urlArray.length - 1];
            this.imageEl.setStyle('background-image', 'url(\'' + this.imgBaseUrl + value + '\')');
        }

        this.callParent([value]);
    },

    launchPicker: function () {
        this.modal = Ext.create('Taco.view.fileManagement.MultiFileAssociator', {
            allowMultiple: false,
            intialSelected: [{id: this.value, alt: ''}],
            listeners: {
                save: function () {
                    var store = this.modal.getSelectedRecords()

                    if (store.getCount() === 0) {
                        return;
                    }

                    this.setValue(store.getAt(0).getId());

                    this.modal.hide();
                },
                scope: this
            }
        });
    },

    applyRenderSelectors: function () {
        this.callParent(arguments);

        this.imageEl = this.el.getById(this.getInputId() + '-image');

        this.displayEl = this.el.getById(this.getInputId() + '-display');

        this.displayEl.on({
            click: this.launchPicker,
            scope: this
        });
    }
})