/**
 * @class Taco.view.dashboard.Index
 */
    Ext.define('Taco.view.dashboard.Index', {
        extend: 'Taco.core.ux.content.Container',
        
        initComponent: function () {
            var me = this;

            me.header = {
                title: 'Dashboard: All Collections',
                actions: [
                {
                    xtype: 'primarybutton',
                    text: '+ Add Widget'
                }]
                    
            };
            me.body = {
                renderData: {
                   "filter":[
                        {"item":{"name": "Store 1 - All Clothing"}},
                        {"item":{"name":"Store 2 - Torso Tops"}}
                   ],
                   "store":[
                        {"name":"Maxine.com"},
                        {"name":"MaxShoes.com"},
                        {"name":"Vinici.com"}
                   ],
                   "catalog":[
                        {"name":"Site Group 1: Maxine", "item":[{"name": "Maxine.com"},{"name": "MaxShoes.com"}]},
                        {"name":"Site Group 2: Vinici", "item":[{"name": "Vinici.com"}]}
                   ]
                },
                renderTpl: "<div class='taco-home-page'>"+
"       <div class='taco-home-page-row-large'> "+
"           <div class='taco-home-page-medium-item taco-home-page-sales'></div>"+
"           <div class='taco-home-page-medium-item taco-home-page-customers'></div>"+
"           <div class='taco-home-page-medium-item'>"+
"           <div class='taco-home-page-item-header'>Quick Links</div>"+
"           <div class='taco-home-page-item-header'>Managae WebStite</div>"+
//repeat this part
"               <tpl for='store'>"+
"                   <ul class='taco-home-page-tree'>"+
"                       <li>{[values.name]} <div class='taco-home-page-site-settings'><a href=''>Preview</a> | <a href=''>Edit</a> | <a href=''>Settings</a></div></li>"+
"                       <li></li>"+
/*
"                       <li>"+
"                           <ul>"+
"                               <tpl for='values.item'>"+
"                                   <li><a href=''>{[values.name]}</a><a href=''>Site Settings</a></li>"+
"                                   <li><a href=''><a href=''>Site Settings</a></li>"+
"                               </tpl>"+
"                           </ul>"+
"                       </li>"+
*/
"                   </ul>"+
"                   <hr></hr>"+
"               </tpl>"+
//stop repeat here for web sites
"           <div class='taco-home-page-item-header'>Catalog Management</div>"+
//repeat this part
"               <tpl for='catalog'>"+
"                   <ul class='taco-home-page-tree'>"+
"                       <li>{[values.name]}</li>"+
"                       <li>"+
"                           <ul>"+
"                               <tpl for='values.item'>"+
"                                   <li><a href=''>{[values.name]}</a></li>"+
"                               </tpl>"+
"                           </ul>"+
"                       </li>"+
"                   </ul>"+
"                   <hr></hr>"+
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


