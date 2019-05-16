using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    public interface IProductWithImages
    {
        List<Models.ProductModels.ProductLocalizedImage> ProductImages { get; set; }
    }
}
