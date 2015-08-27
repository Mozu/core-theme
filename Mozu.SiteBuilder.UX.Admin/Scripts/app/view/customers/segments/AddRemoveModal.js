/**
 * @class Taco.view.customers.Index
 */

Ext.define('Taco.view.customers.Segments.AddRemoveModal', {
    extend: 'Taco.core.ux.window.Modal',
    mixins:['Taco.core.ux.browser.Browsable'],
    requires: [
       // 'Taco.model.CustomerAccount',
     //   'Taco.store.CustomerSegments',
     //   'Taco.view.customers.AdvancedSearchForm',
        'Taco.store.CustomerSegments',
        'Taco.store.Customers'
    ],
    launchEditorOnClick:false,
    autoShow: true,
    closeAction: 'destroy',
    height: '95%',
    scale: 'large',
    //title: 'Edit Order Details',
    width: '95%',
    enableAutoSelect:false,
    
    secondaryText: 'Close',
    primaryText:'Apply',
    useTilePanel: false,
    
    layoutItemBrowser: function () {
        Ext.apply(this, {
            layout: { type: 'fit' },
            items: [this.itemBrowser]
        });
    },
    
    
    updateRecordTypeName:function() {
        
    },
    initComponent: function () {
        var me = this,
            storeCfg = {
                autoLoad: true
            };

    
        
        if (this.batchMethod == 'add') {
            storeCfg.filters = [{
                property: 'notsegments',
                value: this.segmentId
            }];
            this.header.title = 'Add Customers: ' + this.segmentCode;

        } else {
            storeCfg.filters = [{
                property: 'segments',
                value: this.segmentId
            }];
            this.header.title= 'Remove Customers: '+this.segmentCode ;
        }

        this.store = Ext.create('Taco.store.Customers', storeCfg);



        this.gridPanelConf = {
            
            selModel: { selType: 'checkboxmodel' },
            columns: [{
                dataIndex: 'id',
                text: 'Customer Number',
                width: 130
            }, {
                dataIndex: 'firstNameSafe',
                text: 'First Name',
                width: 130,
                renderer: function (value, metaData, record) {
                    if (value)
                        return value;
                    if (!Ext.isEmpty(record.data.contacts)) {
                        return Ext.util.Format.htmlEncode(record.data.contacts[0].firstName);
                    }
                    return null;
                }

            }, {
                dataIndex: 'lastNameSafe',
                text: 'Last Name',
                width: 130,
                renderer: function (value, metaData, record) {
                    if (value)
                        return value;
                    if (!Ext.isEmpty(record.data.contacts)) {
                        return Ext.util.Format.htmlEncode(record.data.contacts[0].lastName);
                    }
                    return null;
                }
            }, {
                dataIndex: 'emailAddressSafe',
                text: 'Email',
                width: 200,
                renderer: function (value, metaData, record) {
                    if (value)
                        return value;
                    if (!Ext.isEmpty(record.data.contacts)) {
                        return Ext.util.Format.htmlEncode(record.data.contacts[0].emailAddress);
                    }
                    return null;
                }
            }, {
                dataIndex: 'orderCount',
                text: 'Fulfilled Orders',
                width: 100
            }, {
                dataIndex: 'totalSpent',
                text: 'Lifetime Value',
                width: 100,
                renderer: function (value, metaData, record) {
                    return value;
                    //todo:localization what currency?
                }
            }, {
                dataIndex: 'visitCount',
                text: 'Total Visits',
                width: 100
            }, {
                dataIndex: 'segments',
                text: 'Segments',
                width: 300,
                renderer: function (value, metaData, record) {
                    var codes = [];
                    if (value && value.length) {
                        codes = Ext.Array.pluck(value, 'code');
                        return codes.join(', ');
                    }
                    return '';

                },
                //    renderer: function(value, metaData, record) {
                //    if (value && value.length) {
                //        var names = [];

                //        Ext.each(value || [], function(tagId) {
                //            var tagRecord = me.tagStore.getById(tagId);

                //            if (tagRecord) {
                //                names.push(tagRecord.get('Value'));
                //            }
                //        });

                //        if (names.length) {
                //            return names.join(', ');
                //        }
                //    }
                //},
                minWidth: 100,
                flex: 1
            }]
        };

        this.initBrowserConfig();
        //this.body= Ext.widget(this.body);
       // this.items = [this.body];
        this.callParent(arguments);
       // this.add(this.body);
        this.initBrowserListeners();

        this.gridPanel.on('selectionchange', function () {
            var selected = this.gridPanel.getSelectionModel().getSelection();
            this.down('#primaryAction').setDisabled(selected.length==0 );
        }, this);

    },

    advancedSearchConfig: {
        advancedFormCls: 'Taco.view.customers.AdvancedSearchForm'
    },

    allowCreate: function () {
        return false;
    },

    doSave: function () {

        var me = this,
            selected = this.gridPanel.getSelectionModel().getSelection(),
            postData = {
                segmentId: me.segmentId,
                method: me.batchMethod,
                customers: []                
            },
            request;

        Ext.Array.each(selected, function (record) {
            postData.customers.push(record.getId());
        });

            
        /*    public int SegmentId { get; set; }
        public string Method { get; set; }
        public List<int> Customers { get; set; }*/

        me.gridPanel.setLoading();
        request= {
            url: '/admin/app/customer/segments/batch' ,
            method: "POST",
            jsonData: postData,
            success: function (response, opts) {                
                me.gridPanel.setLoading(false);                
                me.store.reload();
                me.saveSuccess();
            },
            failure: function (response, opts) {
                var respObj = Ext.decode(response.responseText, true),
                    errorMsg = respObj && respObj.message ? respObj.message : 'Failure';

                Taco.app.fireEvent('setmessage', errorMsg, 'error');
                me.gridPanel.setLoading(false);
            }
        };

        Ext.Ajax.request(request);
        
    }

    
});
