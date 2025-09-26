using Encicla.Domain.Exceptions;
using Encicla.Domain.Wrappers;
using System.Net;
using System.Text.Json;

namespace Encicla.API.Middlewares
{
    public class GlobalExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;

        public GlobalExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<GlobalExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="context"></param>
        /// <returns></returns>
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    "Global Exception failure {@InnerException},{@Message}, {@DateTimeUtc}",
                    ex.InnerException,
                    ex.Message,
                    DateTime.UtcNow);

                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            int httpStatusCode = (int)HttpStatusCode.BadRequest;
            string httpStatusMessage = HttpStatusCode.BadRequest.ToString();
            context.Response.StatusCode = httpStatusCode;

            Response responseApi = new()
            {
                Type = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400",
                Instance = context.Request.Path
            };


            string result;

            switch (exception)
            {
                case InvalidModelException ex:
                    context.Response.StatusCode = httpStatusCode;
                    responseApi.Title = httpStatusMessage;
                    responseApi.Status = httpStatusCode;
                    responseApi.Message = ex.Message;
                    responseApi.Errors = ex.Errors;
                    break;
                case EnciclaDomainException ex:
                    context.Response.StatusCode = httpStatusCode;
                    responseApi.Title = httpStatusMessage;
                    responseApi.Status = httpStatusCode;
                    responseApi.Message = ex.Message;
                    break;
                default:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    responseApi.Type = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500";
                    responseApi.Title = HttpStatusCode.InternalServerError.ToString();
                    responseApi.Status = (int)HttpStatusCode.InternalServerError;
                    responseApi.Message = exception.Message;
                    break;
            }

            result = JsonSerializer.Serialize(responseApi);
            await context.Response.WriteAsync(result);
        }
    }
}
