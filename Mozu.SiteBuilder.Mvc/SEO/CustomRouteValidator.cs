using System.Collections.Generic;
using FluentValidation;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using Mozu.MZDB.Contracts.Clients;
using FluentValidation.Results;
using System.Threading.Tasks;
using System;
using System.Reflection;
using System.Linq;
using Mozu.Core.Extensions;
using Mozu.Core.Api.Client;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.Core;

namespace Mozu.SiteBuilder.Mvc.SEO
{
    public class CustomRouteValidator : AbstractValidator<CustomRouteSettings>
    {
        public CustomRouteValidator(IEntityListsWebApiClient entityListClient, IAttributeWebApiClient attributeClient)
        {
            RuleFor(x => x).NotNull().WithName("custom routes").WithMessage("custom routes cannot be null");
            RuleFor(x => x.Mappings).SetCollectionValidator(new MappingValidator(entityListClient)).When(x => x.Mappings != null && x.Mappings.Count > 0).WithName("mappings").WithMessage("Mappings must all be valid");
            RuleFor(x => x.Validators).SetCollectionValidator(new ConstraintValidator(entityListClient, attributeClient)).When(x => x.Validators != null && x.Validators.Count > 0).WithName("validators").WithMessage("Validators must all be valid");
            RuleFor(x => x.Routes).SetCollectionValidator(x => new RouteValidator(x.Mappings.Keys, x.Validators.Keys)).When(x => x.Routes != null && x.Routes.Count > 0).WithName("routes").WithMessage("Routes must all be valid");
        }
    }

    public class MappingValidator : AbstractValidator<KeyValuePair<string, Mapping>>
    {
        readonly IEntityListsWebApiClient _entityListClient;
        public MappingValidator(IEntityListsWebApiClient client)
        {
            _entityListClient = client;
            RuleFor(x => x.Value.type).Must(BeInTypeConst).WithName("mapping type").WithMessage(string.Format("mapping type must be one of {0}", string.Join(",", types)));
            RuleFor(x => x.Value).Must(HaveFacetMapFields).When(x => x.Value.type == Mapping.TypeConst.facet).WithName("facet mapping").WithMessage("facet mapping must provide  mapTo, and facetId");
            RuleFor(x => x.Value).Must(HaveMZDBMapFields).When(x => x.Value.type == Mapping.TypeConst.mzdb).WithName("mzdb mapping").WithMessage("mzdb mapping must provide listFqn and docId");
            RuleFor(x => x.Value).Must(HaveDirectMapFields).When(x => x.Value.type == Mapping.TypeConst.direct).WithName("direct mapping").WithMessage("direct mapping must provide mappings");
        }

        private bool HaveDirectMapFields(Mapping arg)
        {
            return arg.mappings != null;
        }

        private bool HaveMZDBMapFields(Mapping arg)
        {
            return !arg.listFqn.IsNullOrEmpty() && !arg.docId.IsNullOrEmpty();
        }

        private bool HaveFacetMapFields(Mapping arg)
        {
            return !arg.facetId.IsNullOrEmpty()  && !arg.mapTo.IsNullOrEmpty();
        }

        static string[] types = typeof(Mapping.TypeConst)
            .GetFields(BindingFlags.Static | BindingFlags.Public)
            .Where(fi => fi.FieldType == typeof(string))
            .Select(fi => (string)fi.GetValue(null))
            .ToArray();
        private bool BeInTypeConst(string arg)
        {
            return types.Contains(arg, StringComparer.OrdinalIgnoreCase);
        }

        public override async Task<ValidationResult> ValidateAsync(ValidationContext<KeyValuePair<string, Mapping>> context)
        {
            var instance = context.InstanceToValidate.Value;
            var validDoc = ValidatorExt.OK;
            if (instance.type == Mapping.TypeConst.mzdb)
            {
                validDoc = await IsValidMZDBDoc(_entityListClient, instance.listFqn, instance.docId).ConfigureAwait(false);
            }
            var result = await base.ValidateAsync(context).ConfigureAwait(false);
            return result.Concat(validDoc);
        }

        private async Task<ValidationResult> IsValidMZDBDoc(IEntityListsWebApiClient _entityListClient, string listFqn, string docId)
        {
            var response = await _entityListClient.CloneWithoutUserClaims().GetEntity(listFqn, docId).ConfigureAwait(false);
            if(response.HasException) return new ValidationResult(new List<ValidationFailure> { new ValidationFailure("mapping listFqn and docId", "the listFqn must have a document matching docId") });
            return ValidatorExt.OK;

        }
    }

    public class ConstraintValidator : AbstractValidator<KeyValuePair<string, Validator>>
    {
        readonly IAttributeWebApiClient _attributeClient;
        readonly IEntityListsWebApiClient _entityListClient;

