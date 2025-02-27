using Mozu.Core.Expressions;
using Mozu.Core.Extensions;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public class CmsPageRuleExpressionValidator : ExpressionValidator<CmsPageRuleContext>
    {

        /// <inheritdoc />
        public CmsPageRuleExpressionValidator( 
            CmsPageRuleRelationalExpressionValidator relationalExpressionValidator,  
            BooleanExpressionValidator logicalExpressionValidator,
            BooleanExpressionListValidator logicalListExpressionValidator,
            IExpressionParser expressionParser
            ) : 
            base(relationalExpressionValidator, logicalExpressionValidator, logicalListExpressionValidator, expressionParser)
        {
        }
    }

    public class CmsPageRuleRelationalExpressionValidator : RelationalExpressionValidator<CmsPageRuleContext>
    {
        private readonly ICustomerSegmentWebApiClient _customerSegmentWebApi;

        /// <inheritdoc />
        public CmsPageRuleRelationalExpressionValidator(IExpressionContextMetadataProvider<CmsPageRuleContext> expressionContextMetadataProvider,
            ICustomerSegmentWebApiClient customerSegmentWebApi)
            : base(
            expressionContextMetadataProvider)
        {
            _customerSegmentWebApi = customerSegmentWebApi;
        }

        /// <inheritdoc />
        protected override void ValidatePropertyType(RelationalExpression expr, Type propertyType, ExpressionValidationResult result)
        {
            base.ValidatePropertyType(expr, propertyType, result);
        }

        /// <inheritdoc />
        protected override async Task ValidateValueConstraints(RelationalExpression expr, ExpressionValidationResult result)
        {
            await base.ValidateValueConstraints(expr, result);

            if (expr.Left.Equals("customer.customersegments"))
            {
                await ValidateCustomerSegment(expr, result);
            }
        }

        private async Task ValidateCustomerSegment(RelationalExpression expr, ExpressionValidationResult result)
        {
            var allSegments = new List<string>();
            int numFound;
            var rightSideValues = expr.Right as string[];

            if (expr.RightIsNull || rightSideValues.IsNullOrEmpty())
            {
                result.Errors.Add(new ExpressionValidationError
                {
                    Expression = expr,
                    Message = "Expression must contain at least one customer segment code."
                });
                return;
            }

            if (rightSideValues.Length > 30)
            {
                result.Errors.Add(new ExpressionValidationError
                {
                    Expression = expr,
                    Message = "Expression may not contain more than 30 customer segment codes."
                });
                return;
            }

            char[] quoteChars = {'"', '\''};
            //if someone has long codes or too many this may fail because its too large for a GET.
            //if the values start with a quote then assume its a quoted value otherwise wrap values in quotes
            //and comma separate them
            var quotedValues = 
                rightSideValues.Select(v=> quoteChars.Contains(v[0]) ? v : $"\"{v}\"").Join(",");
     
            string filter = $"code in[{quotedValues}]";
            do
            {
                var segmentsResult = await _customerSegmentWebApi.GetSegments(pageSize: 200, filter: filter);
                var segments = segmentsResult.ReadAsAsync().Result;
                numFound = segments.Items.Count;
                allSegments.AddRange(segments.Items.Select(s => s.Code));
            } while (numFound >= 200);

            List<string> badCodes;

            badCodes =
                rightSideValues
                    .Where(leftsidevalue =>
                        !allSegments.Contains(leftsidevalue, StringComparer.OrdinalIgnoreCase))
                    .ToList();

            if (badCodes.Count > 0)
            {
                var codestr = badCodes.Join(", ");
                //add a validation error
                result.Errors.Add(new ExpressionValidationError
                {
                    Expression = expr,
                    Message = $"{codestr} {(badCodes.Count <= 1 ? "is not a valid customer segment code." : "are not valid customer segment codes.")}"
                });
            }
        }

        /// <inheritdoc />
        protected override async Task ValidateOperator(RelationalExpression expr, ExpressionValidationResult result)
        {
            await base.ValidateOperator(expr, result);
        }
    }
}
