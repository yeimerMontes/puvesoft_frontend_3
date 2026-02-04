import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_result.dart';
import 'auth_models.dart';

class AuthRepository {
  AuthRepository(this._client);

  final ApiClient _client;

  Future<ApiResult<AuthTokens>> login({
    required String username,
    required String password,
  }) async {
    final result = await _client.post(ApiEndpoints.authLogin, body: {
      'username': username,
      'password': password,
    });
    if (result.isSuccess) {
      final data = result.data ?? {};
      final token = data['token']?.toString() ?? '';
      final refreshToken = data['refresh_token']?.toString();
      return ApiResult.success(AuthTokens(token: token, refreshToken: refreshToken));
    }
    return ApiResult.failure(result.error ?? ApiError(message: 'Unknown error'));
  }

  Future<ApiResult<AuthTokens>> loginAdmin({
    required String username,
    required String password,
  }) async {
    final result = await _client.post(ApiEndpoints.authLoginAdmin, body: {
      'username': username,
      'password': password,
    });
    if (result.isSuccess) {
      final data = result.data ?? {};
      final token = data['token']?.toString() ?? '';
      final refreshToken = data['refresh_token']?.toString();
      return ApiResult.success(AuthTokens(token: token, refreshToken: refreshToken));
    }
    return ApiResult.failure(result.error ?? ApiError(message: 'Unknown error'));
  }

  Future<ApiResult<void>> logout() {
    return _client.post(ApiEndpoints.authLogout);
  }

  Future<ApiResult<void>> sendPasswordRecovery({required String email}) {
    return _client.post(ApiEndpoints.sendMail, body: {'email': email});
  }
}
