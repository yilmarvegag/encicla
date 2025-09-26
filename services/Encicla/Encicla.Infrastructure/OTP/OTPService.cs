using Encicla.Application.Abstractions.Services;
using Microsoft.Extensions.Caching.Distributed;
using System.Security.Cryptography;
using System.Text;

namespace Encicla.Infrastructure.OTP
{
    public class OtpService : IOtpService
    {
        private readonly IDistributedCache _cache;
        private readonly TimeSpan _otpExpiration = TimeSpan.FromMinutes(5);

        public OtpService(IDistributedCache cache)
        {
            _cache = cache;
        }

        public string GenerateOtp()
        {
            // Generar OTP de 6 dígitos
            var bytes = RandomNumberGenerator.GetBytes(4);
            var number = BitConverter.ToUInt32(bytes, 0) % 1000000;
            return number.ToString("D6"); // Asegura 6 dígitos con ceros a la izquierda
        }

        public async Task StoreOtpAsync(string email, string otp, CancellationToken cancellationToken)
        {
            var cacheKey = $"otp:{email}";
            var otpBytes = Encoding.UTF8.GetBytes(otp);
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = _otpExpiration
            };
            await _cache.SetAsync(cacheKey, otpBytes, options, cancellationToken);
        }

        public async Task<bool> VerifyOtpAsync(string email, string otp, CancellationToken cancellationToken)
        {
            var cacheKey = $"otp:{email}";
            var storedOtpBytes = await _cache.GetAsync(cacheKey, cancellationToken);

            if (storedOtpBytes == null)
            {
                return false; // OTP no encontrado o expirado
            }

            var storedOtp = Encoding.UTF8.GetString(storedOtpBytes);
            return storedOtp == otp;
        }

        public async Task InvalidateOtpAsync(string email, CancellationToken cancellationToken)
        {
            var cacheKey = $"otp:{email}";
            await _cache.RemoveAsync(cacheKey, cancellationToken);
        }
    }
}
