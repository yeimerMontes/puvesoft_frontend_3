class AuthTokens {
  AuthTokens({
    required this.token,
    this.refreshToken,
  });

  final String token;
  final String? refreshToken;
}
