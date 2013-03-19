using System.Linq;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.ModelBinding;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.Runtime.Serialization.Json;
using System.IO;

namespace Mozu.SiteBuilder.UX.Admin.Api.OpeationHandlers
{
    public class FilterCollectionRequestHandler : IModelBinder
    {
        private readonly DataContractJsonSerializer _ser;

        public FilterCollectionRequestHandler()
        {
            _ser = new DataContractJsonSerializer(typeof(FilterCollection));
        }

        public bool AllowMultiple { get; private set; }

        public bool BindModel(HttpActionContext actionContext, ModelBindingContext bindingContext)
        {
            var input = actionContext.Request;
            var qs = HttpUtility.ParseQueryString(input.RequestUri.Query);
            string filterString = qs["filter"];
            FilterCollection col = null;
            if (!string.IsNullOrEmpty(filterString))
            {
                MemoryStream ms = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(filterString));


                ms.Position = 0;
                try
                {
                    col = (FilterCollection)_ser.ReadObject(ms);
                }
                catch
                {
                    ms = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(System.Web.HttpUtility.UrlDecode(filterString)));
                    ms.Position = 0;
                    col = (FilterCollection)_ser.ReadObject(ms);
                }
                int cnt = 0;
                while (cnt < col.Count)
                {
                    if (string.IsNullOrEmpty(col[cnt].property) && string.IsNullOrEmpty(col[cnt].field))
                    {
                        col.RemoveAt(cnt);
                    }
                    else
                    {
                        cnt++;
                    }
                }
                foreach (var item in col.Where(i => !string.IsNullOrWhiteSpace(i.field)))
                {
                    if (item.field.StartsWith("-"))
                    {
                        item.field = item.field.Substring(1);
                        item.comparison = "ne";
                    }
                }

            }
            else
            {
                col = new FilterCollection();
            }
            col.query = qs["query"];

            bindingContext.Model = col;

            return true;
        }
    }
}