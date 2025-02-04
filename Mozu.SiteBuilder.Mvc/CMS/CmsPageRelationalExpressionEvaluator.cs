using System;
using System.Linq;
using Mozu.Core.Expressions;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.Core.Extensions;
using Mozu.Core.Logging;
using Microsoft.Extensions.Logging;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public class CmsPageRelationalExpressionEvaluator : RelationalExpressionEvaluator<CmsPageRuleContext>
    {
        private readonly ILogger<CmsPageRelationalExpressionEvaluator> _logger;

        /// <inheritdoc />
        public CmsPageRelationalExpressionEvaluator(IExpressionContextMetadataProvider<CmsPageRuleContext> binaryExpressionContextMetadataProvider, ILogger<CmsPageRelationalExpressionEvaluator> logger) : 
            base(binaryExpressionContextMetadataProvider)
        {
            _logger = logger;
        }

        /// <inheritdoc />

        protected override bool EvaluateExpression(object contextValueOfLeftSide, RelationalExpression expression,
            ExpressionEvaluationResult results)
        {
            var context = contextValueOfLeftSide as CmsPageRuleContext;
            
            switch (expression.Left.ToLowerInvariant())
            {
                //handle special properties with case stmts
                case "customer.customersegments": // this property is an array so we need to fudge intersects
                {
                    switch (expression.Operator)
                    {
                        case AbstractExpression.RelationalOperator.@in:
                        {
                            if (context?.Customer?.CustomerSegments == null)
                            {
                                _logger.Debug($"{expression} is false for null");
                                return false;
                            }

                            var value = context.Customer.CustomerSegments?.ToArray().Join(",");
                            var result = context.Customer.CustomerSegments != null && 
                                         context.Customer.CustomerSegments
                                             .Intersect((string[]) expression.Right, StringComparer.OrdinalIgnoreCase)
                                             .Any();
                            
                            _logger.Debug($"{expression} is {result} for {value}");

                            return result;
                        }
                        case AbstractExpression.RelationalOperator.nin:
                        {
                            if (context?.Customer?.CustomerSegments == null)
                            {
                                _logger.Debug($"{expression} is true for null");
                                return true;
                            }

                            var value = context.Customer.CustomerSegments?.ToArray().Join(",");
                            var result = context.Customer.CustomerSegments != null && 
                                         !context.Customer.CustomerSegments
                                            .Intersect((string[]) expression.Right, StringComparer.OrdinalIgnoreCase)
                                            .Any();
                            
                            _logger.Debug($"{expression} is {result} for {value}");

                            return result;
                        }
                        default:
                            throw new ArgumentOutOfRangeException($"{expression.Operator:G} is not a valid operator for customer segment comparisons.");
                    }
                }

                default:
                    return Evaluate(context, expression, results).GetAwaiter().GetResult();
            }
        }
    }
}
