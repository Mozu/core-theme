using Mozu.Core.Extensions;
using System;
using System.Linq;
using System.Net.Http;
using Microsoft.AspNetCore.Http;

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

        public EditModeFinderOuter(HttpContext context)
        {
            _lazy = new Lazy<bool>(() => IsEditMode(context));
        }

        public static bool IsEditMode(HttpContext context)
        {
            return context.Request.Query.Any(x => x.Key.EqualsIgnoreCase("IsEditMode") && string.Equals(x.Value, "true", StringComparison.OrdinalIgnoreCase));
        }

        public bool IsEditMode()
        {
            return _lazy.Value;
        }
    }
}
