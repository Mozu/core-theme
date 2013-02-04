using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using DC = Mozu.Content.Contracts;
using VM = Mozu.SiteBuilder.Mvc.Models.CMS;

using AutoMapper;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Collections;
using Mozu.Content.Contracts;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using Mozu.SiteBuilder.Mvc.Extensions;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ValidateInput(false)]
    public class CmsPagesController : BaseController
    {

        protected IDocumentWebApiClient _docRepo;
        protected IDocumentTypeWebApiClient _docTypeRepo;
        protected ICmsServiceWrapper _cmsService;
        protected ISiteBuilderContext _context;
        protected ICmsTypeHelper _cmsTypeHelper;
        public CmsPagesController(
            IDocumentWebApiClient docRepo,
            IDocumentTypeWebApiClient docTypeRepo,
            ISiteBuilderContext context,
            IProvisioningHelper provHelper,
            ICmsServiceWrapper cmsService,
            ICmsTypeHelper cmsTypeHelper

            )
        {

            _docRepo = docRepo;
            _docTypeRepo = docTypeRepo;
            _cmsService = cmsService;
            _context = context;
            _cmsTypeHelper= cmsTypeHelper;

           

        }





        public ActionResult Index()
        {
            
            return View();
        }

        [HttpGet]
        public async Task<ActionResult> NotFound()
        {
            

            var res = await Page("pages", "404");
            if (res is HttpNotFoundResult)
            {
                var ptd = _cmsTypeHelper.GetPageTypeDefinitions().Result.First(x => x.DefaultValues != null && (string)x.DefaultValues.GetValue(CmsConstants.Widgets.page_type) == "404");
                var reqDocs = new List<Mozu.SiteBuilder.Mvc.Models.CMS.Admin.Document>(){
                    new Mozu.SiteBuilder.Mvc.Models.CMS.Admin.Document(){
                      Items = new List<VM.Admin.DocumentProperty>()
                      {
                          new VM.Admin.DocumentProperty ()
                          {
                              Key = CmsConstants.Widgets.page_type_definition,
                              Value = ptd.Id 
                          }
                      }
                    }
                };

                var task = await _cmsService.Create ( reqDocs).First ();
                


                //CreatePage("Page Not Found", "404_page", "404");
                //this.SiteContext.PageContext.WidgetCreationTags.Add("404");
                res = await Page("pages", "404");
            }


            return res;


        }
        //
        // GET: /StoreFront/Details/5
        [HttpGet]
        public async Task<ActionResult> Home()
        {


            var res = await Page("pages", "home");
            if (res is HttpNotFoundResult)
            {
                var ptd = _cmsTypeHelper.GetPageTypeDefinitions().Result.First(x => x.DefaultValues != null && (string)x.DefaultValues.GetValue(CmsConstants.Widgets.page_type) == "homepage");
                var reqDocs = new List<Mozu.SiteBuilder.Mvc.Models.CMS.Admin.Document>(){
                    new Mozu.SiteBuilder.Mvc.Models.CMS.Admin.Document(){
                      Items = new List<VM.Admin.DocumentProperty>()
                      {
                          new VM.Admin.DocumentProperty ()
                          {
                              Key = CmsConstants.Widgets.page_type_definition,
                              Value = ptd.Id 
                          }
                      }
                    }
                };

                var task = _cmsService.Create ( reqDocs).First ();
                task.Wait ();
                


                //_cmsService.Create ( )
                //CreatePage("home page", "home", "home");

                res = await Page("pages", "home");
            }
            //this.SiteContext.PageContext.WidgetCreationTags.Add("home");
            ViewResult vr = res as ViewResult;
            vr.ViewName = "index";


            return vr;
        }

        //
        // GET: /StoreFront/Details/5
        [HttpGet]
        public async Task<ActionResult> Page(string collection, string pageName)
        {
            

            DC.Document doc = _cmsService.GetByPath(collection, pageName, null).Result.ReadAsSync();

            //pants
            if (doc == null)
                return new HttpNotFoundResult("not found dumb dumb");

            var vm = Mapper.Map<DC.Document, VM.Document>(doc);
            var pc = this.SiteContext.PageContext;

            //pc.WidgetCreationTags.Add(doc.ToWidgetStem());
            pc.CollectionId = collection;
            pc.DocumentId = doc.Id;
            pc.Title = vm.Properties.GetValue("title") as string;
            pc.MetaDescription = vm.Properties.GetValue("meta_description") as string;
            pc.MetaTitle = vm.Properties.GetValue("meta_title") as string;
            pc.PageType = (string)(vm.Properties.GetValue("page_type")) ?? "cmspage";

            


            var template = ((string)(vm.Properties.GetValue("template")) ?? this.HttpContext.Request["template"] ?? "page");
            
            
            pc.WidgetContext = new WidgetPageContext()
                                   {
                                       Page = doc,
                                       TemplateName = template,
                                       SiteTemplateName = "default"
                                   };


            var vr =ViewEngines.Engines.FindView(this.ControllerContext, template, null);
            if ( vr.View == null)
            {
                vr = ViewEngines.Engines.FindView(this.ControllerContext, "blankpage", null);
            }

            var result = View(vr.View , vm);
            var x = false;
            x = await this.AsyncInitWidgetData();


            return result;
        }





        //
        // GET: /StoreFront/Create

        //public ActionResult Create(string collection, string pageName)
        //{
        //    var doc = new DC.Document()
        //    {
        //        Id = Guid.NewGuid().ToString(),
        //        DocumentType = "web_page",
        //        Properties = new List<DC.PropertyValue>(),
        //        Name = pageName
        //    };

        //    _docRepo.Create(collection, doc).Wait();
        //    return RedirectToRoute("StoreFront_pages", new { pageName = pageName });

        //}




        //
        // POST: /StoreFront/Create

        //[HttpPost]
        //public ActionResult Create(FormCollection collection)
        //{
        //    try
        //    {
        //        // TODO: Add insert logic here

        //        return RedirectToAction("Index");
        //    }
        //    catch
        //    {
        //        return View();
        //    }
        //}

        //
        // GET: /StoreFront/Edit/5

        //public ActionResult Edit(int id)
        //{
        //    return View();
        //}

        //
        // POST: /StoreFront/Edit/5


        //
        // GET: /StoreFront/Delete/5

        //public ActionResult Delete(int id)
        //{
        //    return View();
        //}

        //
        // POST: /StoreFront/Delete/5

        //[HttpPost]
        //public ActionResult Delete(int id, FormCollection collection)
        //{
        //    try
        //    {
        //        // TODO: Add delete logic here

        //        return RedirectToAction("Index");
        //    }
        //    catch
        //    {
        //        return View();
        //    }
        //}
    }
}
