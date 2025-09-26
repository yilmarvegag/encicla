using Encicla.Application.Abstractions.Messaging;
using Encicla.Application.Abstractions.Services;
using Encicla.Domain.Wrappers;

namespace Encicla.Application.Features.Commands.OTPs.VerifyOTP
{
    internal sealed class VerifyOtpCommandHandler : ICommandHandler<VerifyOtpCommand, bool>
    {
        private readonly IOtpService _otpService;

        public VerifyOtpCommandHandler(IOtpService otpService)
        {
            _otpService = otpService;
        }

        public async Task<Result<bool>> Handle(VerifyOtpCommand request, CancellationToken cancellationToken)
        {
            // Validate inputs
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Otp))
            {
                return Result<bool>.Failure("Email and OTP are required.");
            }

            // Verify OTP
            var isValid = await _otpService.VerifyOtpAsync(request.Email, request.Otp, cancellationToken);

            if (!isValid)
            {
                return Result<bool>.Failure("Invalid or expired OTP.");
            }

            // Optionally invalidate OTP after successful verification
            await _otpService.InvalidateOtpAsync(request.Email, cancellationToken);

            return Result<bool>.Success(true, "Otp verify");
        }
    }
}
