using System;
using System.IO;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.FSharp.Core;
using Mozu.Core.Configuration;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.Mvc.Extensions;
using Microsoft.Extensions.DependencyInjection;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    public static class NDjangoContextExtensions
    {
        public static HyprViewContext ViewContext(this NDjango.Interfaces.IContext context)
        {
            var objMaybe = context.tryfind("_vc");
            if (FSharpOption<object>.get_IsSome(objMaybe)) return (HyprViewContext) objMaybe.Value;
            return default(HyprViewContext);
        }

        public static HttpContext HttpContext(this NDjango.Interfaces.IContext context)
        {
            return context.ViewContext().HttpContext;
        }

        public static T GetValueOrDefault<T>(this NDjango.Interfaces.IContext context, string key )
        {
            var entry = context.tryfind("key");
            if (entry == null) return default(T);

            var value = entry.Value;
            if (value is T)
            {
                return (T) value;
            }
            return (T)Convert.ChangeType(value, typeof(T));
        }

        public static object Model(this NDjango.Interfaces.IContext context)
        {
            var ret = context.tryfind("model");
            return ret != null ? ret.Value : null;
        }
        public static ISiteBuilderApiContext SiteBuilderApiContext(this NDjango.Interfaces.IContext context)
        {
            return context.ViewContext().LifetimeScope.Resolve<ISiteBuilderApiContext>();
        }
        
        public static IPageContext PageContext(this NDjango.Interfaces.IContext context)
        {
            return context.ViewContext().LifetimeScope.Resolve<IPageContext>();
        }
        public static ISiteContext SiteContext(this NDjango.Interfaces.IContext context)
        {
            return context.ViewContext().LifetimeScope.Resolve<ISiteContext>();
        }
        public static T Resolve<T>(this NDjango.Interfaces.IContext context)
        {
            return context.ViewContext().LifetimeScope.Resolve<T>();
        }
        public static T ResolveOptional<T>(this NDjango.Interfaces.IContext context)
           where T : class
        {
            return context.ViewContext().LifetimeScope.GetService<T>();
        }

        public static Task AsyncRender<TModel>(this NDjango.Interfaces.IContext context, string viewName, TModel model, TextWriter writer)
        {
            var viewContext = context.ViewContext();
            var viewEngine = viewContext.LifetimeScope.Resolve<HyprViewEngine>();
            var view = viewEngine.FindModuleView(viewName);
            var viewData = new ViewDataDictionary<TModel>(new EmptyModelMetadataProvider(), new ModelStateDictionary())
            {
                Model = model
            };

            var hvc = new HyprViewContext(viewContext.HttpContext, viewData, viewContext);
            if (view == null)
            {

                writer.Write("view not found: (" + viewName + ")");
                return  Task.Run(()=>true);
            }

            return   view.AsyncRender(hvc, writer);
        }
    }
}
