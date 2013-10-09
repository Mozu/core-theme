using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;


namespace Mozu.SiteBuilder.Mvc.Filters
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;

    [NDjango.Interfaces.Name("image_url")]
    public class ImageUrlFilter : NDjango.Interfaces.IFilterWithContext
    {



        

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


        object NDjango.Interfaces.IFilterWithContext.PerformWithParamAndContext(object value, IEnumerable<object> parameter, NDjango.Interfaces.IContext context)
        {
           
            var ctx = context.tryfind("SiteContext").Value as ISiteBuilderContext;

            return CreateUrl(ctx, value, parameter);
       
        }

        object NDjango.Interfaces.IFilter.DefaultValue
        {
            get { throw new NotImplementedException(); }
        }

        object NDjango.Interfaces.IFilter.PerformWithParam(object value, object parameter)
        {
            throw new NotImplementedException();
        }

        object NDjango.Interfaces.ISimpleFilter.Perform(object value)
        {
            throw new NotImplementedException();
        }
    }
}