        public ConstraintValidator(IEntityListsWebApiClient entityListClient, IAttributeWebApiClient attributeClient)
        {
            _entityListClient = entityListClient;
            _attributeClient = attributeClient;

            RuleFor(x => x.Value.type).Must(BeInTypeConst).WithName("validator type").WithMessage(string.Format("validator type must be one of {0}", string.Join(",", types)));
            RuleFor(x => x.Value).Must(HaveAttributeConstraintFields).When(x => x.Value.type == Validator.TypeConst.attribute).WithName("attribute validator").WithMessage("attribute validator must provide attributecode");
            RuleFor(x => x.Value).Must(HaveListConstraintFields).When(x => x.Value.type == Validator.TypeConst.list).WithName("list validator").WithMessage("list validator must provide values");
            RuleFor(x => x.Value).Must(HaveMZDBConstraintFields).When(x => x.Value.type == Validator.TypeConst.mzdb).WithName("mzdb constraint").WithMessage("mzdb constraint must provide listFqn and field");
        }

        private bool HaveMZDBConstraintFields(Validator arg)
        {
            return !arg.listFqn.IsNullOrEmpty() && !arg.field.IsNullOrEmpty();
        }

        private bool HaveListConstraintFields(Validator arg)
        {
            return arg.values != null && arg.values.Count > 0;
        }

        private bool HaveAttributeConstraintFields(Validator arg)
        {
            return !arg.attributeCode.IsNullOrEmpty();
        }

        static string[] types = typeof(Validator.TypeConst)
            .GetFields(BindingFlags.Static | BindingFlags.Public)
            .Where(fi => fi.FieldType == typeof(string))
            .Select(fi => (string)fi.GetValue(null))
            
            .ToArray();
        private bool BeInTypeConst(string arg)
        {
            return types.Contains(arg, StringComparer.OrdinalIgnoreCase);
        }

        public override async Task<ValidationResult> ValidateAsync(ValidationContext<KeyValuePair<string, Validator>> context)
        {
            var instance = context.InstanceToValidate.Value;
            var extraTypeValidations = await DoDataValidations(instance, _entityListClient, _attributeClient).ConfigureAwait(false);
            return (await base.ValidateAsync(context)).Concat(extraTypeValidations);
        }

        private async Task<ValidationResult> DoDataValidations(Validator instance, IEntityListsWebApiClient _entityListClient, IAttributeWebApiClient _attributeClient)
        {
            switch (instance.type)
            {
                case Validator.TypeConst.attribute:
                    var attrResponse = await _attributeClient.CloneWithoutUserClaims().GetAttribute(instance.attributeCode).ConfigureAwait(false);
                    if (attrResponse.HasException) return new ValidationResult(new List<ValidationFailure> { new ValidationFailure("attributeCode", "attribute code must exist") });
                    return ValidatorExt.OK;
                case Validator.TypeConst.mzdb:
                    var mzdbResponse = await _entityListClient.CloneWithoutUserClaims().GetEntityList(instance.listFqn).ConfigureAwait(false);
                    if (mzdbResponse.HasException) return new ValidationResult(new List<ValidationFailure> { new ValidationFailure("listId", "list must exist") });
                    return ValidatorExt.OK;
            }
            return ValidatorExt.OK;
        }
    }

    public class RouteValidator : AbstractValidator<Route>
    {
       // readonly IEnumerable<string> _mappingNames;
    //    readonly IEnumerable<string> _validatorKeys;

        public RouteValidator(IEnumerable<string> mappingNames, IEnumerable<string> validatorKeys)
        {
         //   _mappingNames = mappingNames;
          //  _validatorKeys = validatorKeys;
            RuleFor(x => x.InternalRoute).Must(ParseAsFancyRoute).WithName("internal route").WithMessage(string.Format("the internal route must be one of {0}", string.Join(",", Enum.GetNames(typeof(FancyRoute)))));
            RuleFor(x => x.Mappings.Keys ).Must( x => x.All(map => mappingNames.Contains(map, StringComparer.OrdinalIgnoreCase))).WithName("mapping name").WithMessage("all mappings must be declared in the mapping section of the custom routes");
            RuleFor(x => x.Validators.Keys).Must(x => x.All(constraint => validatorKeys.Contains(constraint, StringComparer.OrdinalIgnoreCase))).WithName("validator name").WithMessage("all validators must be declared in the validators section of the custom routes.  Error with validators:({0}) in routeTempate:{1}", x =>  String.Join(",", x.Validators.Keys), x=> x.Template );
        }

        private bool ParseAsFancyRoute(string arg)
        {
            try
            {
                arg.ToEnum<FancyRoute>();
                return true;
            }
            catch
            {
                return false;

            }
        }
    }

    public static class ValidatorExt
    {
        public static ValidationResult OK = new ValidationResult();
        public static ValidationResult Concat(this ValidationResult one, ValidationResult two)
        {
            return new ValidationResult(one.Errors.Concat(two.Errors));
        }
    }
}
