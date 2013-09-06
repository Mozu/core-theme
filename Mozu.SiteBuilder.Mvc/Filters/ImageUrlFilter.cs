using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web.Mvc;

namespace Mozu.SiteBuilder.Mvc.Filters
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;

    [NDjango.Interfaces.Name("image_url")]
    public class ImageUrlFilter : NDjango.Interfaces.IFilterWithContext
    {



        public object PerformWithParamAndContext(object value, object parameter, NDjango.Interfaces.IContext context)
        {
            var ctx = context.tryfind("SiteContext").Value as ISiteBuilderContext;

            return CreateUrl(ctx, value, parameter);
        }

        public string CreateUrl(ISiteBuilderContext ctx , object value, object parameter= null)
        {
            
            var id = value as string;
            if (id != null)
            {
                dynamic image = value;
                try
                {
                    id = image.Id;
                }
                catch
                {
                }
            }
            var ret = "/files/" + ctx.TenantId + "/" + ctx.SiteGroupId + "/" + ctx.SiteId + "/" + id;
            if (parameter != null)
            {
                ret +="?size=" + parameter;
            }
            return ret;
    
        }

        public object DefaultValue
        {
            get { return null; }
        }

        public object PerformWithParam(object value, object parameter)
        {
            var ctx = DependencyResolver.Current.GetService<ISiteBuilderContext>();
            

            return CreateUrl(ctx, value, parameter);
        }



        public object Perform(object value)
        {
            var ctx = DependencyResolver.Current.GetService<ISiteBuilderContext>();
            


            return CreateUrl(ctx, value);
        }
    }
}