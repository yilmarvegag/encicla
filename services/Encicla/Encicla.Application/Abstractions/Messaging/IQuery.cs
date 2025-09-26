using Encicla.Domain.Wrappers;
using MediatR;

namespace Encicla.Application.Abstractions.Messaging;

public interface IQuery<TResponse> : IRequest<Result<TResponse>> { }