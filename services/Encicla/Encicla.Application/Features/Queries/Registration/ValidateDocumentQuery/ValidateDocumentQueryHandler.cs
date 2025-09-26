using Encicla.Application.Abstractions.Messaging;
using Encicla.Domain.Wrappers;

namespace Encicla.Application.Features.Queries.Registration.ValidateDocumentQuery
{
    internal sealed class ValidateDocumentQueryHandler : IQueryHandler<ValidateDocumentQuery, bool>
    {
        public async Task<Result<bool>> Handle(ValidateDocumentQuery request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.DocumentNumber))
            {
                return Result<bool>.Failure("Document number cannot be empty.");
            }

            //var exists = await _repository.DocumentExistsAsync(request.DocumentNumber, cancellationToken);

            //return exists
            //    ? Result.Success(true, "Document found.")
            //    : Result.Failure("Document not found.", false);
            if (request.DocumentNumber == "00000000" || !request.DocumentNumber.Contains("100656"))
            {
                return Result<bool>.Success(false, "Document not found.");
            }

            return Result<bool>.Success(true, "Document found.");
        }
    }
}
