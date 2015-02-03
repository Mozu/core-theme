using Mozu.Core;
using Mozu.Core.Extensions;
using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;

namespace Mozu.SiteBuilder.Mvc
{
    /// <summary>
    /// Handles determining the dataviewmode of a particular request.
    /// 
    /// right now this is determined via the edit mode of the apicontext, a request header, or a site cookie.
    /// </summary>
    public interface IDataViewModeFinderOuter
    {
        DataViewModeType GetDataViewMode();
    }
    public class DataViewModeFinderOuter : IDataViewModeFinderOuter
    {
        private readonly Lazy<DataViewModeType> _lazyDVM;

        public DataViewModeFinderOuter(IEditModeFinderOuter editModeGetter, HttpRequestMessage request, ICookieProvider cookies)
        {
            _lazyDVM = new Lazy<DataViewModeType>(() => GetDataViewMode(editModeGetter, request.Headers, cookies)); 
        }
        private static DataViewModeType GetDataViewMode(IEditModeFinderOuter editModeGetter, HttpRequestHeaders headers, ICookieProvider cookies)
        {
            var isEditMode = editModeGetter.IsEditMode() ? DataViewModeType.Pending : DataViewModeType.NoneSet;
            var headerMode = GetModeFromHeaders(headers);
            var cookieMode = GetModeFromCookie(cookies);

            var modeToReturn = new[] { isEditMode, headerMode, cookieMode }.Aggregate(DataViewModeType.NoneSet, (prev, next) => prev != DataViewModeType.NoneSet ? prev : next);
            return modeToReturn == DataViewModeType.NoneSet ? DataViewModeType.Live : modeToReturn;
        }

        private static DataViewModeType GetModeFromCookie(ICookieProvider cookies)
        {
            var cookie = cookies.GetRequestCookie(Constants.COOKIENAME);
            if (cookie == null || cookie["dataview"].IsNullOrEmpty()) return DataViewModeType.NoneSet;
            return cookie["dataview"].ToEnum<DataViewModeType>();
        }

        private static DataViewModeType GetModeFromHeaders(HttpRequestHeaders headers)
        {
            if (!headers.Contains(Core.Api.Contracts.Constants.Headers.DATA_VIEW_MODE)) return DataViewModeType.NoneSet;
            return headers.GetValues(Core.Api.Contracts.Constants.Headers.DATA_VIEW_MODE).First().ToEnum<DataViewModeType>();
        }

        public DataViewModeType GetDataViewMode()
        {
            return _lazyDVM.Value;
        }
    }
}
