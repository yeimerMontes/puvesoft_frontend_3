import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_result.dart';

class AuthRepository {
  AuthRepository(this._client);

  final ApiClient _client;

  Future<ApiResult<Map<String, dynamic>>> login({
    required String username,
    required String password,
  }) {
    return _client.post(ApiEndpoints.authLogin, body: {
      'username': username,
      'password': password,
    });
  }

  Future<ApiResult<Map<String, dynamic>>> loginAdmin({
    required String username,
    required String password,
  }) {
    return _client.post(ApiEndpoints.authLoginAdmin, body: {
      'username': username,
      'password': password,
    });
  }

  Future<ApiResult<void>> logout() {
    return _client.post(ApiEndpoints.authLogout);
  }

  Future<ApiResult<void>> sendPasswordRecovery({required String email}) {
    return _client.post(ApiEndpoints.sendMail, body: {'email': email});
  }
}
