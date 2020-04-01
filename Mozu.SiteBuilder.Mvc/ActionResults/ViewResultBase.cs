using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Newtonsoft.Json;
using Microsoft.Extensions.DependencyInjection;
using System.IO;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public interface IHyprViewResult
    {
    }

    public class ViewResultBase : ObjectResult/*, Mozu.Core.Actions.Contracts.Http.IViewResult*/
    {
        public ViewResultBase():base(null)
        {
            this.Value = this;
        }
        private ViewDataDictionary _viewDataDictionary;
        [JsonIgnore]
        public ViewDataDictionary ViewData
        {
            get => _viewDataDictionary ??= new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary());
            set => _viewDataDictionary = value;
        }
        public string ViewName { get; set; }
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