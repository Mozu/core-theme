using System;
using System.Net.Http;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public interface IHyprViewResult
    {
    }

    public class ViewResultBase : Microsoft.AspNetCore.Mvc.ActionResult/*, Mozu.Core.Actions.Contracts.Http.IViewResult server side JS*/
    {
        private ViewDataDictionary _viewDataDictionary;
        [JsonIgnore]
        public ViewDataDictionary ViewData
        {
            get => _viewDataDictionary ??= new ViewDataDictionary();
            set => _viewDataDictionary = value;
        }

        public string ViewName { get; set; }
        [JsonIgnore]
        public HyprView View { get; set; }

        [JsonIgnore]
        public object Model
        {
            get => this.ViewData.Model;
            set => this.ViewData.Model = value;
        }
        // Server-side JS
        //[JsonIgnore]
        //System.Collections.Generic.IDictionary<string, object> Core.Actions.Contracts.Http.IViewResult.ViewData
        //{
        //    get { return this.ViewData; }
        //}


    }
}