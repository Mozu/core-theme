// -----------------------------------------------------------------------
// <copyright file="DjangoViewEngine.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Web.Hosting;
using Autofac;
using Autofac.Integration.Mvc;
using Mozu.SiteBuilder.Mvc.Themes;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Web.Mvc;
    using NDjango.Interfaces;
    using NDjango;
    using System.IO;
    using System.Reflection;
    using System.Web;
    using System.Web.Routing;


    class TemplateLoader: NDjango.Interfaces.ITemplateLoader
    {
        public MozuVirtualPathProvider PathProvider
        {
            get
            {
                return AutofacDependencyResolver.Current.RequestLifetimeScope.Resolve<MozuVirtualPathProvider>();
            
            }
        }



        public System.IO.TextReader GetTemplate(string path)
        {
            
            if (!Path.IsPathRooted(path))
            {
                var vpath = path;
                if (path.IndexOf("\\", StringComparison.OrdinalIgnoreCase) == -1)
                {
                    vpath = "layouts\\" + path;
                }
                if (Path.GetExtension(vpath) == "")
                {
                    vpath += ".vol";
                }

                var vFile=  this.PathProvider.GetFile(vpath);
                if (vFile == null)
                {
                    throw new InvalidOperationException(string.Format("invalid virtual path [{0}]", vpath));
                }
                return  new StreamReader( vFile.Open());
            }
            return new StreamReader(path);
        }

        public bool IsUpdated(string path, DateTime timestamp)
        {
            if (!Path.IsPathRooted(path))
            {
                if (path.IndexOf("\\", StringComparison.OrdinalIgnoreCase) == -1)
                {
                    path = "layouts\\" + path;
                }
                if (Path.GetExtension(path) == "")
                {
                    path += ".vol";
                }
                var file = (MozuVirtualFile)this.PathProvider.GetFile(path);
                return file.GetLastWriteTime() > timestamp;

             
            }
            
            return System.IO.File.GetLastWriteTime(path) > timestamp;
        }
    }


    public class DjangoMozuViewEngine : VirtualPathProviderViewEngine
    {
        

        private ITemplateManager _templateManager;
        private MozuVirtualPathProvider _mozuVirtualPathProvider;
        public DjangoMozuViewEngine( ITemplateManager templateManager , MozuVirtualPathProvider  mozuVirtualPathProvider )
           
    {
            
            _templateManager = templateManager;

            _mozuVirtualPathProvider = mozuVirtualPathProvider;
            this.VirtualPathProvider = mozuVirtualPathProvider;
          
        }

        
 



        public MozuVirtualPathProvider PathProvider
        {
            get { return (MozuVirtualPathProvider)this.VirtualPathProvider; }
        }

        internal static class AreaHelpers
        {
            // Methods
            public static string GetAreaName(RouteBase route)
            {
                IRouteWithArea area = route as IRouteWithArea;
                if (area != null)
                {
                    return area.Area;
                }
                Route route2 = route as Route;
                if ((route2 != null) && (route2.DataTokens != null))
                {
                    return (route2.DataTokens["area"] ?? route2.Defaults["area"]) as string;
                }
                return null;
            }

            public static string GetAreaName(RouteData routeData)
            {
                object obj2;
                if (routeData.DataTokens.TryGetValue("area", out obj2))
                {
                    return (obj2 as string);
                }
                return GetAreaName(routeData.Route);
            }
        }


        static string[] g_formats = new string[] { "modules\\{0}.vol", "{0}.vol" };

        static string[] g_layout_formats = new string[] { "layouts\\{0}.vol" };
        static string[] g_template_formats = new string[] { "templates\\{0}.vol" };
        static string[] g_widget_formats = new string[] { "widgets\\{0}.vol" };


        public override ViewEngineResult FindPartialView(ControllerContext controllerContext, string partialViewName, bool useCache)
        {
            partialViewName = partialViewName == null ? null : partialViewName.ToLowerInvariant().Replace("/", "\\");
            string area = controllerContext == null ? null : AreaHelpers.GetAreaName(controllerContext.RouteData);
            string controller = controllerContext == null ? null : controllerContext.RouteData.GetRequiredString("controller");

            var formats = string.Equals("widgets", controller, StringComparison.OrdinalIgnoreCase) ? g_widget_formats : g_formats;


            return FindViewInternal(controllerContext, partialViewName, null, useCache, area, formats);
        }



        IEnumerable<string> GetViewVariants(string view, Theme theme)
        {
            yield return view;

            
            if ( theme.EnableCoreVaraints.GetValueOrDefault(false ) )
            {
                var pos = view.LastIndexOf('\\');
                if (pos > -1 && pos + 1 < view.Length)
                {
                    yield return view.Substring(0, pos + 1) + "_" + view.Substring(pos + 1);
                }
                else
                {
                    yield return "_" + view;
                }
            }


        }

        
        public override ViewEngineResult FindView(ControllerContext controllerContext, string viewName, string masterName, bool useCache)
        {
            string area = controllerContext == null ? null : AreaHelpers.GetAreaName(controllerContext.RouteData);
            var formats = g_template_formats;
            return FindViewInternal(controllerContext, viewName, null, useCache, area, formats);
        }

        public ViewEngineResult FindViewInternal(ControllerContext controllerContext, string viewName, string masterName, bool useCache, string area, string[] formats)
        {
            var sbc = SiteBuilderContext.GetFromContext(controllerContext.HttpContext);
            string controller = controllerContext == null ? null : controllerContext.RouteData.GetRequiredString("controller");
            var themeStack = sbc.Theme.Stack;
            string key = null;
            if (useCache)
            {

                key = controller + ";" + viewName + ";" + area + ";" + sbc.Theme.Id;

                string val = (string)System.Runtime.Caching.MemoryCache.Default[key];
                if (!string.IsNullOrEmpty(val))
                {
                    return new ViewEngineResult(this.CreateView(controllerContext, val, null), this);
                }
            }


            var searchedLocations = new List<string>();


            foreach (var format in formats)
            {
                string vpath = string.Format(format, viewName, controller, area);
                searchedLocations.Add(vpath);
                if (this.FileExists(controllerContext, vpath))
                {
                    if (useCache)
                    {

                        System.Runtime.Caching.MemoryCache.Default.Set(key, vpath, DateTimeOffset.Now.AddSeconds(10));
                    }
                    return new ViewEngineResult(this.CreateView(controllerContext, vpath, null), this);
                }
            }
            if (useCache)
            {
                System.Runtime.Caching.MemoryCache.Default.Set(key, string.Empty, DateTimeOffset.Now.AddSeconds(10));

            }



            return new ViewEngineResult(searchedLocations);
        }


        string GetLayoutPath(ControllerContext ctx , string relPath )
        {
            var res = (MozuVirtualFileSystemFile)this.GetPathProviderFromContext(ctx).GetFile(relPath);
          //  var res =(MozuVirtualFileSystemFile ) this.VirtualPathProvider.GetFile(relPath);
            if (res != null && res.Exists)
            {
                return res.MappedPath;
            }
            return null;
          
        }


        
        public ITemplateManager TemplateManger
        {
            get { return _templateManager; }
            set { _templateManager = value; }
        }

        protected override IView CreatePartialView(ControllerContext controllerContext, string partialPath)
        {
            return CreateView(controllerContext, partialPath, null);
        }

        protected override bool FileExists(ControllerContext controllerContext, string virtualPath)
        {
            
            return GetPathProviderFromContext(controllerContext).FileExists(virtualPath);
            return this.VirtualPathProvider.FileExists(virtualPath);
        }
        MozuVirtualPathProvider GetPathProviderFromContext(ControllerContext controllerContext)
        {
            return SiteBuilderContext.GetFromContext(controllerContext.HttpContext).Resolve<MozuVirtualPathProvider>();
        }
        protected override IView CreateView(ControllerContext controllerContext, string viewPath, string masterPath)
        {
            var fp = GetLayoutPath(controllerContext,viewPath);
            return new DjangoMozuView(TemplateManger, viewPath, fp);
        }




        private string MapPath(string virtual_path)
        {

            return HttpContext.Current.Server.MapPath(virtual_path);

        }




    }



}
