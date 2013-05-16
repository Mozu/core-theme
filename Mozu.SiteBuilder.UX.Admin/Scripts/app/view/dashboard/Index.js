/**
 * @class Taco.view.dashboard.Index
 */
    Ext.define('Taco.view.dashboard.Index', {
        extend: 'Taco.core.ux.content.Container',
        
        initComponent: function () {
            var me = this;
            var renderDataObject = {};
            var storeObj = {
                "store":[
                ]
            };
            var catalogObj = {
                "catalog":[
                    /*{"name":"Site Group 1: Maxine", "item":[{"name": "Maxine.com"},{"name": "MaxShoes.com"}]},
                    {"name":"Site Group 2: Vinici", "item":[{"name": "Vinici.com"}]}*/
                ]
            };

            var contextStore = Taco.app.context.getStore();
            console.log(contextStore.data);

            //builds store and catalog objects
            contextStore.data.items.forEach(buildStoreData);
            function buildStoreData(el, index, arr){
                
                if(el.data.urlToken.indexOf('t-')){
                    if(el.data.urlToken.indexOf('c-')){
                      //filters out tenants and site groups bassed on its code
                      var token = el.data.urlToken.toString().substring(2,el.data.urlToken.toString().length);
                      storeObj.store.push({"name":el.data.name, "urlToken":el.data.urlToken, "url": "/_gosite/"+token});   
                    }
                   if(!el.data.urlToken.indexOf('c-')){
                      //filters out tenants and site groups bassed on its code
                      console.log(el.data);
                      catalogObj.catalog.push({"name":el.data.name, "urlToken":el.data.urlToken, "item":[]});   
                    }
                    if(!el.data.urlToken.indexOf('s-')){
                      //filters out tenants and site groups bassed on its code
                      catalogObj.catalog[catalogObj.catalog.length-1].item.push({"name":el.data.name, "urlToken":el.data.urlToken});  
                    }
                }
                
            };

            //combins both objects
            function merge_options(obj1,obj2){
                var obj3 = {};
                for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
                for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
                return(obj3);
            }
            renderDataObject = merge_options(storeObj,catalogObj);

            me.header = {
                title: 'Dashboard: All Collections',
                actions: [
                {
                    xtype: 'primarybutton',
                    text: '+ Add Widget'
                }]
                    
            };
            me.body = {
                renderData: renderDataObject, 
                renderTpl: "<div class='taco-home-page'>"+
"       <div class='taco-home-page-row-large'> "+
"           <div class='taco-home-page-medium-item taco-home-page-sales'></div>"+
"           <div class='taco-home-page-medium-item taco-home-page-customers'></div>"+
"           <div class='taco-home-page-medium-item'>"+
"           <div class='taco-home-page-item-header taco-home-page-item-header-main'>QUICK LINKS</div>"+

"           <div class='taco-home-page-item-header'>Manage WebStite</div>" +
//repeat this part
"               <tpl for='store'>"+
"                   <ul class='taco-home-page-tree'>"+
"                       <li>{[values.name]} <div class='taco-home-page-site-settings'><a href='{[values.url]}'>Preview</a> | <a href='/admin/{[values.urlToken]}/sites/pages'>Edit</a> | <a href='/admin/{[values.urlToken]}/generalsettings'>Settings</a></div></li>"+
"                       <li></li>"+
"                   </ul>"+
"               </tpl>"+
//stop repeat here for web sites
"           <hr></hr>"+
"           <div class='taco-home-page-item-header'>Catalog Management</div>"+
//repeat this part
"               <tpl for='catalog'>"+
"                   <ul class='taco-home-page-tree'>"+
"                       <li><a href='/admin/{[values.urlToken]}/products'>{[values.name]}</a></li>"+
"                       <li>"+
"                           <ul>"+
"                               <tpl for='values.item'>"+
"                                   <li><a href='/admin/{[values.urlToken]}/products'>{[values.name]}</a></li>"+
"                               </tpl>"+
"                           </ul>"+
"                       </li>"+
"                   </ul>"+
"               </tpl>"+
//stop repeat here for web sites  
"       </div>"+
"       </div>"+
"       <div class='taco-home-page-row-small'>"+
"           <div class='taco-home-page-small-item taco-home-page-device'></div>"+
"           <div class='taco-home-page-small-item taco-home-page-bounce-rate'></div>"+
"           <div class='taco-home-page-small-item taco-home-page-time-on-sites'></div>"+
"           <div class='taco-home-page-small-item taco-home-page-vistors'></div>"+
"           <div class='taco-home-page-small-item taco-home-page-new-returning-visitors'></div>"+
"       </div>"+
"       <div class='taco-home-page-row-small'>"+
"           <div class='taco-home-page-small-item taco-home-page-uptime'></div>"+
"           <div class='taco-home-page-small-item taco-home-page-load-time'></div>"+
"           <div class='taco-home-page-small-item taco-home-page-live-visitors'></div>"+
"           <div class='taco-home-page-small-item taco-home-page-conversion-rate'></div>"+
"           <div class='taco-home-page-small-item taco-home-page-opened-unopened-mail'></div>"+
"       </div>"+
"   </div>"
            };
            me.callParent(arguments);
        }
    });


