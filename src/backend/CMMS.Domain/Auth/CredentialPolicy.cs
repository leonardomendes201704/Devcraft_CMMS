using System.Text.RegularExpressions;

namespace CMMS.Domain.Auth;

public static class CredentialPolicy
{
    private static readonly Regex UppercaseRegex = new("[A-Z]", RegexOptions.Compiled);
    private static readonly Regex LowercaseRegex = new("[a-z]", RegexOptions.Compiled);
    private static readonly Regex NumberRegex = new("[0-9]", RegexOptions.Compiled);
    private static readonly Regex SpecialCharRegex = new("[^A-Za-z0-9]", RegexOptions.Compiled);

    public static CredentialValidationResult ValidatePassword(string? password)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            return new CredentialValidationResult(false, "Password is required.");
        }

        if (password.Length < 10)
        {
            return new CredentialValidationResult(false, "Password must have at least 10 characters.");
        }

        if (!UppercaseRegex.IsMatch(password))
        {
            return new CredentialValidationResult(false, "Password must contain at least one uppercase character.");
        }

        if (!LowercaseRegex.IsMatch(password))
        {
            return new CredentialValidationResult(false, "Password must contain at least one lowercase character.");
        }

        if (!NumberRegex.IsMatch(password))
        {
            return new CredentialValidationResult(false, "Password must contain at least one number.");
        }

        if (!SpecialCharRegex.IsMatch(password))
        {
            return new CredentialValidationResult(false, "Password must contain at least one special character.");
        }

        return new CredentialValidationResult(true, null);
    }
}

public sealed record CredentialValidationResult(
    bool IsValid,
    string? Error);
