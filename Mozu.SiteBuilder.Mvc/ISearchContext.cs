using System;

namespace Mozu.SiteBuilder.Mvc
{
    public interface ISearchContext
    {
        string Query { get; set; }
        int CategoryId { get; set; }
    }
}
