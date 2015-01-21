/**
* The Discount list (grid) view
*/
Ext.define('Taco.platter.fields.SimpleFields', {
    singleton: true,
    requires: [
        'Ext.form.field.Text',
        'Taco.core.ux.form.field.BaseImageField',
        'Ext.form.field.Checkbox',
        'Ext.form.field.Number',
        'Ext.form.field.ComboBox',
        'Taco.core.ux.form.ColorField',
        'Taco.shared.view.field.Product',
        'Taco.shared.view.field.Category'
    ],
    constructor: function () {

    }
});

Ext.define('Taco.platter.SimpleField', {
    // common qualities of simple fields go here

    getInputDependency: function(name, cb) {
        this.on('boxready', function(self) {
            var form = this.up('form');
            var depInput = form.down('[name="' + name + '"]');
            if (!depInput) throw new Error('The view field configuration specifies a dependency input "' + name + '" that is not in this form.');
            cb(depInput, self);
        })
    },

    bindStoreFrom: function() {
        this.store = []; // placeholder
        var oldForceSelection = this.forceSelection;
        this.forceSelection = false; // to defeat removal of the value when it's initially bound and discovers an empty store
        this.getInputDependency(this.storeFrom, function(fromInput, self) {
            var bindFn = function() {
                var originalValue = self.getValue();
                if (!fromInput.valueStore) throw new Error('No valueStore is present on the field for ' + self.storeFrom + '. Is it a multiselect element? Multi-select elements are required for use as a storeFrom.');
                self.bindStore(fromInput.valueStore);
                self.setValue(originalValue);
            }
            bindFn();
            self.forceSelection = oldForceSelection;
            fromInput.on('change', bindFn, this, { delay: 50 });
        });
    },

    bindBooleanState: function(fieldName, stateFn, reverse) {
        this.getInputDependency(fieldName, function(boundInput, self) {
            var val = boundInput.getValue();
            stateFn.call(self, reverse ? !val : val);
            boundInput.on('change', function(field, newValue) {
                stateFn.call(self, reverse ? !newValue : newValue);
            });
        });
    },
    initDeps: function() {
        if (this.storeFrom) {
            this.bindStoreFrom();
        }
        if (this.enableIf) {
            this.bindBooleanState(this.enableIf, this.setDisabled, true);
        }
        if (this.disableIf) {
            this.bindBooleanState(this.disableIf, this.setDisabled, false);
        }
        if (this.showIf) {
            this.bindBooleanState(this.showIf, this.setVisible, false);
        }
        if (this.hideIf) {
            this.bindBooleanState(this.hideIf, this.setVisible, true);
        }
    }
});

Ext.define('Taco.platter.fields.DateTime', {
    extend: 'Taco.core.ux.picker.DateTime',
    format: 'c',
    altFormats:"m/d/Y|m-d-y|m-d-Y|m/d|m-d|md|mdy|mdY|d|Y-m-d|c",
    alias: ['widget.mz-input-date'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    }
});

Ext.define('Taco.platter.fields.Code', {
    extend: 'Taco.core.ux.form.field.Code',
    alias: ['widget.mz-input-code'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    },
    mode: 'html',
    width: 360
});

Ext.define('Taco.platter.fields.HtmlEditor', {
    extend: 'Ext.form.HtmlEditor',
    alias: ['widget.mz-input-richtext'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    },
    enableAlignments: false,
    enableColors:false,
    enableFont: false,
    enableFontSize: false,
    width: 360
});

Ext.define('Taco.platter.fields.TextArea', {
    extend: 'Ext.form.field.TextArea',
    alias: ['widget.mz-input-richtext'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    },
    width: 360
});

Ext.define('Taco.platter.fields.Text', {
    extend: 'Ext.form.field.Text',
    alias: ['widget.mz-input-text'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    },
    width: 260
});

