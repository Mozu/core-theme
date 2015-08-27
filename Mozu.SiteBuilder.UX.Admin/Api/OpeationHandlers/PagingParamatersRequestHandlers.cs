using System;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.ModelBinding;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.IO;
using System.Runtime.Serialization.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.OpeationHandlers
{
    public class PagingParamatersRequestHandlers : IModelBinder
    {
        private readonly DataContractJsonSerializer _ser;

        public  PagingParamatersRequestHandlers()
        {
            _ser = new DataContractJsonSerializer(typeof(SortingCollection));
        }

        public bool BindModel(HttpActionContext actionContext, ModelBindingContext bindingContext)
        {
            try
            {
                var pps = BuildPagingParameters(actionContext.Request.RequestUri);

                bindingContext.Model = pps;

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public PagingParamaters BuildPagingParameters(Uri requestUri)
        {
            var qs = HttpUtility.ParseQueryString(requestUri.Query);
            var pps = new PagingParamaters
            {
                id = qs["id"],
                productCode = qs["productCode"],
                pageIndex = 1,
                pageSize = 25,
                startIndex = 0,
                sort = new SortingCollection()
            };

            int tmp;
            if (int.TryParse(qs["page"], out tmp) && tmp > 0)
            {
                pps.pageIndex = tmp;
            }

            if (int.TryParse(qs["start"], out tmp) && tmp > 0)
            {
                pps.startIndex = tmp;
            }

            if (int.TryParse(qs["limit"], out tmp))
            {
                pps.pageSize = tmp;
            }

            var tmps = qs["sort"];
            if (!string.IsNullOrEmpty(tmps))
            {
                var ms = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(tmps)) { Position = 0 };

                pps.sort = (SortingCollection)_ser.ReadObject(ms);
            }

            return pps;
        }
    }
}