using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Text;
using Mozu.SiteBuilder.Mvc.Tags;


namespace Mozu.SiteBuilder.Mvc.Filters
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;

    [NDjango.Interfaces.Name("image_url")]
    public class ImageUrlFilter : NDjango.Interfaces.IFilterWithContext
    {


        string Fixup(string imageString, string cdnPrefix)
        {
            if (!string.IsNullOrEmpty(imageString))
            {

                if (imageString.IndexOf("http", StringComparison.OrdinalIgnoreCase) == 0)
                {
                    return imageString;
                }

                if (imageString[0] == '/')
                {
                    return cdnPrefix + imageString;
                }


                return cdnPrefix + "/cms/files/" + imageString;

            }
            return null;
        }

        object NDjango.Interfaces.IFilterWithContext.PerformWithParamAndContext(object value, IEnumerable<object> parameter, NDjango.Interfaces.IContext context)
        {
            if (value == null)
            {
                return null;
            }
            var cdn = context.SiteContext().CdnPrefix;
            if (value is string)
            {
                return Fixup((string) value, cdn);
            }
            var productImage = value as Mozu.ProductRuntime.Contracts.ProductImage;
            if (productImage != null)
            {
                if (!string.IsNullOrEmpty(productImage.ImageUrl))
                {

                    return Fixup((string)productImage.ImageUrl, cdn);

                }
                return Fixup((string)productImage.CmsId , cdn);
            }
            var categoryImage = value as Mozu.ProductRuntime.Contracts.CategoryImage;
            if (categoryImage != null)
            {
                if (!string.IsNullOrEmpty(categoryImage.ImageUrl))
                {

                    return Fixup((string)categoryImage.ImageUrl, cdn);

                }
                return Fixup((string)categoryImage.CmsId, cdn);
            }
            return value;
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


    [NDjango.Interfaces.Name("url_append")]
    public class UrlParam : NDjango.Interfaces.IFilterWithContext
    {

        public object PerformWithParamAndContext(object value, IEnumerable<object> parameter, NDjango.Interfaces.IContext context)
        {
            var url = (value ?? "").ToString();
            var extra = parameter.FirstOrDefault();
             if (parameter.Count() == 2)
             {
                 return extra = extra + "=" + parameter.Skip(1).First();
             }
            if (url.Contains("?"))
            {
                return url + "&" + extra;
            }
            return url + "?" + extra;
        }

        public object DefaultValue
        {
            get { return string.Empty; }
        }

        public object PerformWithParam(object value, object parameter)
        {
            throw new NotImplementedException();
        }

        public object Perform(object value)
        {
            throw new NotImplementedException();
        }
    }
}