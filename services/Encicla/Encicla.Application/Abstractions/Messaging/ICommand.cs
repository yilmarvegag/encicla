using Encicla.Domain.Wrappers;
using MediatR;

namespace Encicla.Application.Abstractions.Messaging
{
    /// <summary>
    /// Generic Command.
    /// NO retorna un response
    /// Retorna un objeto result en un wrapper
    /// </summary>
    /// 
    //ambos retornan un Result object wrapper
    public interface ICommand<TResponse> : IRequest<Result<TResponse>>
    {
    }
}
