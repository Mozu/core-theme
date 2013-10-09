//// -----------------------------------------------------------------------
//// <copyright file="DjangoViewEngine.cs" company="Microsoft">
//// TODO: Update copyright text.
//// </copyright>
//// -----------------------------------------------------------------------

//using System;
//using System.Collections.Generic;
//using System.Runtime.Caching;
//using System.Web;
//using System.Web.Hosting;
//using System.Web.Mvc;
//using System.Web.Routing;
//using Mozu.SiteBuilder.Mvc.Themes;
//using NDjango.Interfaces;

//namespace Mozu.SiteBuilder.Mvc.ViewEngine
//{
//    public class DjangoMozuViewEngine : VirtualPathProviderViewEngine
//    {
//        private static readonly string[] g_formats = new[] {"templates\\modules\\{0}", "templates\\{0}"};

   
//        private static readonly string[] g_template_formats = new[] {"templates\\pages\\{0}"};
//        private static readonly string[] g_widget_formats = new[] {"widgets\\{0}"};


//        public DjangoMozuViewEngine(ITemplateManager templateManager, MozuVirtualPathProvider mozuVirtualPathProvider)

//        {
//            TemplateManger = templateManager;

//           VirtualPathProvider = mozuVirtualPathProvider;
//        }


//        public MozuVirtualPathProvider PathProvider
//        {
//            get { return (MozuVirtualPathProvider) VirtualPathProvider; }
//        }

//        public ITemplateManager TemplateManger { get; set; }


//        public override ViewEngineResult FindPartialView(ControllerContext controllerContext, string partialViewName, bool useCache)
//        {
//            partialViewName = partialViewName == null ? null : partialViewName.ToLowerInvariant().Replace("/", "\\");
//            string area = controllerContext == null ? null : AreaHelpers.GetAreaName(controllerContext.RouteData);
//            string controller = controllerContext == null ? null : controllerContext.RouteData.GetRequiredString("controller");

//            string[] formats = string.Equals("widgets", controller, StringComparison.OrdinalIgnoreCase) ? g_widget_formats : g_formats;


//            return FindViewInternal(controllerContext, partialViewName, null, useCache, area, formats);
//        }


//        private IEnumerable<string> GetViewVariants(string view, Theme theme)
//        {
//            yield return view;


//            if (theme.EnableCoreVaraints.GetValueOrDefault(false))
//            {
//                int pos = view.LastIndexOf('\\');
//                if (pos > -1 && pos + 1 < view.Length)
//                {
//                    yield return view.Substring(0, pos + 1) + "_" + view.Substring(pos + 1);
//                }
//                else
//                {
//                    yield return "_" + view;
//                }
//            }
//        }


//        public override ViewEngineResult FindView(ControllerContext controllerContext, string viewName, string masterName, bool useCache)
//        {
//            string area = controllerContext == null ? null : AreaHelpers.GetAreaName(controllerContext.RouteData);
//            string[] formats = g_template_formats;
//            return FindViewInternal(controllerContext, viewName, null, useCache, area, formats);
//        }

         


//        public ViewEngineResult FindViewInternal(ControllerContext controllerContext, string viewName, string masterName, bool useCache, string area, string[] formats)
//        {
//            ISiteBuilderContext sbc = SiteBuilderContext.GetFromContext(controllerContext.HttpContext);
//            string controller = controllerContext == null ? null : controllerContext.RouteData.GetRequiredString("controller");
//            ICollection<Theme> themeStack = sbc.Theme.Stack;
//            string key = null;
//            if (useCache)
//            {
//                key = controller + ";" + viewName + ";" + area + ";" + sbc.Theme.Id;

//                var val = MemoryCache.Default[key] as ThemeFileSystemInfo;
//                if ( val != null)
//                {
//                    return new ViewEngineResult(CreateView(val), this);
//                }
//            }


//            var searchedLocations = new List<string>();


//            foreach (string format in formats)
//            {
//                string vpath = string.Format(format, viewName, controller, area);
//                searchedLocations.Add(vpath);
//                var themeFileInfo = this.GetPathProviderFromContext(controllerContext).GetThemeFileInfo(vpath, false );
//                if (themeFileInfo != null)
//                {
//                    if (useCache)
//                    {
//                        MemoryCache.Default.Set(key, themeFileInfo, DateTimeOffset.Now.AddSeconds(30));
//                    }
//                    return new ViewEngineResult(CreateView(themeFileInfo), this);
//                }
                
//            }
//            if (useCache)
//            {
//                MemoryCache.Default.Set(key, string.Empty, DateTimeOffset.Now.AddSeconds(10));
//            }


//            return new ViewEngineResult(searchedLocations);
//        }


//        private string GetLayoutPath(ControllerContext ctx, string relPath)
//        {
//            var res = GetPathProviderFromContext(ctx).GetThemeFileInfo( relPath, false );
//            if (res != null)
//            {
//                return res.FullPath ;
//            }
//            return null;
//        }


//        protected override IView CreatePartialView(ControllerContext controllerContext, string partialPath)
//        {
//            return CreateView(controllerContext, partialPath, null);
//        }

//        protected override bool FileExists(ControllerContext controllerContext, string virtualPath)
//        {
//            return GetPathProviderFromContext(controllerContext).FileExists(virtualPath);
//            return VirtualPathProvider.FileExists(virtualPath);
//        }

//        private MozuVirtualPathProvider GetPathProviderFromContext(ControllerContext controllerContext)
//        {
//            return SiteBuilderContext.GetFromContext(controllerContext.HttpContext).Resolve<MozuVirtualPathProvider>();
//        }

//        protected override IView CreateView(ControllerContext controllerContext, string viewPath, string masterPath)
//        {
//            string fp = GetLayoutPath(controllerContext, viewPath);
//            return new DjangoMozuView(TemplateManger, viewPath, fp);
//        }

//         protected  IView CreateView(ThemeFileSystemInfo fileInfo)
//         {
//             return new DjangoMozuView(TemplateManger, fileInfo.VirtualPath, fileInfo.FullPath);
//         }


//        private string MapPath(string virtual_path)
//        {
//            return HttpContext.Current.Server.MapPath(virtual_path);
//        }

//        internal static class AreaHelpers
//        {
//            // Methods
//            public static string GetAreaName(RouteBase route)
//            {
//                var area = route as IRouteWithArea;
//                if (area != null)
//                {
//                    return area.Area;
//                }
//                var route2 = route as Route;
//                if ((route2 != null) && (route2.DataTokens != null))
//                {
//                    return (route2.DataTokens["area"] ?? route2.Defaults["area"]) as string;
//                }
//                return null;
//            }

//            public static string GetAreaName(RouteData routeData)
//            {
//                object obj2;
//                if (routeData.DataTokens.TryGetValue("area", out obj2))
//                {
//                    return (obj2 as string);
//                }
//                return GetAreaName(routeData.Route);
//            }
//        }
//    }
//}