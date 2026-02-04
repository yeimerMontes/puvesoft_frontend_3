import 'dart:convert';

import 'package:http/http.dart' as http;

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

  Uri _buildUri(String path, {Map<String, dynamic>? query}) {
    final base = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    final uri = Uri.parse('$base$normalizedPath');
    if (query == null || query.isEmpty) {
      return uri;
    }
    return uri.replace(
      queryParameters: query.map((key, value) => MapEntry(key, value?.toString() ?? '')),
    );
  }

  ApiResult<T> _handleResponse<T>(http.Response response) {
    final statusCode = response.statusCode;
    if (statusCode >= 200 && statusCode < 300) {
      if (response.body.isEmpty) {
        return ApiResult.success(null as T);
      }
      final dynamic decoded = json.decode(response.body);
      return ApiResult.success(decoded as T);
    }
    return ApiResult.failure(
      ApiError(
        message: response.body.isNotEmpty ? response.body : 'HTTP $statusCode',
        statusCode: statusCode,
      ),
    );
  }

  Future<ApiResult<T>> post<T>(String path, {Map<String, dynamic>? body}) async {
    try {
      final uri = _buildUri(path);
      final headers = await buildHeaders();
      final response = await http.post(
        uri,
        headers: headers,
        body: body == null ? null : json.encode(body),
      );
      return _handleResponse<T>(response);
    } catch (error) {
      return ApiResult.failure(ApiError(message: error.toString()));
    }
  }

  Future<ApiResult<T>> get<T>(String path, {Map<String, dynamic>? query}) async {
    try {
      final uri = _buildUri(path, query: query);
      final headers = await buildHeaders();
      final response = await http.get(uri, headers: headers);
      return _handleResponse<T>(response);
    } catch (error) {
      return ApiResult.failure(ApiError(message: error.toString()));
    }
  }

  Future<ApiResult<T>> delete<T>(String path) async {
    try {
      final uri = _buildUri(path);
      final headers = await buildHeaders();
      final response = await http.delete(uri, headers: headers);
      return _handleResponse<T>(response);
    } catch (error) {
      return ApiResult.failure(ApiError(message: error.toString()));
    }
  }
}
