/**
 * @class Taco.controller.Sites
 * The Sites controller. TODO: This is the most cut-and-pasted thing.
 */
Ext.define('Taco.controller.SiteBuilder', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.site.page.Edit'],
    views: ['attribute.Index'],             //<hack 
    modelName: 'Taco.model.Attribute',   //<hack 

    index: function (cfg) {

    },
    
   

    /************************************
    *  WidgetDefinition  
    *
    *  an array of these are returned by calling the SiteBuilder Controller's 
    *  findWidgetTypeDefinitions function an optoin filter may be passed in.
    *  used to build the widget modal
    *
    *********************************************/
    widgetTypeDefinition:
    //schema of widget Type Definition     
    {
        //som Unique String
        id: 'qewr-asdf-asdf',
        //Friendly Name Of Widget Type
        name: 'You Tube Feed',
        //url of widgetThumbNail
        thumbNail: '/resources/widgets/abc',
        //label of the group
        groupLabel: 'Social',
        //id which to group By
        groupId:'123',
        //boolean true if rich text
        isRichText: false        
    },
    /************************************
    *  widgetInstanceData  
    *
    *  This is the data asscoiated with each dropped widget.
    *  Found in the data attribute of the widget on render
    *  Passed back and forth from admin to storfront on edits and drops
    *  Finally the full list is passed back by the 
    *  editors.getPersistanceData() call allong with the layout data
    *  
    *
    *********************************************/
    widgetInstanceData:
    //schema of widget Type Definition     
    {
        //som Unique String
        id: '111-222-333',
        //widgetTypeDefinition of the widget instance
        typeId: 'qewr-asdf-asdf',
        //specific instance config info for the widget
        config: {
            userId: 'adsf',
            keywords: ['cats', 'more cats'],
            count: 22            
        }    
    },
    

    /************************************
    *  widgetLayoutData  
    *
    *  This is the data asscoiated with each drop zone.
    *  Found in the data attribute of the zone? 
    *  full list is passed back by the 
    *  editors.getPersistanceData()  call
    *  
    *
    ***********************************/
    widgetLayoutData:
//schema of widget Layout 
    {
        zoneId:'body',
        rows: [{
                cols: [{
                        span: 2,
                        widgets: [{ id: '2e0kf020k', float: 'left' }, { id: 'asdfm20k-' }]
                    }, {
                        span: 10,
                        widgets: [{ id: 'o20ekf9j2' }]
                    }]
            }, {
                cols: [{
                    span: 12,
                    widgets: [{ id: 'adfsdfs' }]
                }]
            }]
    },
    


   /************************************
   *  
   * EVENTS FIRED BY THE EDITOR  
   *
   ***********************************/
    events:function () {

        //fires when the page loads.   assumes the editor has an accessor to the window
        this.fireEvent('load', editor);


        //fires when a widget is first dropped into a zone
        this.fireEvent('widgetdrop', {
            //the editor firing the event
            editor: editor,
            //the widgetTypeId of the widgetBeing dropped
            widgetTypeId: 'qewr-asdf-asdf',
            //callback method to be called when content and data are ready to be inserted into the page
            // html is the markup to be inserted the 
            // data is the persistable widgetInstanceData of the widget
            callback: function (html, data) {
                
            }
        });
        

        //fires when a widget's edit action is invoked... same signature as above but adding data
        this.fireEvent('widgetedit', {
            //the editor firing the event
            editor: editor,
            //the widgetTypeId of the widgetBeing dropped
            widgetTypeId: 'qewr-asdf-asdf',
            // the  widgetInstanceData of the widget
            data: {
                id: '111-222-333',
                typeId: 'qewr-asdf-asdf',
                config: {
                    userId: 'adsf',
                    keywords: ['cats', 'more cats'],
                    count: 22
                }
            },
            //callback method to be called when content and data are ready to be inserted into the page
            // html is the markup to be inserted the 
            // data is the persistable widgetInstanceData of the widget
            callback: function (html, data) {

            }
        });
        

        //fires when the dirty state of the page has changed.
        //sends the editor and the  state value
        this.fireEvent('dirtychange', editor, true);

    },
    /************************************
    *  
    * PUBLIC METHODS ON THE EDITOR
    *
    ***********************************/
    getPersistanceData : function() {
        return {
            layout: this.getLayoutData(),
            widgets: this.getWidgetData()
        };
    },
    


    /************************************
    *  
    * PUBLIC METHODS ON THE sitebuilderEditor
    * accesed by : Taco.app.controllers.get('sitebuilder')
    *
    *************************************/
    //returns an array of widgetTypeDefinition
    findWidgetTypeDefinitions:function(filter) {
        return [];
    }
});