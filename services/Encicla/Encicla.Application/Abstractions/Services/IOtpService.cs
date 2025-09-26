namespace Encicla.Application.Abstractions.Services
{
    public interface IOtpService
    {
        string GenerateOtp();
        Task StoreOtpAsync(string email, string otp, CancellationToken cancellationToken);
        Task<bool> VerifyOtpAsync(string email, string otp, CancellationToken cancellationToken);
        Task InvalidateOtpAsync(string email, CancellationToken cancellationToken);
    }
}
