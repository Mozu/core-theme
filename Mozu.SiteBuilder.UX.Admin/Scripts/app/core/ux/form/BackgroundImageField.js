/**
 * @class Taco.core.ux.form.BackgroundImageField
 */

Ext.define('Taco.core.ux.form.BackgroundImageField', {
    extend: 'Ext.form.field.Base',
    alias: 'widget.backgroundimagefield',
    requires: [
        'Taco.core.ux.form.BackgroundImagePicker',
        'Taco.core.ux.window.Modal'
    ],

    inputType: 'hidden',

    pickerSize: 25,

    backgroundProperties: [
        'background-image',
        'background-size',
        'background-repeat',
        'background-position',
        'background-attachment'
    ],

    fieldSubTpl: [
        '<span id="{id}-display" class="taco-background-image-field" style="height: {pickerSize}px; width: {pickerSize}px;">+</span>',
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
        this.background = {};

        this.subTplData = {
            pickerSize: this.pickerSize
        };

        this.callParent(arguments);

        this.on({
            afterrender: this.initImages,
            scope: this
        });
    },

    launchPicker: function () {
        this.picker = Ext.create('Taco.core.ux.form.BackgroundImagePicker', {
            value: this.background,
            listeners: {
                backgroundchange: function () {
                    this.setValue(this.picker.getValues());
                },
                scope: this
            }
        });

        this.modal = Ext.create('Taco.core.ux.window.Modal', {
            autoShow: true,
            scale: 'medium',
            items: [this.picker]
        });
    },

    setValue: function (value) {
        var url;
        console.log('new value', value);

        if (typeof value !== 'string' && value['background-image']) {
            url = value['background-image'];
            
            if (url.indexOf('url(') < 0) {
                url = 'url(\'/files/' + Taco.app.context.getTenantId() + '/' + Taco.app.context.getMasterCatalogId() + '/' + url + '\')';
            }
            this.displayEl.setStyle({
                'background-image': url,
                color: 'transparent'
            });

            value = this.buildStyleString(value);
        }

        this.callParent([value]);
    },

    parseBackground: function (value) {
        var elm = Ext.DomHelper.append(Ext.getBody(), '<span />', true),
            background = {};

        Ext.each(value.split(';'), function (propertyString) {
            var propertyArray = propertyString.split(':'),
                propertyName = propertyArray[0],
                propertyValue = propertyArray[1];

            if (typeof propertyName !== 'string' || typeof propertyValue !== 'string') {
                return;
            }

            elm.setStyle(propertyName, propertyValue);
        });

        Ext.each(this.backgroundProperties, function (property) {
            var split, x, y;
            background[property] = elm.getStyle(property);

            if (property === 'background-position') {
                split = background[property].split(' ');

                switch (split[0]) {
                    case '0%':
                        x = 'left';
                        break;
                    case '50%':
                        x = 'center';
                        break;
                    case '100%':
                        x = 'right';
                        break;
                }

                switch (split[1]) {
                    case '0%':
                        y = 'top';
                        break;
                    case '50%':
                        y = 'center';
                        break;
                    case '100%':
                        y = 'bottom';
                        break;
                }

                background[property] = x + ' ' + y;
            }
        }, this);

        elm.remove();

        return background;
    },

    buildStyleString: function (background) {
        var style = '';

        Ext.each(this.backgroundProperties, function (property) {
            var value = background[property];
            if (property === 'background-image' && value.indexOf('url(') < 0) {
                value = 'url(\'/files/' + Taco.app.context.getTenantId() + '/' + Taco.app.context.getMasterCatalogId() + '/' +  value + '\')';
            }
            style += property + ':' + value + ';';
        }, this);

        return style;
    },

    initImages: function () {
        this.background = this.parseBackground(this.value);
        this.setValue(this.background);
    },

    applyRenderSelectors: function () {
        this.callParent(arguments);

        this.displayEl = this.el.getById(this.getInputId() + '-display');

        this.displayEl.on({
            click: this.launchPicker,
            scope: this
        });
    }

});