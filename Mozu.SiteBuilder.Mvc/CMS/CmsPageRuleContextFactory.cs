using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.Core;
using Mozu.Core.Expressions;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public class CmsPageRuleContextFactory : IExpressionContextFactory<CmsPageRuleContext>
    {
        private readonly IPageContext _pageContext;

        public CmsPageRuleContextFactory(IPageContext pageContext)
        {
            _pageContext = pageContext;
        }

        /// <inheritdoc />
        public async Task<CmsPageRuleContext> GetContext()
        {
            var retVal = new CmsPageRuleContext();
            if (_pageContext == null) return await Task.FromResult(retVal);

            if (_pageContext.DataViewMode == DataViewModeType.Pending)
            {
                retVal.StartDate = _pageContext.Now;
                retVal.EndDate = _pageContext.Now;
            }
            else
            {
                retVal.StartDate = DateTime.UtcNow;
                retVal.EndDate = DateTime.UtcNow;
            }

            retVal.Customer.CustomerSegments = _pageContext.User?.Segments;

            return await Task.FromResult(retVal);
        }
    }
}
