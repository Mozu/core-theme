using System;
using System.Net.Http;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public interface IHyprViewResult
    {
    }

    public class ViewResultBase : ActionResult 
    {
        private ViewDataDictionary _viewDataDictionary;

        public ViewDataDictionary ViewData
        {
            get
            {
                if (_viewDataDictionary == null)
                {
                    _viewDataDictionary = new ViewDataDictionary();
                }
                return _viewDataDictionary;
            }
            set { _viewDataDictionary = value; }
        }

        public override void ExecuteResult(HttpRequestMessage requestMessage)
        {
            throw new NotImplementedException();
        }

        public string ViewName { get; set; }

        public object Model
        {
            get
            {
                return this.ViewData.Model;
            }
            set { this.ViewData.Model = value; }
        }
    }
}