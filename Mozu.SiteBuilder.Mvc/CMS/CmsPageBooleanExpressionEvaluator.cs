using Mozu.Core.Expressions;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public class CmsPageBooleanExpressionEvaluator : AbstractBooleanExpressionEvaluator<CmsPageContext>
    {
        /// <inheritdoc />
        public CmsPageBooleanExpressionEvaluator(IBinaryExpressionContextMetadataProvider<CmsPageContext> binaryExpressionContextMetadataProvider) : 
            base(binaryExpressionContextMetadataProvider)
        {
        }
    }
}
