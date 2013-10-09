//using System;
//using System.Collections;
//using System.Collections.Generic;
//using System.Runtime.Caching;
//using System.Web;

//using Autofac;
//using Mozu.CommerceRuntime.Contracts.Payments;
//using NDjango;
//using NDjango.Interfaces;
//using Mozu.SiteBuilder.Mvc.Security;

//namespace Mozu.SiteBuilder.Mvc.ViewEngine
//{
//    public interface IViewPathContainer
//    {
//        string ViewPath
//        {
//            get;
//        }
//    }



//    //interface ITemplateManagerProvider
//    //{
//    //    ITemplateManager GetManager(HttpContextBase ctx);
//    //}
//    //public class TemplateManagerProvider:ITemplateManagerProvider
//    //{
//    //    private readonly ISiteBuilderContext _siteBuilderContext;
        
//    //    public TemplateManagerProvider(ISiteBuilderContext siteBuilderContext)
//    //    {
//    //        _siteBuilderContext = siteBuilderContext;
//    //    }

//    //    public ITemplateManager GetManager(HttpContextBase ctx)
//    //    {
//    //        var sbc = SiteBuilderContext.GetFromContext(ctx);

//    //        var key = sbc.Theme.Id;

//    //        ITemplateManager manager = null;
//    //        manager = (ITemplateManager) _cache[key];
//    //        if (manager == null)
//    //        {
//    //            lock (_cache)
//    //            {
//    //                manager = (ITemplateManager)_cache[key];
//    //                if (manager == null)
//    //                {
//    //                    manager = sbc.Resolve<ITemplateManager>();
//    //                    _cache[key] = manager;
//    //                }
//    //            }
//    //        }
//    //        return manager;
//    //    }
//    //}

//    class DjangoMozuView : IView, IViewDataContainer, IViewPathContainer
//    {

        
//        internal string viewPath;
//        private readonly string _mappedPath;

//        public DjangoMozuView(ITemplateManager manager, string viewPath, string mappedPath)
//        {
//            // TODO: Complete member initialization
//            //this.TemplateManager = manager;
            
//            this.viewPath = viewPath;
//            _mappedPath = mappedPath;
//        }

//        public string ViewPath
//        {
//            get { return viewPath; }
//        }

   
//        private static object _managerContextKey = new Object();
//        public ITemplateManager GetManager(HttpContextBase ctx)
//        {

//            ITemplateManager manager = (ITemplateManager)ctx.Items[_managerContextKey];
//            if (manager == null)
//            {
//                var sbc = SiteBuilderContext.GetFromContext(ctx);
//                var key = typeof (ITemplateManager).ToString() +sbc.Theme.Id;
//                var cache = System.Runtime.Caching.MemoryCache.Default ;
//                ctx.Items[_managerContextKey] = manager = (ITemplateManager)cache[key];
//                if (manager == null)
//                {
//                    lock (_managerContextKey)
//                    {
//                        manager = (ITemplateManager) cache[key];
//                        if (manager == null)
//                        {
//                            var provider = sbc.Resolve<TemplateManagerProvider>();
//                            ctx.Items[_managerContextKey]  = manager = provider.GetNewManager();
//                            //todo.... add as config or do something
//                            cache.Add(key, manager, new CacheItemPolicy()
//                                                        {
//                                                            AbsoluteExpiration = DateTimeOffset.Now.AddMinutes(10),
//                                                            Priority = CacheItemPriority.NotRemovable
//                                                        });

//                        }
//                    }
//                }
//            }
//            return manager;
//        }



//        public ViewDataDictionary ViewData
//        {
//            get;
//            set;
//        }

