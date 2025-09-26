using Encicla.Application.Abstractions.Messaging;

namespace Encicla.Application.Features.Queries.Registration.ValidateDocumentQuery
{
    public sealed record class ValidateDocumentQuery(string DocumentNumber) : IQuery<bool>;
}
