using Encicla.Application.Abstractions.Messaging;
using Encicla.Application.Abstractions.Services;
using Encicla.Domain.DTOs;
using Encicla.Domain.Wrappers;

namespace Encicla.Application.Features.Queries.Municipalities.GetMunicipalityList
{
    internal sealed class GetMunicipalityListQueryHandler(IGeoDataReadService _geo) : IQueryHandler<GetMunicipalityListQuery, IReadOnlyList<MunicipalityDto>>
    {

        public async Task<Result<IReadOnlyList<MunicipalityDto>>> Handle(GetMunicipalityListQuery request, CancellationToken cancellationToken)
        {
            var items = await _geo.GetMunicipalitiesAsync(cancellationToken);
            return Result<IReadOnlyList<MunicipalityDto>>.Success(items, "Municipalities fetched");
        }
    }
}