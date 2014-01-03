using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.UX.Models.Navigation;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Navigation
{
    /// <summary>
    /// Retrieves categories from the Runtime category client and
    /// returns a list of NavigationTreeNodes.
    /// </summary>
    public class CategoryNavigationProvider : ICategoryNavigationProvider
    {
        private ICategoryWebApiClient _catClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public CategoryNavigationProvider(ICategoryWebApiClient catClient)
        {
            _catClient = catClient;
        }

        /// <summary>
        /// Retrieves categories from the Admin category client and
        /// returns a list of NavigationTreeNodes.
        /// </summary>
        public Task<NavigationNodeCollection> GetCategories()
        {
            return _catClient.GetCategories(0,pageSize:2000)
                .ContinueWith(t =>
                {


                  



                    DC.CategoryPagedCollection cats = t.Result.ReadAsSync();
                    var allCats = new List<DC.Category>(cats.Items );
                    var startIndex = cats.Items.Count;
                    var pageSize = startIndex;
                    int page = 1;

                    //tbd: either async all of them or get service team to redo
                    while (startIndex<cats.TotalCount )
                    {
                        var iterRes=_catClient.GetCategories(startIndex = startIndex, pageSize: pageSize).Result.ReadAsSync();
                        startIndex += pageSize;
                        allCats.AddRange(iterRes.Items );
                    }

                    return new NavigationNodeCollection { ETag = t.Result.ETag(), Nodes = Mapper.Map<List<NavigationNode>>(allCats) };
                });
        }
    }
}