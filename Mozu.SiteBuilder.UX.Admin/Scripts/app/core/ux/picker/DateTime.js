/**
 * @class Taco.core.ux.picker.DateTime
 * A date & time picker. This class is used by Taco.core.ux.form.DateTime to allow browsing and selection of
 * valid dates in a popup next to the field, but may also be used with other components.
 */
Ext.define('Taco.core.ux.picker.DateTime', {
    extend: 'Ext.picker.Date',
    alias: 'widget.datetimepicker',
    requires: [
        'Ext.form.field.Time',
        'Ext.container.Container'
    ],   
    childEls: [
        'innerEl', 'eventEl', 'prevEl', 'nextEl', 'middleBtnEl', 'footerEl'
    ],
    
    cls:"taco-datetime-picker-wrapper",

    border: false,
    hideOnSelect: false,    

    enableTimeRow:true,

    initComponent: function () {
        this.timeValue = this.value;

        this.callParent(arguments);

        this.timeValue = this.timeValue || new Date();
    },

    beforeRender: function () {
        this.callParent(arguments);        
        if (this.showToday && this.todayBtn) {
            this.todayBtn = Ext.create('Ext.button.Button', {
                ui: "link",
                scale:"medium",
                ownerCt: this,
                ownerLayout: this.getComponentLayout(),
                text: 'Current date/time',
                listeners: {
                    click: this.selectToday,
                    scope: this
                }
            });
        }
    },

    afterRender: function () {
        var me = this;
        me.initTimeRow();        
        this.callParent(arguments);
    },

    initTimeRow: function () {
        var me = this;
        if (me.enableTimeRow) {        

            var dh = Ext.DomHelper;

            this.tableGrid = this.getEl().down('.x-datepicker-inner');

            this.timeRow = dh.insertAfter(this.tableGrid, {
                cls: "taco-datepicker-timerow",
                children: [
                    { tag: "span", cls: "taco-label", html: "Time" }
                ]
            })

            this.timeCmp = Ext.create('Ext.Component', {
                autoEl: {
                    tag: 'input',
                    type: 'text',
                    style: "width:50px;margin-right:10px;",
                    cls: "x-form-field x-form-text taco-datetime-time-input ",
                    value: Ext.Date.format(this.timeValue, 'g:i')
                },
                renderTo: this.timeRow
            });

            this.timeInputEl = this.getEl().down('.taco-datetime-time-input');

            this.timeInputEl.on('focus', function () {
                this.oldTime = this.timeInputEl.dom.value;
                Ext.defer(function () {
                    this.timeInputEl.dom.select();
                }, 10, this);
            }, this).on('blur', this.validateTime, this);

            
            this.amContainer = this.getEl().down('.taco-am-btn');

            this.amCmp = Ext.create('Ext.button.Button', {
                ui: "action",
                scale: "medium",
                cls: "taco-togglebtn-left",
                text: "AM",
                ownerCt: this,
                ownerLayout: this.getComponentLayout(),                
                allowDepress:false,
                pressed:true,
                toggleGroup: "ampm",
                renderTo: this.timeRow
            });

            this.amCmp.on('click', function (button, evt, eOpts) {                
                this.onAmPmToggle(button, true)
            }, this)

            this.pmContainer = this.getEl().down('.taco-pm-btn');

            this.pmCmp = Ext.create('Ext.button.Button', {
                ui: "action",
                scale: "medium",
                cls: "taco-togglebtn-right",                
                ownerCt: this,
                ownerLayout: this.getComponentLayout(),
                text: "PM",
                allowDepress: true,
                toggleGroup: "ampm",
                renderTo: this.timeRow
            });

            this.pmCmp.on('click', function (button, evt, eOpts) {                
                this.onAmPmToggle(button,false)
            }, this)
        }
    },


    // on toggle of the AM PM buttons
    onAmPmToggle: function (button, state) {
        // prevent a `pressed button from being un-depressed. 
        this.pmCmp.allowDepress = state;
        this.amCmp.allowDepress = !state;

        // update the time;
        if (state) {
            this.setPeriod('am');
        } else {
            this.setPeriod('pm');
        }
    },
 
    validateTime: function () {
        var newTime = this.timeInputEl.dom.value.trim(),
            forcePeriod;

        // Detect if only a number between 1 and 12 is entered
        // and assume its on the hour
        if (newTime.indexOf(':') === -1 && newTime.search(/^([0-1]?\d)|(2[0-4])$/) === 0) {
            newTime += ':00';
        }

        //  Check for the special case of 24:00 and convert it to 0:00 (am)
        if (newTime === '24:00') {
            newTime = '0:00'
        }

        // If the input value is not valid
        // reload the last value used
        if (newTime.search(/^((([0-1]?\d)|(2[0-3])):[0-5]{1}\d)$/) !== 0) {
            newTime = this.oldTime;
        }

        // If hour is in 24-hour mode, switch time to PM
        if (newTime.search(/^(1[3-9])|(2[0-4]):\d{2}$/) === 0) {
            forcePeriod = 'pm';
        };

        if (newTime === '0:00') {
            forcePeriod = 'am';
        }

        this.timeValue = new Date(Ext.Date.format(this.timeValue, 'm/d/Y ' + newTime + (forcePeriod ? '' : ' a')));
        
        if (forcePeriod) {
            this.setPeriod(forcePeriod, true);
        }
        

        this.timeInputEl.dom.value = Ext.Date.format(this.timeValue, 'g:i');

        this.onSelect();
    },

    setValue: function (value) {
        
        this.timeValue = value;
        this.callParent(arguments);
    },

    getValue: function () {
        return this.bindDateAndTime(this.value, this.timeValue);
    },

    bindDateAndTime: function (dateValue, timeValue) {
        var dateString = Ext.Date.format(dateValue, 'm/d/Y'),
            timeString = Ext.Date.format(timeValue, ' g:i a');

        return new Date(dateString + timeString);
    },

    update: function(value) {
        this.callParent(arguments);
        
        if (this.rendered) {
            this.getEl().down('input[type=text]').set({value: Ext.Date.format(this.timeValue, 'g:i')});
            this.setPeriod(Ext.Date.format(this.timeValue, 'a'));
        }
    },

    setPeriod: function (mode, suppress) {
        var timeString = Ext.Date.format(this.timeValue, 'm/d/Y g:i ');
        this.timeValue = new Date(timeString + mode);


        
        this.amCmp.toggle((mode == "am"), true);
        this.pmCmp.toggle((mode == "pm"), true);

        

        this.onSelect();
    },

    selectToday: function () {
        this.setValue(new Date());
        this.timeInputEl.dom.value = Ext.Date.format(this.timeValue, 'g:i');
        this.onSelect();
        return this;
    },

    /**
     * Respond to a date being clicked in the picker
     * @private
     * @param {Ext.EventObject} e
     * @param {HTMLElement} t
     */
    handleDateClick : function(e, t){
        var me = this,
            handler = me.handler;

        e.stopEvent();
        if(!me.disabled && t.dateValue && !Ext.fly(t.parentNode).hasCls(me.disabledCellCls)){
            me.doCancelFocus = me.focusOnSelect === false;
            me.setValue(me.bindDateAndTime(new Date(t.dateValue), me.timeValue));
            delete me.doCancelFocus;
            me.onSelect();
        }
    },

    onSelect: function () {
        var value = this.getValue();
        this.fireEvent('select', this, value);
        if (typeof this.handler === 'function') {
            this.handler.call(this.scope || this, this, value);
        }

        if (this.hideOnSelect) {
            this.hide();
        }
    },

    // copied from the base class to correct the stupid setPosition(-1,-1)
    showMonthPicker: function (animate) {
        var me = this,
            picker;

        if (me.rendered && !me.disabled) {
            picker = me.createMonthPicker();
            picker.setValue(me.getActive());
            picker.setSize(me.getSize());
            picker.setPosition(0, 0);
            if (me.shouldAnimate(animate)) {
                me.runAnimation(false);
            } else {
                picker.show();
            }
        }
        return me;
    },

    beforeDestroy: function () {
        if (this.rendered) {
            Ext.destroy(this.timeCmp);            
        }
        this.callParent(arguments);
    }
});