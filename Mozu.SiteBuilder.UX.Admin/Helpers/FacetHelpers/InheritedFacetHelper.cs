using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper.Internal;
using Mozu.Core.Extensions;
using Mozu.ShippingRuntime.Contracts;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.FacetHelpers
{
    public class InheritedFacetHelper : IInheritedFacetHelper
    {
        /// <summary>
        /// New = inherited && doesn't match server inherited, for isHidden or rangeQuery mismatch
        /// </summary>
        /// <returns>any facets to add with current category id</returns>
        public List<DC.Facet> GetOverridenFacetsToAdd(List<DC.Facet> inheritedClient, List<DC.Facet> inheritedServer, int currentCategoryId)
        {
            return (from cli in inheritedClient
                join srv in inheritedServer on cli.FacetId equals srv.FacetId
                where cli.IsHidden  || ("RangeQuery".EqualsIgnoreCase(cli.FacetType) && !doRangeQueriesMatch(cli.RangeQueries, srv.RangeQueries))
                select new DC.Facet
                {
                    CategoryId = currentCategoryId,
                    FacetId = cli.FacetId,
                    IsHidden = cli.IsHidden,
                    FacetType = cli.FacetType,
                    Order = cli.Order,
                    RangeQueries = cli.RangeQueries,
                    Source = cli.Source,
                    Validity = cli.Validity,
                    ValueSortType = cli.ValueSortType
                }).ToList();
        }

        /// <summary>
        /// update = override && doesn't match server override && doesn't match inherited
        /// </summary>
        /// <returns></returns>
        public List<DC.Facet> GetOverridenFacetsToUpdate(List<DC.Facet> overrideClient, List<DC.Facet> overrideServer, List<DC.Facet> inheritedServer)
        {
            return (from cli in overrideClient
                    join overSrv in overrideServer on cli.FacetId equals overSrv.FacetId
                    join inheritSrv in inheritedServer on cli.OverrideFacetId equals inheritSrv.FacetId
                    where cli.IsHidden != overSrv.IsHidden || 
                            ("RangeQuery".EqualsIgnoreCase(cli.FacetType) && !doRangeQueriesMatch(cli.RangeQueries, overSrv.RangeQueries))
                        && (cli.IsHidden != inheritSrv.IsHidden 
                            || ("RangeQuery".EqualsIgnoreCase(cli.FacetType) && !doRangeQueriesMatch(cli.RangeQueries, overSrv.RangeQueries)) )
                    select cli).ToList();
        }

        /// <summary>
        /// delete = override && matches inherited
        /// </summary>
        /// <returns></returns>
        public List<DC.Facet> GetOverridenFacetsToDelete(List<DC.Facet> overrideClient, List<DC.Facet> inheritedServer)
        {
            throw new NotImplementedException();
        }
        
        private bool doRangeQueriesMatch(List<DC.FacetRangeQuery> cli, List<DC.FacetRangeQuery> server)
        {
            if (cli.IsNullOrEmpty() && server.IsNullOrEmpty())
            {
                return true;
            }

            if (cli.Count != server.Count)
            {
                return false;
            }
            return !server.Where((srv, i) => cli[i].RangeValueStart.ToNullSafeString() != srv.RangeValueStart.ToNullSafeString() 
                            || cli[i].RangeValueEnd.ToNullSafeString() != srv.RangeValueEnd.ToNullSafeString()).Any();
        }
    }
}