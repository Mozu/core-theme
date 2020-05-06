using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using System;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Mozu.Core.Configuration;
using Mozu.Core.Expressions;
using ContentResult = Mozu.SiteBuilder.Mvc.ActionResults.ContentResult;
using FileContentResult = Mozu.SiteBuilder.Mvc.ActionResults.FileContentResult;
using FileStreamResult = Mozu.SiteBuilder.Mvc.ActionResults.FileStreamResult;
using PartialViewResult = Mozu.SiteBuilder.Mvc.ActionResults.PartialViewResult;
using RedirectResult = Mozu.SiteBuilder.Mvc.ActionResults.RedirectResult;
using ViewResult = Mozu.SiteBuilder.Mvc.ActionResults.ViewResult;

namespace Mozu.SiteBuilder.Mvc.Controllers
{
    public class ApiControllerBase : ControllerBase, IHyprController
    {
        static T Resolve<T>(Lazy<IServiceProvider> s)
        {
            return s.Value.Resolve<T>();
        }

        private IServiceProvider _lifetimeScope;

        public IServiceProvider LifetimeScope
        {
            get => _lifetimeScope ??= (IServiceProvider) HttpContext.RequestServices.GetService(typeof(IServiceProvider));
            set => _lifetimeScope = value;
        }

        private ISiteBuilderApiContext _siteBuilderApiContext;

        public ISiteBuilderApiContext SbApiContext
        {
            get => _siteBuilderApiContext ??= LifetimeScope.Resolve<ISiteBuilderApiContext>();
            set => _siteBuilderApiContext = value;
        }

     
        private Task _contextInitTasks;

        public Task ContextInitializationTasks =>
            _contextInitTasks ??= Task.WhenAll(
                new CmsHelper(CmsService).InitCmsPageContext(PageContext, SiteContext, SbApiContext,
                    ExpressionEvaluator, PageRuleVisitor),
                SiteContext.Init());

        public void ResetContextInitilaztionTasks()
        {
            _contextInitTasks = null;
        }

        private Mozu.MZDB.Contracts.Clients.IEntityListsWebApiClient _entityListService;
        public Mozu.MZDB.Contracts.Clients.IEntityListsWebApiClient EntityListService
        {
              get => _entityListService ??= LifetimeScope.Resolve<Mozu.MZDB.Contracts.Clients.IEntityListsWebApiClient>();
              set => _entityListService = value;
        }

        private ICmsServiceWrapper _cmsService;
        public ICmsServiceWrapper CmsService
        {
            get => _cmsService ??= LifetimeScope.Resolve<ICmsServiceWrapper>();
            set => _cmsService = value;
        }

        //private readonly Lazy<ExpressionEvaluatorVisitor<CmsPageRuleContext>> _pageRuleVisitor;

        private
             Lazy<ExpressionEvaluatorVisitor<CmsPageRuleContext>> _pageRuleVisitor;
        public Lazy<ExpressionEvaluatorVisitor<CmsPageRuleContext>> PageRuleVisitor
        {
            get =>
                _pageRuleVisitor;
            //?? (_pageRuleVisitor = LifetimeScope.Resolve<Lazy<ExpressionEvaluatorVisitor<CmsPageRuleContext>>>());

            set => _pageRuleVisitor = value;
        }

        private Lazy<IExpressionEvaluator> _expressionEvaluator;
        public Lazy<IExpressionEvaluator> ExpressionEvaluator
        {
            get =>
                _expressionEvaluator;
            //?? (_expressionEvaluator = LifetimeScope.Resolve<Lazy<IExpressionEvaluator>>());

            set => _expressionEvaluator = value;
        }

        PageContext _pc;
        public PageContext PageContext
        {
            get => _pc ??= LifetimeScope.Resolve<PageContext>();
            set => _pc = value;
        }

        private NavigationContext _navigationContext;
        public  NavigationContext NavigationContext
        {
            get => _navigationContext ??= LifetimeScope.Resolve<NavigationContext>();
            set => _navigationContext = value;
        }

        private CmsPageContext  _cmsPageContext ;
        public CmsPageContext CmsPageContext
        {
            get => _cmsPageContext ??= LifetimeScope.Resolve<CmsPageContext>();
            set => _cmsPageContext = value;
        }


        SiteContext _sc;
        public SiteContext SiteContext
        {
            get => _sc ??= LifetimeScope.Resolve<SiteContext>();
            set => _sc = value;
        }

        protected internal new FileContentResult File(byte[] fileContents, string contentType)
        {
            return File(fileContents, contentType, null /* fileDownloadName */);
        }

        protected internal new virtual FileContentResult File(byte[] fileContents, string contentType, string fileDownloadName)
        {
            return new FileContentResult(fileContents, contentType) { FileDownloadName = fileDownloadName };
        }

        protected internal new virtual FileStreamResult File(Stream fileStream, string contentType, string fileDownloadName)
        {
            return new FileStreamResult(fileStream, contentType) { FileDownloadName = fileDownloadName };
        }

        protected internal new FilePathResult File(string fileName, string contentType)
        {
            return File(fileName, contentType, null /* fileDownloadName */);
        }

        protected internal new virtual FilePathResult File(string fileName, string contentType, string fileDownloadName)
        {
            return new FilePathResult(fileName, contentType) { FileDownloadName = fileDownloadName };
        }

        // var cc = new ControllerContext(new HttpContextWrapper(HttpContext.Current), new RouteData(), new FooController());
        protected internal ViewResult View(object model)
        {
            return View(null /* viewName */, model);
        }

        protected internal ViewResult View(string viewName)
        {
            return View(viewName, model: null);
        }

        protected internal new virtual RedirectResult Redirect(string url)
        {
            return new RedirectResult(url);
        }

        protected internal ViewResult View(string viewName, object model)
        {
            return View(viewName, null /* masterName */, model);
        }

        protected internal virtual ViewResult View(string viewName, string masterName, object model)
        {
            if (model != null)
            {
                ViewData.Model = model;
            }

            if (string.IsNullOrEmpty(viewName))
            {
                viewName = (string)this.ControllerContext.RouteData.Values["action"];
            }

            return new ViewResult
            {
                ViewName = viewName,
                ViewData = ViewData
            };
        }


        protected internal PartialViewResult PartialView()
        {
            return PartialView(null /* viewName */, null /* model */);
        }

        protected internal PartialViewResult PartialView(object model)
        {
            return PartialView(null /* viewName */, model);
        }

        protected internal PartialViewResult PartialView(string viewName)
        {
            return PartialView(viewName, null /* model */);
        }

        protected internal virtual PartialViewResult PartialView(string viewName, object model)
        {
            if (model != null)
            {
                ViewData.Model = model;
            }

            return new PartialViewResult
            {
                ViewName = viewName,
                ViewData = ViewData
            };
        }

        private Microsoft.AspNetCore.Mvc.ViewFeatures.ViewDataDictionary _viewDataDictionary;
        public Microsoft.AspNetCore.Mvc.ViewFeatures.ViewDataDictionary ViewData
        {
            get
            {
                if (_viewDataDictionary != null) return _viewDataDictionary;
                _viewDataDictionary = new Microsoft.AspNetCore.Mvc.ViewFeatures.ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary()) { ["ControllerContext"] = ControllerContext};
                //_viewDataDictionary["ControllerContext"] = this.MvcControlerContext;
                return _viewDataDictionary;
            }
            set => _viewDataDictionary = value;
        }
    }
}
