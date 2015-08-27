using System;
using System.Net.Http;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public interface IHyprViewResult
    {
    }

    public class ViewResultBase : ActionResult, Mozu.Core.Actions.Contracts.Http.IViewResult
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

        public HyprView View { get; set; }


        public object Model
        {
            get
            {
                return this.ViewData.Model;
            }
            set { this.ViewData.Model = value; }
        }

        System.Collections.Generic.IDictionary<string, object> Core.Actions.Contracts.Http.IViewResult.ViewData
        {
            get { return this.ViewData; }
        }


    }
}