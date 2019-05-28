using Mozu.Core.Expressions;
using Mozu.Core.FilterParsing.Expressions;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public class CmsPageRuleValidator : AbstractBinaryExpressionValidator<CmsPageRuleContext>
    {
        /// <inheritdoc />
        public CmsPageRuleValidator(IBinaryExpressionContextMetadataProvider<CmsPageRuleContext> binaryExpressionContextMetadataProvider) : 
            base(binaryExpressionContextMetadataProvider)
        {
        }
    }
}
