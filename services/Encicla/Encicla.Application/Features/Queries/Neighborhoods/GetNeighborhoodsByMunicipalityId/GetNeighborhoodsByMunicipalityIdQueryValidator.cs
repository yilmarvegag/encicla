using FluentValidation;

namespace Encicla.Application.Features.Queries.Neighborhoods.GetNeighborhoodsByMunicipalityId
{
    public class GetNeighborhoodsByMunicipalityIdQueryValidator : AbstractValidator<GetNeighborhoodsByMunicipalityIdQuery>
    {
        public GetNeighborhoodsByMunicipalityIdQueryValidator()
        {
            RuleFor(x => x.MunicipalityId)
            .NotEmpty().WithMessage("municipalityId is required.");
        }
    }
}
