using System.Collections.Generic;
using System.Linq;
using MoreLinq;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Category;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.CategoryHelpers {
    internal class CategoryHelper : ICategoryHelper {
        private const string ID = "id";

        /// <summary>
        /// Get a filter string for IN filter based on the id property of a given category list
        /// </summary>
        /// <param name="categories">List containing categories</param>
        /// <returns>Filter string for IN filter</returns>
        public string GetInFilterStringForIds(IList<Category> categories)
        {
            if (categories == null || !categories.Any())
            {
                return "";
            }
            return string.Format("{0} in [{1}]", ID, categories.Select(s => s.Id).ToDelimitedString(","));
        }

        /// <summary>
        /// Updates the sequence property for objects in one list, based on matching sequence values from another list. 
        /// NOTE: Modifies the listToUpdate object
        /// </summary>
        /// <param name="newSequenceList">List with new sequence and lookup</param>
        /// <param name="listToUpdate">List to update with sequence from new list</param>
        public void AdjustSequence(List<Category> newSequenceList, List<DC.Category> listToUpdate)
        {
            foreach (var dbCat in listToUpdate)
            {
                var firstOrDefault = newSequenceList.FirstOrDefault(i => i.Id == dbCat.Id);
                if (firstOrDefault != null)
                {
                    var newSequence = firstOrDefault.Sequence;
                    dbCat.Sequence = newSequence;
                }
            }
        }
    }
}