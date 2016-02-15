using System.Collections.Generic;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Category;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.CategoryHelpers {
    public interface ICategoryHelper {
        DC.CategorySequenceCollection GetCategorySequenceCollection(List<Category> categories);
    }
}