Ext.define('Taco.platter.fields.DropDown', {
    extend: 'Ext.form.field.ComboBox',
    alias: ['widget.mz-input-dropdown'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    },
    queryMode: 'local',
    editable: false,
    triggerAction: 'all',
    typeAhead: false,
    queryMode: 'local',
    editable: false,
    width: 260
});

Ext.define('Taco.platter.fields.MultiSelect', {
    extend: 'Ext.ux.form.field.BoxSelect',
    alias: ['widget.mz-input-selectmulti'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    },
    cls: 'mz-input-selectmulti',
    multiSelect: true,
    margin: 0,
    triggerOnClick: false,
    typeAhead: true,
    width: 260

});

Ext.define('Taco.platter.fields.Checkbox', {
    extend: 'Ext.form.field.Checkbox',
    alias: ['widget.mz-input-checkbox'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.boxLabel = this.boxLabel || this.fieldLabel;
        delete this.fieldLabel;
        this.initDeps();
        this.callParent(arguments);
    }
});

Ext.define('Taco.platter.fields.Number', {
    extend: 'Ext.form.field.Number',
    alias: ['widget.mz-input-number'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    },
    allowDecimals: false,
    hideTrigger: true,
    mouseWheelEnabled: false,
    width: 260

});

Ext.define('Taco.platter.fields.Image', {
    extend: 'Taco.core.ux.form.field.BaseImageField',
    alias: ['widget.mz-input-image'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    }
});

Ext.define('Taco.platter.fields.ImageSimple', {
    extend: 'Taco.core.ux.form.field.BaseImageField',
    alias: ['widget.mz-input-image-nostyle'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    },
    allowStyles: false
});

Ext.define('Taco.platter.fields.ImageUrl', {
    extend: 'Taco.core.ux.form.field.BaseImageField',
    alias: ['widget.mz-input-imageurl'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    },
    allowStyles: false,
    dataFormat: 'urlOnly',
    allowAltText: false
});

Ext.define('Taco.platter.fields.Product', {
    extend: 'Taco.shared.view.field.Product',
    emptyText: 'Select Product',
    alias: ['widget.mz-input-product'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    },
    multiSelect: false
});

Ext.define('Taco.platter.fields.MultiProduct', {
    extend: 'Taco.shared.view.field.Product',
    emptyText: 'Select Products',
    alias: ['widget.mz-input-productmulti'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    },
    multiSelect: true
});

Ext.define('Taco.platter.fields.Category', {
    extend: 'Taco.shared.view.field.Category',
    alias: ['widget.mz-input-category'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    },
    multiSelect: false
});

Ext.define('Taco.platter.fields.MultiCategory', {
    extend: 'Taco.shared.view.field.Category',
    alias: ['widget.mz-input-categorymulti'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    },
    multiSelect: true
});

Ext.define('Taco.platter.fields.Discount', {
    extend: 'Taco.shared.view.field.Discount',
    alias: ['widget.mz-input-discount'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    },
    emptyText: 'Select Discount',
    multiSelect: false
});

Ext.define('Taco.platter.fields.MultiDiscount', {
    extend: 'Taco.shared.view.field.Discount',
    alias: ['widget.mz-input-discountmulti'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    },
    emptyText: 'Select Discounts',
    multiSelect: true
});

Ext.define('Taco.platter.fields.NavNode', {
    extend: 'Taco.shared.view.field.NavNode',
    alias: ['widget.mz-input-navnode'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    },
    emptyText: 'Select Navigation Nodes',
    multiSelect: false
});

Ext.define('Taco.platter.fields.MultiNavNode', {
    extend: 'Taco.shared.view.field.NavNode',
    alias: ['widget.mz-input-navnodemulti'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    },
    emptyText: 'Select Navigation Nodes',
    multiSelect: true
});

Ext.define('Taco.platter.fields.Color', {
    extend: 'Taco.core.ux.form.ColorField',
    alias: ['widget.mz-input-color'],
    mixins: ['Taco.platter.SimpleField'],
    initComponent: function() {
        this.initDeps();
        this.callParent(arguments);
    },
    width: 260
});