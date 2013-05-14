/**
 * @class Taco.view.dashboard.Index
 */
    Ext.define('Taco.view.dashboard.Index', {
        extend: 'Taco.core.ux.content.Container',
        
        initComponent: function () {
            var me = this;
           /* 
            me.header = {
                title: Taco.app.context.getCurrent().contextType == 't'?'All Stuff Dashboard': Taco.app.context.getCurrent().contextType == 'c'?Taco.app.context.getCurrent().name +' Site Collection Dashboard': Taco.app.context.getCurrent().name +' Site  Dashboard'
                    
            };*/
            
            me.body = {
                renderData: {
                   "filter":[
                        {"item":{"name": "Store 1 - All Clothing"}},
                        {"item":{"name":"Store 2 - Torso Tops"}}
                   ],
                   "store":[
                        {"name":"Store 1 - All Clothing", "item":[{"name": "Store 1 - All Clothing - English"},{"name": "Store 1 - All Clothing - Spanish"}]},
                        {"name":"Store 2 - All Clothing", "item":[{"name": "Store 1 - All Clothing - German"},{"name": "Store 1 - All Clothing - Chinese"}]},
                   ]
                },
                renderTpl: "<div class='taco-home-page'>"+
"       <div class='taco-home-page-row-one'> "+
"           <p>Statictics for the Last 7 Days</p>"+
"           <select>"+
"             <option value='all'>All</option>"+
"           </select>"+
"       </div>"+
"       <div class='taco-home-page-row-two'> "+
"           <div class='taco-home-page-mini-item'>"+
"               <div>"+
"                   <div class='taco-item-header'>Sales Total</div>"+
"                   <div><p class='taco-money-item'>$9549.06</p><p class='taco-percent-pos-item'>8.9%</p></div>"+
"                   <div class='taco-previous-text'>Previous $8833.97</div>"+
"               </div>"+
"           </div>"+
"           <div class='taco-home-page-mini-item'>"+
"               <div>"+
"                   <div class='taco-item-header'>New Customers</div>"+
"                   <div><p class='taco-money-item'>32</p><p class='taco-percent-pos-item'>100%</p></div>"+
"                   <div class='taco-previous-text'>Previous 16</div>"+
"               </div>"+
"           </div>"+
"           <div class='taco-home-page-mini-item'>"+
"               <div>"+
"                   <div class='taco-item-header'>Visitors</div>"+
"                   <div><p class='taco-money-item'>113</p><p class='taco-percent-pos-item'>25.47%</p></div>"+
"                   <div class='taco-previous-text'>Previous 106</div>"+
"               </div>"+
"           </div>"+
"           <div class='taco-home-page-mini-item'>"+
"               <div>"+
"                   <div class='taco-item-header'>Page Views</div>"+
"                   <div><p class='taco-money-item'>325</p><p class='taco-percent-neg-item'>-2.85%</p></div>"+
"                   <div class='taco-previous-text'>Previous 344</div>"+
"               </div>"+
"           </div>"+
"           <div class='taco-home-page-mini-item'>"+
"               <div>"+
"                   <div class='taco-item-header'>Page Views/Visitors</div>"+
"                   <div><p class='taco-money-item'>2.44</p><p class='taco-percent-neg-item'>-12.81%</p></div>"+
"                   <div class='taco-previous-text'>Previous 3.35</div>"+
"               </div>"+
"           </div>"+
"       </div>"+
"       <div class='taco-home-page-row-three'>"+
"           <div class='taco-home-page-large-item'>" +
"             <div>"+
"             <p>Trends</p>"+
"             <select>"+
"               <option value='top5'>Site Traffic</option>"+
"             </select>" +
"             </div>"+
"           <p>Visitors - Sales - Top Pages</p>"+                            
"           </div>"+
"           <div class='taco-home-page-small-item'>Work Box</div>"+
"       </div>"+
"       <div class='taco-home-page-row-four'>"+
"           <div class='taco-home-page-medium-item'>"+
"           <div class='taco-home-page-item-header'>Managae WebStite</div>"+
//repeat this part
"               <tpl for='store'>"+
"                   <ul class='taco-home-page-tree'>"+
"                       <li>{[values.name]}</li>"+
"                       <li>"+
"                           <ul>"+
"                               <tpl for='values.item'>"+
"                                   <li><a href=''>{[values.name]}</a><a href='' class='taco-home-page-site-settings'>Site Settings</a></li>"+
"                               </tpl>"+
"                           </ul>"+
"                       </li>"+
"                   </ul>"+
"                   <hr></hr>"+
"                   <a href='' class='taco-home-page-create-new'>[+] Create a New Version</a>"+
"               </tpl>"+
//stop repeat here for web sites
"           <hr></hr>"+
"           <button class='taco-home-page-button'>Create New Website</button>"+ 
"           </div>"+
"           <div class='taco-home-page-medium-item'>"+
"           <div class='taco-home-page-item-header'>Managae Catalog</div>"+
"               <ul class='taco-home-page-tree'>"+
"                   <li>Products</li>"+
"                   <li>"+
"                       <ul>"+
"                           <li><a href=''>View Latest Products Added</a></li>"+
"                           <li><a href=''>View Low Inventory</a></li>"+
"                           <li><a href=''>View All Shoes</a></li>"+
"                       </ul>"+
"                   </li>"+
"               </ul>"+
"               <hr></hr>"+
"               <a href='' class='taco-home-page-create-new'>[+] Create a New Product</a>"+
"               <ul class='taco-home-page-tree'>"+
"                   <li>Website Filters</li>"+
"                   <li>"+
"                       <ul>"+
//Catalog tpl start
"                           <tpl for='filter'>"+
"                               <li><a href=''>{[values.item.name]}</a></li>"+
"                           </tpl>"+
//end of tpl
"                       </ul>"+
"                   </li>"+
"               </ul>"+
"               <hr></hr>"+
"               <a href='' class='taco-home-page-create-new'>[+] Create a New Filter</a>"+
"           </div>"+
"           <div class='taco-home-page-small-item'>Guidance</div>"+
"       </div>"+
"       <div class='taco-home-page-row-five'>"+
"           <div class='taco-home-page-medium-item'>"+
"           <p>Sales</p>"+
"           <select>"+
"             <option value='top5'>Top 5 Products</option>"+
"           </select>"+
"           </div>"+
"           <div class='taco-home-page-medium-item'>CRM </div>"+
"           <div class='taco-home-page-small-item'>News</div>"+
"       </div>"+
"   </div>"
            };
            me.callParent(arguments);
        }
    });


