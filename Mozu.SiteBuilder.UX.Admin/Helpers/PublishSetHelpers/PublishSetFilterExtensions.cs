using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.PublishSetHelpers
{
    internal static class PublishSetFilterExtensions
    {

        // no name yet in service. 
        private const string NAME = "name";
        private const string CODE = "code";
        private const string STATUS = "status";
        private const string PUBLISH_DATE = "publishdate";
        private const string CREATE_BY = "createby";
        private const string CREATE_DATE = "createdate";
        private const string UPDATE_BY = "updateby";
        private const string UPDATE_DATE = "updatedate";
        private const string LAST_PUBLISHED_DATE = "lastpublisheddate";

        /// <summary>
        /// Converts a FilterCollection for Product to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter)
        {
            if (extFilter == null || extFilter.Count == 0)
                return null;
            return String.Join(" and ", extFilter
                .Where(f => f.value != null && !string.IsNullOrWhiteSpace(f.value.ToString()))
                .Select(GetFilter));
        }

        private static string GetFilter(FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "all":
                    return String.Format("{0} cont \"{1}\"", NAME, filter.escapedValue);
                case "code": 
                case "publishset":
                    return String.Format("{0} eq \"{1}\"", CODE, filter.escapedValue);
                case "status":
                    return String.Format("{0} eq \"{1}\"", STATUS, filter.value);
                case "createdby":
                    return String.Format("{0} eq \"{1}\"", CREATE_BY, filter.value);
                case "createddatefrom":
                    return String.Format("{0} ge \"{1}\"", CREATE_DATE, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "createddateto":
                    return String.Format("{0} le \"{1}\"", CREATE_DATE, ((DateTime)filter.value).AddDays(1).AddTicks(-1).ToUniversalTime().ToString("o"));
                case "updatedby":
                    return String.Format("{0} eq \"{1}\"", UPDATE_BY, filter.value);
                case "updatedatefrom":
                    return String.Format("{0} ge \"{1}\"", UPDATE_DATE, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "updatedateto":
                    return String.Format("{0} le \"{1}\"", UPDATE_DATE, ((DateTime)filter.value).AddDays(1).AddTicks(-1).ToUniversalTime().ToString("o"));
                case "publishdatefrom":
                    return String.Format("{0} ge \"{1}\"", PUBLISH_DATE, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "publishdateto":
                    return String.Format("{0} le \"{1}\"", PUBLISH_DATE, ((DateTime)filter.value).AddDays(1).AddTicks(-1).ToUniversalTime().ToString("o"));
                case "lastpublishdatefrom":
                    return String.Format("{0} ge \"{1}\"", LAST_PUBLISHED_DATE, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "lastpublishdateto":
                    return String.Format("{0} le \"{1}\"", LAST_PUBLISHED_DATE, ((DateTime)filter.value).AddDays(1).AddTicks(-1).ToUniversalTime().ToString("o"));
                default:
                    {
                        throw new NotImplementedException("unable to filter on property " + filter.property);
                    }
            }
        }
    }
}
