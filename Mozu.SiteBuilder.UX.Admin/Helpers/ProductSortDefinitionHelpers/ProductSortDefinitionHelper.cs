using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.Mvc.Extensions;
using PR = Mozu.ProductRuntime.Contracts;
using SB = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductSortDefinitions;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.ProductSortDefinitionHelpers
{
    public static class ProductSortDefinitionHelper
    {
        /// <summary>
        ///     Converts the input from the UI to the contract input
        /// </summary>
        /// <param name="productSortDefinition"></param>
        /// <returns></returns>
        public static PR.ProductSortDefinition MapFrontEndToRuntime(SB.ProductSortDefinition productSortDefinition)
        {
            var boostedProducts = productSortDefinition.Products
                .Where(z => z.IsRanked == true)
                .Select(prod => new PR.ProductSortOverride
                {
                    ProductCode = prod.ProductCode,
                    SliceValue = prod.SliceValue,
                    IsPinned = prod.IsPinned,
                    Position = prod.Position.GetValueOrDefault(0)
                });

            var buriedProducts = productSortDefinition
                .Products
                .Where(z => z.IsBuried == true)
                .Select(prod => new PR.ProductSortOverride
                {
                    SliceValue = prod.SliceValue,
                    ProductCode = prod.ProductCode,
                    //other values are irrelevant 
                });

            var sortExpression = productSortDefinition.SortExpressions
                .Select(s => new PR.ProductSortExpression
                {
                    Direction = s.direction,
                    Field = s.property
                }).ToList();

            var runtimeSortDef = new PR.ProductSortDefinition
            {
                Boosted = boostedProducts.ToList(),
                Buried = buriedProducts.ToList(),
                CategoryId = productSortDefinition.CategoryId,
                SortExpressions = sortExpression,
            };

            return runtimeSortDef;
        }

        /// <summary>
        ///     Maps the product-runtime results to front-end format and align positions
        /// </summary>
        /// <param name="runtimeResults"></param>
        /// <param name="inputFromUi"></param>
        /// <param name="sortDef"></param>
        /// <returns></returns>
        public static List<SB.ProductSortDefinitionPreviewProduct> MapRuntimeToFrontEnd(List<PR.Product> runtimeResults,
            SB.ProductSortDefinition inputFromUi,
            PR.ProductSortDefinition sortDef)
        {
            var outputList = new List<SB.ProductSortDefinitionPreviewProduct>();
            foreach (var runtimeProduct in runtimeResults)
            {
                var matchOriginalInput = 
                    inputFromUi.Products
                    .FirstOrDefault(product => 
                        product.UniqueKey.Equals(SB.ProductSortPosition.MakeUniqueKey(runtimeProduct.ProductCode, runtimeProduct.SliceValue),
                            StringComparison.OrdinalIgnoreCase));

                var newItem = Mapper.Map<PR.Product, SB.ProductSortDefinitionPreviewProduct>(runtimeProduct);

                newItem.Price = GetDisplayPrice(sortDef, runtimeProduct);
                newItem.NotAvailableInStorefront = newItem.Name.IsNullOrEmpty(); //we didn't get information from API

                //Re-populate some values from original input
                if (matchOriginalInput != null)
                {
                    newItem.Position = matchOriginalInput.Position;
                    newItem.IsRanked = matchOriginalInput.IsRanked;
                    newItem.IsPinned = matchOriginalInput.IsPinned;
                    newItem.IsBuried = matchOriginalInput.IsBuried;
                }

                outputList.Add(newItem);
            }

            return outputList;
        }

        /// <summary>
        ///     Basic validation for the front-end input
        /// </summary>
        /// <param name="sortDefinition"></param>
        /// <returns></returns>
        public static bool ValidateSortDefinition(SB.ProductSortDefinition sortDefinition)
        {
            const int MAX_PINNED_PRODUCTS = 10;
            const int MAX_RANKED_PRODUCTS = 50;
            const int MAX_BURIED_PRODUCTS = 50;

            if (sortDefinition == null)
            {
                throw new Exception("Invalid product-sort-definition.");
            }

            if (sortDefinition.CategoryId.GetValueOrDefault(0) == 0)
            {
                throw new Exception("Invalid category-id.");
            }

            var duplicatePositions = sortDefinition.Products
                .Where(b => b.IsBuried == false)
                .GroupBy(p => p.Position)
                .Where(g => g.Count() > 1)
                .Select(code => code.Key);

            if (duplicatePositions.Any())
            {
                throw new Exception("Each ranked/pinned product must have a unique position.");
            }

            var dups = sortDefinition.Products
                .GroupBy(p => p.UniqueKey)
                .Where(g => g.Count() > 1)
                .Select(code => code.Key).ToList();
            if (dups.Any())
            {
                throw new Exception($"Each product must have a unique product-code: {string.Join(",",dups)}");
            }

            if (sortDefinition.Products.Any(p => p.IsPinned == true && p.Position > MAX_PINNED_PRODUCTS))
            {
                throw new Exception($"Products can only pinned up to position {MAX_PINNED_PRODUCTS}.");
            }

            if (sortDefinition.Products.Count(p => p.IsRanked == true) > MAX_RANKED_PRODUCTS)
            {
                throw new Exception($"You can only have {MAX_RANKED_PRODUCTS} ranked products.");
            }

            if (sortDefinition.Products.Any(p => p.IsRanked == true && p.Position > MAX_RANKED_PRODUCTS))
            {
                throw new Exception($"You can rank products up to position {MAX_RANKED_PRODUCTS}.");
            }

            if (sortDefinition.Products.Count(p => p.IsBuried == true) > MAX_BURIED_PRODUCTS)
            {
                throw new Exception($"You can only have {MAX_BURIED_PRODUCTS} buried products.");
            }

            return true;
        }

        /// <summary>
        ///     Get's the highest or lowest price from runtime values, based on sort direction
        /// </summary>
        /// <param name="sortDef"></param>
        /// <param name="runtimeProduct"></param>
        /// <returns></returns>
        private static decimal? GetDisplayPrice(PR.ProductSortDefinition sortDef, PR.Product runtimeProduct)
        {
            var priceDirection = sortDef.SortExpressions?
                                     .FirstOrDefault(f => f.Field.ToUpper() == "PRICE")?
                                     .Direction?.ToUpper() ?? "ASC";

            var hasRange = (runtimeProduct.PriceRange != null);

            decimal? priceToShow = 0;
            if (hasRange && priceDirection == "ASC")
            {
                priceToShow = (runtimeProduct.PriceRange?.Lower.SalePrice == null)
                    ? (runtimeProduct.PriceRange?.Lower.Price)
                    : Math.Min(
                        (runtimeProduct.PriceRange?.Lower.Price).GetValueOrDefault(0),
                        (runtimeProduct.PriceRange?.Lower.SalePrice).GetValueOrDefault(0));
            }
            else if (hasRange && priceDirection == "DESC")
            {
                priceToShow = (runtimeProduct.PriceRange?.Upper.SalePrice == null)
                    ? (runtimeProduct.PriceRange?.Upper.Price)
                    : Math.Max(
                        (runtimeProduct.PriceRange?.Upper.Price).GetValueOrDefault(0),
                        (runtimeProduct.PriceRange?.Upper.SalePrice).GetValueOrDefault(0));
            }
            else if (!hasRange && priceDirection == "ASC")
            {
                priceToShow = (runtimeProduct.Price?.SalePrice == null)
                    ? runtimeProduct.Price?.Price
                    : Math.Min(
                        (runtimeProduct.Price?.Price).GetValueOrDefault(0),
                        (runtimeProduct.Price?.SalePrice).GetValueOrDefault(0));
            }
            else if (!hasRange && priceDirection == "DESC")
            {
                priceToShow = (runtimeProduct.Price?.SalePrice == null)
                    ? runtimeProduct.Price?.Price
                    : Math.Max(
                        (runtimeProduct.Price?.Price).GetValueOrDefault(0),
                        (runtimeProduct.Price?.SalePrice).GetValueOrDefault(0));
            }
            return priceToShow;
        }

    }
}