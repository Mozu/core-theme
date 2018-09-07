using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
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
                    IsPinned = prod.IsPinned,
                    Position = prod.Position.GetValueOrDefault(0)
                });

            var buriedProducts = productSortDefinition
                .Products
                .Where(z => z.IsBuried == true)
                .Select(prod => new PR.ProductSortOverride
                {
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
        /// <returns></returns>
        public static List<SB.ProductSortDefinitionPreviewProduct> MapRuntimeToFrontEnd(
            List<PR.Product> runtimeResults,
            SB.ProductSortDefinition inputFromUi)
        {

            var outputList = new List<SB.ProductSortDefinitionPreviewProduct>();
            try
            {
                foreach (var runtimeProduct in runtimeResults)
                {
                    var matchOriginalInput = inputFromUi.Products
                        .FirstOrDefault(product => product.ProductCode.Equals(runtimeProduct.ProductCode,
                        StringComparison.InvariantCultureIgnoreCase));

                    var newItem = Mapper.Map<PR.Product, SB.ProductSortDefinitionPreviewProduct>(runtimeProduct);

                    if (matchOriginalInput != null)
                    {
                        newItem.Position = matchOriginalInput.Position;
                        newItem.IsRanked = matchOriginalInput.IsRanked;
                        newItem.IsPinned = matchOriginalInput.IsPinned;
                        newItem.IsBuried = matchOriginalInput.IsBuried;
                    }
                    outputList.Add(newItem);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            //return outputList.OrderBy(z => z.Position).ToList();
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

            var duplicateCodes = sortDefinition.Products
                .GroupBy(p => p.ProductCode.ToLower())
                .Where(g => g.Count() > 1)
                .Select(code => code.Key);

            if (duplicateCodes.Any())
            {
                throw new Exception("Each product must have a unique product-code.");
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

    }
}