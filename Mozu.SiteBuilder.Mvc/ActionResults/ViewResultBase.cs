using System;
using System.Net.Http;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public interface IHyprViewResult
    {
    }

    public class ViewResultBase : Microsoft.AspNetCore.Mvc.ViewResult/*, Mozu.Core.Actions.Contracts.Http.IViewResult server side JS*/
    {
        [JsonIgnore]
        public HyprView View { get; set; }
        // Server-side JS
        //[JsonIgnore]
        //System.Collections.Generic.IDictionary<string, object> Core.Actions.Contracts.Http.IViewResult.ViewData
        //{
        //    get { return this.ViewData; }
        //}


    }
}