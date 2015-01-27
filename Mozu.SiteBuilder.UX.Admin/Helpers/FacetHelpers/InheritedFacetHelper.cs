using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper.Internal;
using Mozu.Core.Extensions;
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
                where !DoFacetsMatch(cli, srv)
                select new DC.Facet
                {
                    CategoryId = currentCategoryId,
                    IsHidden = cli.IsHidden,
                    FacetType = cli.FacetType,
                    Order = cli.Order,
                    OverrideFacetId = cli.FacetId,
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
                    where !DoFacetsMatch(cli, overSrv) && !DoFacetsMatch(cli, inheritSrv)
                    select cli).ToList();
        }

        
        /// <summary>
        /// delete = override && matches inherited
        /// </summary>
        /// <returns></returns>
        public List<DC.Facet> GetOverridenFacetsToDelete(List<DC.Facet> overrideClient, List<DC.Facet> inheritedServer)
        {
            return (from cli in overrideClient
                    join inheritSrv in inheritedServer on cli.OverrideFacetId equals inheritSrv.FacetId
                    where DoFacetsMatch(cli, inheritSrv)
                    select cli).ToList();
        }

        public List<DC.Facet> FilterInheritedFacetsThatAreOverriden(List<DC.Facet> configuredFacets, int currentCategoryId)
        {
            return configuredFacets.Where(
                x => x.CategoryId == currentCategoryId || configuredFacets.All(y => y.OverrideFacetId != x.FacetId)).ToList();
        }

        private bool DoFacetsMatch(DC.Facet cli, DC.Facet srv)
        {
            return cli.IsHidden == srv.IsHidden &&
                   (!IsRangeQuery(cli.FacetType) || DoRangeQueriesMatch(cli.RangeQueries, srv.RangeQueries));
        }

        private static bool IsRangeQuery(string facetType)
        {
            return "RangeQuery".EqualsIgnoreCase(facetType);
        }

        private bool DoRangeQueriesMatch(List<DC.FacetRangeQuery> cli, List<DC.FacetRangeQuery> server)
        {
            if (cli.IsNullOrEmpty() && server.IsNullOrEmpty())
            {
                return true;
            }

            if (cli.IsNullOrEmpty() && !server.IsNullOrEmpty() || (!cli.IsNullOrEmpty() && server.IsNullOrEmpty()))
            {
                return false;
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