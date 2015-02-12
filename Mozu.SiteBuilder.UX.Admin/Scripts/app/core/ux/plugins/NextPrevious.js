Ext.define('Taco.core.ux.plugins.NextPrevious', {
    alias: 'plugin.nextprevious',
    pluginId: "nextprevious",
    extend: 'Ext.AbstractPlugin',
    mixins: {
        observable: 'Ext.util.Observable'
    },
    requires: ['Ext.state.Manager'],

    config: {
        // turns on the next previous feature
        enableNextPrevious: false,

        enableTooltips:true,

        buttonPosition: "left",

        buttonType: "arrows", // "arrows" || "text"

        shortCutTip: {
            next: Ext.String.htmlEncode("<Ctrl><Shift><PageDown>"),
            previous: Ext.String.htmlEncode("<Ctrl><Shift><PageUp>"),
        },

        nextButtonTpl:"Next",
        nextButtonIcon: "",
        nextButtonTipTpl: "Next Item <div style='margin-top:5px;border-top:1px solid #ccc;padding-top:10px;text-align:right;color:#ccc;font-size:11px;'>{shortCutTip}</div>",
        
        nextPageButtonTpl: "Next Page",
        nextPageButtonIcon: "",
        nextPageTipTpl: "Next Page <div style='margin-top:5px;border-top:1px solid #ccc;padding-top:10px;text-align:right;color:#ccc;font-size:11px;'>{shortCutTip}</div>",



        previousButtonTpl: "Previous",
        previousButtonIcon: "",
        previousButtonTipTpl: "Previous Item <div style='margin-top:5px;border-top:1px solid #ccc;padding-top:10px;text-align:right;color:#ccc;font-size:11px;'>{shortCutTip}</div>",


        previousPageButtonTpl: "Previous Page",
        PreviousPageButtonIcon: "",
        previousPageTipTpl: "Previous Page  <div style='margin-top:5px;border-top:1px solid #ccc;padding-top:10px;text-align:right;color:#ccc;font-size:11px;'>{shortCutTip}</div>",




        positionTpl: "{positionIndex} of {storeTotal}",



        // the component to inject this plugin into.
        view:null,

        url: "",  //   /orders/edit/

        // the store to use for showing the next and previous record
        store: null,

        // the stateId for the grid you are trying to navigate. this will allow the sorters to match;
        stateId: "",

        sourceStore: null
    },



    constructor: function (cfg) {
        
        var me = this;
        me.callParent(arguments);
        me.mixins.observable.constructor.call(me);
    },

    init: function (view) {
        
        var me = this,
            sourceStoreExists,
            state,
            storeCfg = {
                type:me.store
            },
            lastOptions,
            limit,
            page,
            sorters,
            start,
            extraParams,
            filters;

        if (me.enableNextPrevious) {

            me.view = view;
            


            


            //    var nextPreviousPlugin = me.getPlugin('nextprevious');
                this.keyNav = Ext.create('Ext.util.KeyNav', Ext.getDoc(), {
                    // target: this.getEl(),
                    scope: this,
                    pageUp: function (e) {
                        if (e.shiftKey) {

                            //Ext.bind(nextPreviousPlugin.navigateToPrevious, nextPreviousPlugin)();
                            me.navigateToPrevious()
                        }

                    },
                    pageDown: function (e) {
                        if (e.shiftKey) {

                            //Ext.bind(nextPreviousPlugin.navigateToNext, nextPreviousPlugin)();
                            me.navigateToNext();
                        }
                    }
                });

            





            sourceStoreExists = Taco.core.data.StoreManager.stores.getByKey(this.store);
            
            if (!sourceStoreExists) {
                // need to get the sorters for the grid from data storage so that a newly created store here will match the default when loading the default grid.
                state = Ext.state.Manager.get(this.stateId);
                if (state && state.storeState && state.storeState.sorters) {
                    sorters = state.storeState.sorters;
                    Ext.apply(storeCfg, {
                        sorters: sorters
                    });
                }
            }


            // need to get current state of the source grid;
            
            this.store = Taco.core.data.StoreManager.getOrCreate(storeCfg);

            
            if (!this.store) {
                console.log("NextPrevious Plugin: no store defined");
                return;
            }

            // need to wait to initialize the next or previous buttons until the sourceStore has finished loading if its currently loading.
            if (me.store.isLoading()) {
                me.mon(me.store, 'load', function () {
                    me.onStoreLoad();
                }, me)
                return;
            } else {
                me.onStoreLoad();
            }
        }

        me.callParent(arguments);
    },

    onStoreLoad: function () {
        var me = this;
        me.initUI();
    },

    getNextButtonCfg: function () {
        var me = this;
        return me.getButtonCfg(true);
    },

    getPreviousButtonCfg: function () {
        var me = this;
        return me.getButtonCfg(false);
    },

    getButtonCfg: function (forward) {
        var me = this,
            isPageButton = me.isPageButton(forward),
            buttonDisabled = !((forward) ? me.canNavigateToNext() :  me.canNavigateToPrevious()),
            rec = me.store.getById(me.view.record.getId()),
            recData = (rec) ? rec.data : {},
            buttonTpl,
            tipTpl,
            buttonCfg,
            buttonCfgDefault = {
                xtype: "button",
                ui: "action",
                scale: "medium",
                handler: (forward) ? me.navigateToNext : me.navigateToPrevious,
                scope: me,
                disabled: buttonDisabled,
                margin: {
                    right: 10
                }
            },
            index,
            navToIndex,
            navRecord,
            navRecordData = {}


        if (rec && rec.data) {
            index = this.store.indexOfId(rec.getId());
            navToIndex = forward ? index + 1 : index - 1;
            navRecord = me.store.data.getAt(navToIndex);
            navRecordData = (navRecord) ? navRecord.data : {}
        }

        
        // add shortcut info to the data so the tooltip tpl can display it
        navRecordData.shortCutTip = (forward) ? me.shortCutTip.next : me.shortCutTip.previous;
        

        
        if (forward) {
            buttonTpl = (isPageButton && !buttonDisabled) ? me.nextPageButtonTpl : me.nextButtonTpl;
            tipTpl = (isPageButton) ? me.nextPageTipTpl : me.nextButtonTipTpl
        } else {
            buttonTpl = (isPageButton && !buttonDisabled) ? me.previousPageButtonTpl : me.previousButtonTpl;
            tipTpl = (isPageButton) ? me.previousPageTipTpl : me.previousButtonTipTpl
        }

        
        if (isPageButton && !buttonDisabled) {
            // next page

            if (me.buttonType == "arrows") {
                //todo made this an icon
                buttonCfg = {
                    
                    glyph: (forward) ? 'XE60B@mozicons' : 'XE60C@mozicons',
                    padding: {
                        left: 7
                    },
                }
            } else {
                // text button
                buttonCfg = {
                    text: Ext.create('Ext.XTemplate', buttonTpl).apply(navRecordData)
                }
            }
        } else {
            // next entity

            if (me.buttonType == "arrows") {
                //todo made this an icon
                buttonCfg = {
                    glyph: (forward) ? 'XE60B@mozicons' : 'XE60C@mozicons',
                    padding: {
                        left: 7
                    }
                }
            } else {
                buttonCfg = {
                    text: Ext.create('Ext.XTemplate', buttonTpl).apply(navRecordData)
                }
            }
        }

        // add tooltips if enabled
        if (me.enableTooltips && !buttonDisabled) {
            Ext.apply(buttonCfg, {
                tooltip: {
                    // todo: create scss for tooltips and utilize the title for thed default text and ;
                    //title: "Title here",
                    trackMouse:false,
                    text: Ext.create('Ext.XTemplate', tipTpl).apply(navRecordData),
                    width:300
                }
            })
        }

        Ext.apply(buttonCfg, buttonCfgDefault)

        return buttonCfg
    },

    getPositionCfg: function () {
        var me=this,
            positionText = "1 of 1",
            rec,
            storeTotal = me.store.getTotalCount(),
            positionIndex,
            tpl;

        rec = me.store.getById(me.view.record.getId());
        if (rec) {
            positionIndex = (rec.index + 1);
            tpl = Ext.create("Ext.XTemplate", me.positionTpl);

            positionText = tpl.apply({ positionIndex: positionIndex, storeTotal: storeTotal });
        }

        return {
            xtype: "component",
            //ui: "action",
            //scale: "medium",
            //handler: me.navigateToPrevious,
            //scope: me,
            //disabled: previousButtonDisabled,
            style:"font-size:16px;",
            padding:{
                top: 3,
                bottom: 2,
                left: 5,
                right:5
            },
            margin: {
                right: 10
            },
            html: positionText
        }
    },

    initUI:function (){
        var me = this,                    
            ownerCt = me.view.actionToolbar
            
        
        // if both buttons are disabled its because the store doesn't contain the record we are looking at.
        // this happens when the user refreshes the view and the current record doesn't come back in the first page of the default store result set;
        // todo: determine what to display in this use case;        

        this.nextButton = ownerCt.insert(0, me.getNextButtonCfg());
        this.positionUI = ownerCt.insert(0, me.getPositionCfg());
        this.previousButton = ownerCt.insert(0, me.getPreviousButtonCfg());
    },

    // @private
    initEvents: function () {
        var me = this

        //me.mon(me.view, 'viewready', me.onAutoSelect, me);
        //me.mon(me.store, 'load', me.onAutoSelect, me);
        //me.mon(me.view.getSelectionModel(), 'selectionchange', me.onSelectionChange, me);
    },


    navigate: function (forward) {
        var me = this,
            record = this.view.record,
            index = this.store.indexOfId(record.getId()),
            navToIndex = forward ? index + 1 : index - 1,
            outOfIndexMeth = forward ? 'nextPage' : 'previousPage',
            validCheck = forward ? 'canNavigateToNext' : 'canNavigateToPrevious',
            rec;



        if (me.navigateInProgress) {
            return;
        }

        if (me.fireEvent('beforenavigate', me) !== false) {
            me.onNavigate();
            me.fireEvent('navigate', me);

            // TODO: add feedback on click 
            //if (me.saveActionButton) {
            //    me.saveActionButton.addCls('taco-button-processing');
            //    me.saveActionButton.setText(this.saveInProgressText);
            //};


            if (!this[validCheck]())
                return;

            if (index == -1) {
                return
            }

            me.navigateInProgress = true;

            me.doNavigate(forward);
        }


    },
    
    // tempalte method;
    onNavigate: Ext.emptyFn,

    doNavigate: function (forward) {
        var me = this,
            index = me.store.indexOfId(me.view.record.getId()),
            navToIndex = forward ? index + 1 : index - 1,
            outOfIndexMeth = forward ? 'nextPage' : 'previousPage',
            validCheck = forward ? 'canNavigateToNext' : 'canNavigateToPrevious',
            rec;

        rec = me.store.data.getAt(navToIndex);
        if (rec) {            
            Taco.core.StateManager.attemptNavigate(me.url + rec.getId());
        } else {            
            me.store[outOfIndexMeth]({
                scope: me,
                callback: function () {
                    //this.setLoading(false);
                    navToIndex = forward ? 0 : me.store.count() - 1;
                    rec = me.store.data.getAt(navToIndex);
                    if (rec) {
                        Taco.core.StateManager.attemptNavigate(me.url + rec.getId());
                    }
                }
            });
        }
    },

    isPageButton : function (forward){
        var me = this,
            index = me.store.indexOfId(me.view.record.getId()),
            navToIndex = forward ? index + 1 : index - 1,
            rec;

        rec = me.store.data.getAt(navToIndex);
        return !(rec)
    },

    canNavigateToNext: function () {
        var me = this,
            rec = this.store.getById(this.view.record.getId())        
        return rec && this.store.getTotalCount() > 1 && rec.index < this.store.getTotalCount() - 1;
    },
    canNavigateToPrevious: function () {
        var me = this,
            rec = this.store.getById(this.view.record.getId());
        return rec && rec.index != 0;
    },
    navigateToPrevious: function () {
        this.navigate(false);
    },
    navigateToNext: function () {        
        this.navigate(true);
    },
    /**
     * @private
     * AbstractComponent calls destroy on all its plugins at destroy time.
     */
    destroy: function () {
        var me = this

        // Clear all listeners from all our events, clear all managed listeners we added to other Observables
        me.clearListeners();

        if (me.view) {
            this.keyNav.destroy();
            this.nextButton.destroy()
            this.positionUI.destroy()
            this.previousButton.destroy();

            me.view = me.store = this.nextButton = this.positionUI = this.previousButton = null;
        }

        me.callParent(arguments)
    }


});