namespace Encicla.Application.Abstractions.Services
{
    public interface IEmailService
    {
        Task SendOtpEmailAsync(string email, string otp, CancellationToken cancellationToken);
    }
}
