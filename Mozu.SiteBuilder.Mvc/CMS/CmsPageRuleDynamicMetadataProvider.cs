using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.Core.Expressions;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    //todo: Implement support for customer attributes
    public class CmsPageRuleDynamicMetadataProvider : IDynamicContextPropertyMetadataProvider<CmsPageRuleContext>
    {
        /// <inheritdoc />
        public async Task<object> GetDynamicPropertyValue(string propertyPath, ExpressionContextPropertyInfo info, object o)
        {
            return await Task.FromResult((object)null);
        }

        /// <inheritdoc />
        public async Task<ExpressionContextPropertyInfo> GetPropertyInfo(string propertyPath, ExpressionContextPropertyAttribute infoContextAttribute)
        {
            return await Task.FromResult((ExpressionContextPropertyInfo) null);
        }

        /// <inheritdoc />
        public async Task<List<ExpressionContextPropertyDescriptor>> GetPropertyDescriptors()
        {
            return await Task.FromResult(new List<ExpressionContextPropertyDescriptor>());
        }
    }
}
