using Encicla.Domain.Wrappers;
using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace Encicla.Application.Behaviours
{
    /// <summary>
    /// Logs start/end of every request and, when the handler returns an IResult,
    /// logs Success/Failure with message and detail.
    /// </summary>
    public sealed class LoggingPipelineBehavior<TRequest, TResponse>
        : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly ILogger<LoggingPipelineBehavior<TRequest, TResponse>> _logger;

        public LoggingPipelineBehavior(ILogger<LoggingPipelineBehavior<TRequest, TResponse>> logger)
            => _logger = logger;

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            var reqName = typeof(TRequest).Name;
            var sw = Stopwatch.StartNew();

            _logger.LogInformation("Starting request {RequestName} at {Utc}",
                reqName, DateTime.UtcNow);

            try
            {
                var response = await next();

                sw.Stop();

                if (response is IResult r)
                {
                    if (!r.IsSuccess)
                    {
                        _logger.LogWarning(
                            "Request {RequestName} failed in {ElapsedMs} ms. Message={Message}. Detail={Detail}",
                            reqName, sw.ElapsedMilliseconds, r.Message, r.Detail);
                    }
                    else
                    {
                        _logger.LogInformation(
                            "Completed request {RequestName} successfully in {ElapsedMs} ms. Message={Message}",
                            reqName, sw.ElapsedMilliseconds, r.Message);
                    }
                }
                else
                {
                    _logger.LogInformation(
                        "Completed request {RequestName} (non-IResult) in {ElapsedMs} ms",
                        reqName, sw.ElapsedMilliseconds);
                }

                return response;
            }
            catch (Exception ex)
            {
                sw.Stop();
                _logger.LogError(ex,
                    "Unhandled exception in request {RequestName} after {ElapsedMs} ms",
                    reqName, sw.ElapsedMilliseconds);
                throw; // let your exception middleware shape the HTTP response
            }
        }
    }
}
