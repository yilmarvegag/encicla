using Encicla.Application.Abstractions.Messaging;
using Encicla.Application.Abstractions.Services;
using Encicla.Domain.Wrappers;

namespace Encicla.Application.Features.Commands.OTPs.SendOTP
{
    internal sealed class SendOtpCommandHandler : ICommandHandler<SendOtpCommand, bool>
    {
        private readonly IEmailService _emailService;
        private readonly IOtpService _otpService;

        public SendOtpCommandHandler(IOtpService otpService, IEmailService emailService)
        {
            _otpService = otpService;
            _emailService = emailService;
        }

        public async Task<Result<bool>> Handle(SendOtpCommand request, CancellationToken cancellationToken)
        {
            // Validate email
            if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains("@"))
            {
                return Result<bool>.Failure("Invalid email address.");
            }

            // Generate OTP
            var otp = _otpService.GenerateOtp();

            // Store OTP(e.g., in cache with expiration)
            await _otpService.StoreOtpAsync(request.Email, otp, cancellationToken);

            // Send email
            await _emailService.SendOtpEmailAsync(request.Email, otp, cancellationToken);

            return Result<bool>.Success(true, "OTP Sent");
        }
    }
}
