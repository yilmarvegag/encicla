using Encicla.Application.Abstractions.Messaging;
using Encicla.Domain.DTOs;

namespace Encicla.Application.Features.Queries.Municipalities.GetMunicipalityList
{
    public sealed record class GetMunicipalityListQuery() : IQuery<IReadOnlyList<MunicipalityDto>>;
}
