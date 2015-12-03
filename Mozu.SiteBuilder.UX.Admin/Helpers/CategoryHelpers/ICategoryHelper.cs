using System.Collections.Generic;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Category;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.CategoryHelpers {
    public interface ICategoryHelper {
        string GetInFilterStringForIds(IList<Category> categories);
        void AdjustSequence(List<Category> sourceSequenceList, List<Mozu.ProductAdmin.Contracts.Category> targetList);
    }
}