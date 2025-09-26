using Encicla.Domain.Exceptions;
using FluentValidation;
using MediatR;

namespace Encicla.Application.Behaviours
{
    /// <summary>
    /// Allows us to add a behavior to our mediator execution pipeline, adding functionality.
    /// </summary>
    /// <typeparam name="TRequest"></typeparam>
    /// <typeparam name="TResponse"></typeparam>
    public class ValidationPipelineBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly IEnumerable<IValidator<TRequest>> _validators;

        public ValidationPipelineBehavior(IEnumerable<IValidator<TRequest>> validators) =>
        _validators = validators;

        /// <summary>
        /// By executing an IRequest<T>, we can tell it to do something, before executing the Handler determined by the mediator.
        /// </summary>
        /// <param name="request"></param>
        /// <param name="next"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        /// <exception cref="ValidationException"></exception>
        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            if (_validators.Any())
            {
                var context = new ValidationContext<TRequest>(request);

                var validationResults = await Task.WhenAll(
                    _validators.Select(v =>
                        v.ValidateAsync(context, cancellationToken)));

                var failures = validationResults
                    .Where(r => r.Errors.Any())
                    .SelectMany(r => r.Errors)
                    .ToList();

                if (failures.Any())
                    throw new InvalidModelException(failures);
            }
            return await next();
        }
    }
}
