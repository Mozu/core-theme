using System;
using System.IO;
using System.Threading.Tasks;
using System.Web;

using Autofac;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ObjectPools;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    public static class NDjangoContextExtensions
    {
        public static HyprViewContext ViewContext(this NDjango.Interfaces.IContext context)
        {
            return (HyprViewContext)context.tryfind("_vc").Value;
        }
        public static HttpContextBase HttpContext(this NDjango.Interfaces.IContext context)
        {
            return context.ViewContext().HttpContext;
        }
        public static T GetValueOrDefault<T>(this NDjango.Interfaces.IContext context, string key )
        {
            var entry = context.tryfind("key");
            if (entry != null)
            {
                var value = entry.Value;
                if (value is T)
                {
                    return (T) value;
                }
                return (T)Convert.ChangeType(value, typeof(T));

            }
            return default(T);
        }

        public static object Model(this NDjango.Interfaces.IContext context)
        {
            var ret = context.tryfind("model");
            if (ret != null)
            {
                return ret.Value;
            }
            return null;
        }
        public static ISiteBuilderApiContext SiteBuilderApiContext(this NDjango.Interfaces.IContext context)
        {
            return context.ViewContext().LifetimeScope.Resolve<ISiteBuilderApiContext>();
        }
        
        public static PageContext PageContext(this NDjango.Interfaces.IContext context)
        {
            return context.ViewContext().LifetimeScope.Resolve<PageContext>();
        }
        public static SiteContext SiteContext(this NDjango.Interfaces.IContext context)
        {
            return context.ViewContext().LifetimeScope.Resolve<SiteContext>();
        }
        public static T Resolve<T>(this NDjango.Interfaces.IContext context)
        {
            return context.ViewContext().LifetimeScope.Resolve<T>();
        }
        public static T ResolveOptional<T>(this NDjango.Interfaces.IContext context)
           where T : class
        {
            return context.ViewContext().LifetimeScope.ResolveOptional<T>();
        }
        public static string Render(this NDjango.Interfaces.IContext context, string viewName, object model)
        {
            using (var sbContainer = StringBuilderPool.Default.GetContainer())
            {
                var writer = new StringWriter(sbContainer.Item);
                context.Render(viewName, model, writer);
                return writer.GetStringBuilder().ToString();
            }
           
        }

        public static Task AsyncRender(this NDjango.Interfaces.IContext context, string viewName, object model, TextWriter writer)
        {

            var viewContext = context.ViewContext();

            var viewEngine = viewContext.LifetimeScope.Resolve<HyprViewEngine>();


            var view = viewEngine.FindModuleView(viewName);
            var viewData = new ViewDataDictionary()
            {
                Model = model
            };
            var hvc = new HyprViewContext(viewContext.RequestMessage, viewData, viewContext);
            if (view == null)
            {
                writer.Write("view not found: (" + viewName + ")");
            }

            return view.AsyncRender(hvc, writer);



        }
        public static void Render(this NDjango.Interfaces.IContext context, string viewName, object model, TextWriter writer )
        {
          
            var viewContext = context.ViewContext();

            var viewEngine = viewContext.LifetimeScope.Resolve<HyprViewEngine>();


            var view = viewEngine.FindModuleView(viewName);
            var viewData = new ViewDataDictionary()
            {
                Model = model
            };
            var hvc = new HyprViewContext(viewContext.RequestMessage , viewData, viewContext);
            if (view == null)
            {
                writer.Write("view not found: (" + viewName + ")");
            }
            view.Render(hvc, writer);

           
        }
    }
}
