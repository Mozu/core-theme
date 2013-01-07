using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.ProductAdmin.Contracts.Clients;
using System.Runtime.Serialization;

using Mozu.SiteBuilder.Mvc.Models.CMS;
using System.Runtime.Serialization.Json;
using Mozu.SiteBuilder.Mvc;
using Mozu.Content.Contracts.Clients;
using System.Text;
using System.IO;
using Mozu.Content.Contracts;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class WidgetsController : BaseController
    {
        
         private readonly IProductWebApiClient   _productClient;
   
        ISiteBuilderContext _context;
        ICmsTypeHelper _cmsTypeHelper;
        ICmsServiceWrapper _cmsService;
        private readonly IWidgetProvider _widgetProvider;

        public WidgetsController(IProductWebApiClient productClient, ISiteBuilderContext context,  ICmsTypeHelper cmsTypeHelper, IProvisioningHelper provHelper, ICmsServiceWrapper cmsService, IWidgetProvider widgetProvider)
        {
            _productClient = productClient;
            _context = context;
            _cmsService = cmsService;
            _widgetProvider = widgetProvider;

            _cmsTypeHelper = cmsTypeHelper;
            provHelper.ProvisionCms();
        }

        public ActionResult Index()
        {
            return View();
        }
        public ActionResult Widget ( string id )
        {
            return null;
        }

       
       [HttpPost ()]
        public ActionResult Preview()
        {
            _context.IsEditMode = true;
            var stream = this.HttpContext.Request.InputStream;
            stream.Position = 0;
            var ser = new DataContractJsonSerializer(typeof(WidgetPreviewContext));
            var context = (WidgetPreviewContext)ser.ReadObject(stream);
            
            if (context == null || context.PageContext == null || context.PageContext.WidgetCreationTags == null || context.PageContext.WidgetCreationTags.Count == 0)
            {
                throw new InvalidOperationException("missing WidgetCreationTags");
            }


           var tags = context.PageContext.WidgetCreationTags.Where(x => !string.IsNullOrEmpty(x)).Select(x => (object) x.ToLowerInvariant()).ToArray();
           if ( context.ZoneScope == "global")
           {
               tags = tags.Union(new object[]{"global"}).ToArray();
           }
            var def = _widgetProvider.GetWidgets().First(x => x.Id == context.DefinitionId);
            WidgetInstance wid = new WidgetInstance(this._cmsTypeHelper, this._context)
            {
                DefinitionId = def.Id,
                Collection = "widgets",
                WigetDefinition = def,
                Id= "new-" + Guid.NewGuid ().ToString (),
                
            };

            if ( context.Document != null )
            {
                wid.Properties = new CmsPropertyCollection(context.Document.Items.Select(x => new CmsProperty( x.Key, x.Value, _cmsTypeHelper.GetPropertyType ( x.Key ))));
                wid.Id = context.Document.DocumentId ;
            }
            wid.IsPreview = true;
            if ( wid.Id == null )
            {
                wid.Id = "new-" + Guid.NewGuid().ToString();
            }
            if ( wid.Properties == null )
            {
                wid.Properties = new CmsPropertyCollection();
            }

            foreach (var prop in def.Properties ?? Enumerable.Empty <WidgetDefintionProperty >() )
            {
                if ( wid.Properties[prop.Key ]== null )
                {
                    wid.Properties.Add ( new CmsProperty(prop.Key,  prop.Value, _cmsTypeHelper.GetPropertyType ( prop.Key ) ));
                }
            }


            wid.Properties.Set(CmsConstants.Widgets.widget_tags, tags , _cmsTypeHelper.GetPropertyType(CmsConstants.Widgets.widget_tags));
           
          
          
            wid.Properties.Set(CmsConstants.Widgets.widget_type_id, def.Id, _cmsTypeHelper.GetPropertyType(CmsConstants.Widgets.widget_type_id));


            wid.Properties.Set(CmsConstants.Widgets.page_type_definition, "widget", _cmsTypeHelper.GetPropertyType(CmsConstants.Widgets.page_type_definition));

            wid.Properties.Set(CmsConstants.Widgets.widget_zone, context.ZoneId, _cmsTypeHelper.GetPropertyType(CmsConstants.Widgets.widget_zone));


            if (this.HttpContext.Request.ContentType == "application/json")
            {
                var tw = new StringWriter();
                var viewRes = System.Web.Mvc.ViewEngines.Engines[0].FindPartialView(this.ControllerContext, def.DisplayTemplate,  true);
                if (viewRes.View != null)
                {
                    var vc = new ViewContext(this.ControllerContext, viewRes.View, new ViewDataDictionary(), this.TempData, tw);
                    vc.ViewData.Model = wid;
                    viewRes.View.Render(vc, tw);
                }
                else
                {
                    throw new Exception("can't find template " + def.DisplayTemplate);
                }
                var jsonData = new WidgetPreviewContext ()
                {
                    Output  = tw.GetStringBuilder ().ToString (),
                    Document  = new Mozu.SiteBuilder.Mvc.Models.CMS.Admin.Document()
                    {
                        DocumentId = wid.Id ,
                        CollectionName = CmsConstants.Widgets.collection_name,
                        DocumentType = wid.DocumentTypeName  ?? CmsConstants.Widgets.default_content_type ,
                        Name = Guid.NewGuid ().ToString (),
                        Items = wid.Properties.Select ( x=>
                                new Mozu.SiteBuilder.Mvc.Models.CMS.Admin.DocumentProperty()
                                {
                                    Key= x.Key ,
                                    Value = x.RawValue  
                                }).ToList ()
                    }
                    
                };
               
                return new JsonDCResult()
                {
                    Data = jsonData,
                    JsonRequestBehavior = JsonRequestBehavior.AllowGet
                };

            }
            else
            {
                var vr = View(wid);
                vr.ViewName = def.DisplayTemplate;
                return vr;
            }
            
            
        }


        bool HasVisitedZone(string zoneId)
        {
            string key = "visitedZones";
            if ( ControllerContext == null || ControllerContext.HttpContext == null || ControllerContext.HttpContext.Items == null )
            {
                return false;
            }
            var hs = (HashSet<string>)ControllerContext.HttpContext.Items [key];
            if ( hs ==null )
            {
               ControllerContext.HttpContext.Items[key] = hs =  new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            }
            if ( hs.Contains( zoneId ??""))
            {
                return true;
            }
            else
            {
                hs.Add(zoneId ?? "");
                return false;
            }
        }

       public ActionResult Zone(List<string> widgetQuery, string zoneId)
        {
            if (HasVisitedZone(zoneId))
           {
               return new ContentResult()
                          {
                              Content = "<!--sof "+ zoneId +"-->"
                          };
           }

            var pageWidgets = _context.PageContext.Widgets;
            if (pageWidgets == null)
            {
               //todo:refactor to not shit...
                var query = widgetQuery ?? _context.PageContext.WidgetQuery ?? new List<string>();

                query.AddRange(_context.PageContext.WidgetCreationTags ?? Enumerable.Empty<string>());


                if (query == null || query.Count == 0)
                {
                    return new EmptyResult();
                }
                query = query.Where(x => !string.IsNullOrEmpty(x)).Select(x => x.ToLowerInvariant()).Union(new string[]{"global"}).Distinct().ToList();
            
                PagedCollection<Mozu.Content.Contracts.Document> allWidgets = null;
                var filter = string.Join ( " or " , query.Select  ( x=> string.Format ( "Properties.widget_tags eq \"{0}\"", x)));


             
               // allWidgets = _docRepo.List("widgets", null, null, null, CmsConstants.Documents.doc_state_active  ,null, filter  ,null,  600, 0).Result.ReadAsSync();
                allWidgets = _cmsService.GetList ("widgets" , filter:filter, pageSize:25 ).Result.ReadAsSync();

                    
                    //_cmsService.GetList(cmsReq).Result.ReadAsSync();
                
                
                _context.PageContext.Widgets  = allWidgets.Items
                    .Select(_doc => AutoMapper.Mapper.Map<WidgetInstance >( _doc))
                    .Where ( x=> x.WigetDefinition != null )
                        .OrderBy ( x=> x.Sequence )
                        .ToList();

                
            }
            var zoneWidgets = _context.PageContext.Widgets.Where(_ => string.Equals(_.ZoneId, zoneId, StringComparison.OrdinalIgnoreCase)).ToList();

            //StringBuilder sb = new StringBuilder();
            var tw = new StringWriter ();
            foreach (var zw in zoneWidgets)
            {

                var viewRes = System.Web.Mvc.ViewEngines.Engines[0].FindPartialView(this.ControllerContext, zw.WigetDefinition.DisplayTemplate,  true);
                if (viewRes.View != null)
                {
                    var vc = new ViewContext(this.ControllerContext, viewRes.View, new ViewDataDictionary(), this.TempData, tw);
                    vc.ViewData.Model = zw;
                    viewRes.View.Render(vc, tw);
                }

            }
            return new ContentResult()
            {
                Content = tw.GetStringBuilder().ToString()
            };
            
        }

    }
}
