using Mozu.Core.Extensions;
using System;
using System.Linq;
using System.Net.Http;

namespace Mozu.SiteBuilder.Mvc
{
    /// <summary>
    /// Handles determining the editmode of a particular request.
    /// 
    /// Right now this is determined entirely by looking in the query string of the request.
    /// </summary>
    public interface IEditModeFinderOuter
    {
        bool IsEditMode();
    }
    public class EditModeFinderOuter : IEditModeFinderOuter
    {
        private readonly Lazy<bool> _lazy;

        public EditModeFinderOuter(HttpRequestMessage request)
        {
            _lazy = new Lazy<bool>(() => IsEditMode(request));
        }

        public static bool IsEditMode(HttpRequestMessage msg)
        {
            return msg.GetQueryNameValuePairs().Any(x => x.Key.EqualsIgnoreCase("IsEditMode") && x.Value.EqualsIgnoreCase("true"));
        }

        public bool IsEditMode()
        {
            return _lazy.Value;
        }
    }
}
