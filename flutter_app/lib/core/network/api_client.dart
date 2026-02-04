import '../auth/token_storage.dart';
import 'api_result.dart';

class ApiClient {
  ApiClient({
    required this.baseUrl,
    required this.tokenStorage,
  });

  final String baseUrl;
  final TokenStorage tokenStorage;

  Future<Map<String, String>> buildHeaders() async {
    final token = await tokenStorage.readToken();
    return {
      'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  Future<ApiResult<T>> post<T>(String path, {Map<String, dynamic>? body}) async {
    // TODO: implement HTTP POST
    return ApiResult.failure(ApiError(message: 'Not implemented'));
  }

  Future<ApiResult<T>> get<T>(String path, {Map<String, dynamic>? query}) async {
    // TODO: implement HTTP GET
    return ApiResult.failure(ApiError(message: 'Not implemented'));
  }

  Future<ApiResult<T>> delete<T>(String path) async {
    // TODO: implement HTTP DELETE
    return ApiResult.failure(ApiError(message: 'Not implemented'));
  }
}