//        public void Render(ViewContext viewContext, System.IO.TextWriter writer)
//        {
//            ViewData = viewContext.ViewData;
//            var siteBuilderContext = SiteBuilderContext.GetFromContext(viewContext.HttpContext ) ?? SiteBuilderContext.Current;
//            var requestContext = new Dictionary<string, object>(viewContext.ViewData);
//          //  var authenticationHelper = new AuthenticationHelper(viewContext.HttpContext, provider: new CookieProvider(viewContext.HttpContext,Core.Settings.MozuConfigurationManager.Settings),  cookieName:null);
//           // var gcu = authenticationHelper.GetCurrentUser();
//           // var profile = authenticationHelper.GetCurrentProfileToken();
//            HtmlHelper html;
//            var user = new Mozu.SiteBuilder.UX.Models.Customers.User()
//            {
//                Email = siteBuilderContext.UserProfile.EmailAddress  ,//profile != null ? profile.EmailAddress : null,
//                FirstName = siteBuilderContext.UserProfile.FirstName ,// profile != null ? profile.FirstName : null,
//                LastName = siteBuilderContext.UserProfile.LastName,// profile != null ? profile.LastName : null,
//                UserId =siteBuilderContext.ApiContext.UserClaims.UserId ,// gcu.UserId,
//                IsAuthenticated = !siteBuilderContext.ApiContext.UserClaims.IsAnonymous && siteBuilderContext.ApiContext.UserClaims.IsAuthenticated,//!gcu.IsAnonymous && gcu.IsAuthenticated,
//                IsAnonymous = siteBuilderContext.ApiContext.UserClaims.IsAnonymous 
//            };
//            requestContext["templateVariables"] = viewContext.HttpContext.Items["templateVariables"] = (System.Collections.Hashtable)viewContext.HttpContext.Items["templateVariables"] ?? new System.Collections.Hashtable(StringComparer.OrdinalIgnoreCase);
//            requestContext["Html"] = requestContext["html"] = html = new HtmlHelper(viewContext, this);
//            requestContext["ViewData"] = requestContext["viewData"] = viewContext.ViewData;
//            requestContext["Model"] = requestContext["model"] = viewContext.ViewData.Model;
//            if (viewContext.ParentActionViewContext != null)
//            {
//                requestContext["PageModel"] = requestContext["pageModel"] = viewContext.ParentActionViewContext.ViewData.Model;
//            }
//            requestContext["Session"] = requestContext["session"] = viewContext.HttpContext.Session;
//            //requestContext["Templates"] = new TemplateLocator(html, this.TemplateManager);
//            requestContext["SiteContext"] = requestContext["siteContext"] = siteBuilderContext;
//            requestContext["ThemeSettings"] = requestContext["themeSettings"] = siteBuilderContext.ThemeSettings;
//            requestContext["PageContext"] = requestContext["pageContext"] = siteBuilderContext.PageContext;
//            requestContext["User"] = requestContext["user"] = user;
//            requestContext["true"] = true;
//            requestContext["false"] = false;
//            requestContext["viewPath"] = viewPath;
//            requestContext["PaymentTypes"] = new
//            {
//                CreditCard = PaymentTypeConst.CREDIT_CARD,
//                Check = PaymentTypeConst.CHECK
//            };

//          //  this.
//          //  var result = ViewEngines.Engines.FindPartialView(_html.ViewContext.Controller.ControllerContext, viewPath);

           
//            try
//            {
//                var templateManager = GetManager(viewContext.HttpContext);
//                var reader = templateManager.RenderTemplate(_mappedPath, requestContext);
//                var buffer = new char[4096];
//                int count = 0;

//                while ((count = reader.Read(buffer, 0, buffer.Length)) > 0)
//                {
//                    writer.Write(buffer, 0, count);
//                }
//            }
//            catch (Exception ex)
//            {
//                throw new InvalidOperationException("error in template " + this.viewPath, ex);
//            }
//        }

//        class TemplateLocator : ITemplate
//        {
//            ITemplate _innerTemplate;
//            bool _templateCreated = false;
//            HtmlHelper _html;
//            ITemplateManager _templateManager;
//            List<string> _nameStack = new List<string>();

//            public TemplateLocator(HtmlHelper html, ITemplateManager templateManager)
//            {
//                _html = html;
//                _templateManager = templateManager;
//            }

//            public TemplateLocator this[string propName]
//            {
//                get
//                {
//                    if (_templateCreated)
//                    {
//                        TemplateLocator loc = new TemplateLocator(_html, _templateManager);
//                        loc = (TemplateLocator)loc[propName];
//                        return loc;
//                    }
//                    else
//                    {
//                        _nameStack.Add(propName);
//                        return this;
//                    }


//                }
//            }

          
//            ITemplate InnerTemplate
//            {
//                get
//                {
//                    _templateCreated = true;
//                    if (_innerTemplate == null)
//                    {
//                        var path = String.Join("/", _nameStack);
//                       // var path = this.GetVirtualPath();
//                        _innerTemplate = _templateManager.GetTemplate(path);
//                    }
//                    return _innerTemplate;
//                }
//            }

//            Microsoft.FSharp.Collections.FSharpList<INodeImpl> ITemplate.Nodes
//            {
//                get { return InnerTemplate.Nodes; }
//            }

//            System.IO.TextReader ITemplate.Walk(ITemplateManager tmanager, IDictionary<string, object> dic)
//            {
//                return InnerTemplate.Walk(tmanager, dic);
//            }
//        }


//    }
//}
