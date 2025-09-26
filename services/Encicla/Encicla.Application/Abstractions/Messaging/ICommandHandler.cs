using Encicla.Domain.Wrappers;
using MediatR;

namespace Encicla.Application.Abstractions.Messaging
{
    /// <summary>
    /// Result es el tipo de retorno esperado
    /// </summary>
    /// <typeparam name="TCommand"></typeparam>
    public interface ICommandHandler<TCommand, TResponse> : IRequestHandler<TCommand, Result<TResponse>> where TCommand : ICommand<TResponse>
    {
    }
}
