using System;
using System.Linq;
using Mozu.Core.Expressions;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using System.Threading.Tasks;
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
            base(binaryExpressionContextMetadataProvider, logger)
        {
            _logger = logger;
        }

        /// <inheritdoc />
        public override Task<bool> Evaluate(CmsPageRuleContext context, RelationalExpression expression)
        {
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
                                return Task.FromResult(false);
                            }

                            var value = context.Customer.CustomerSegments?.ToArray()?.Join(",");
                            var result = Task.FromResult((context?.Customer?.CustomerSegments )
                                .Intersect((string[]) expression.Right, StringComparer.OrdinalIgnoreCase).Any());
                            
                            _logger.Debug($"{expression} is {result} for {value}");

                            return result;
                        }
                        case AbstractExpression.RelationalOperator.nin:
                        {
                            if (context?.Customer?.CustomerSegments == null)
                            {
                                _logger.Debug($"{expression} is true for null");
                                return Task.FromResult(true);
                            }

                            var value = context.Customer.CustomerSegments?.ToArray()?.Join(",");
                            var result = Task.FromResult(!context.Customer.CustomerSegments
                                .Intersect((string[]) expression.Right, StringComparer.OrdinalIgnoreCase).Any());
                            
                            _logger.Debug($"{expression} is {result} for {value}");

                            return result;
                        }
                        default:
                            throw new ArgumentOutOfRangeException($"{expression.Operator:G} is not a valid operator for customer segment comparisons.");
                    }
                }

                default:
                    return base.Evaluate(context, expression);
            }
        }
    }
}
