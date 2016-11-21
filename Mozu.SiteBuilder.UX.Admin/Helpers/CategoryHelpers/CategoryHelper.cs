using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Category;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.CategoryHelpers {
    public class CategoryHelper : ICategoryHelper {
        /// <summary>
        /// Gets a category sequence collection based on input list
        /// </summary>
        /// <param name="inputCategories">List with new category sequence</param>
        public DC.CategorySequenceCollection GetCategorySequenceCollection(List<Category> inputCategories)
        {
            var categorySequenceCollection = new DC.CategorySequenceCollection();
            if (!inputCategories.Any())
            {
                return categorySequenceCollection;
            }

            if (inputCategories.Any(c => c.Id == null))
            {
                throw new ArgumentNullException("id");
            }

            categorySequenceCollection.Items = inputCategories.Select(c => new DC.CategorySequence
            {
                CategoryId = c.Id.GetValueOrDefault(),
                ParentCategoryId = (c.ParentId < 0) ? null : c.ParentId,
                PreviousSiblingCategoryId = c.PreviousSiblingCategoryId
            }).ToList();
            return categorySequenceCollection;
        }
    }
}