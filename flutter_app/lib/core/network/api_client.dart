import 'dart:convert';
import 'dart:io';

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

  Future<ApiResult<dynamic>> post(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final uri = _buildUri(path);
    final headers = await buildHeaders();
    try {
      final client = HttpClient();
      final request = await client.postUrl(uri);
      headers.forEach(request.headers.set);
      if (body != null) {
        request.add(utf8.encode(jsonEncode(body)));
      }
      final response = await request.close();
      final responseBody = await _readResponse(response);
      return _handleResponse(response.statusCode, responseBody);
    } on SocketException catch (error) {
      return ApiResult.failure(ApiError(message: error.message));
    } on HttpException catch (error) {
      return ApiResult.failure(ApiError(message: error.message));
    } catch (error) {
      return ApiResult.failure(ApiError(message: error.toString()));
    }
  }

  Future<ApiResult<dynamic>> get(
    String path, {
    Map<String, dynamic>? query,
  }) async {
    final uri = _buildUri(path, query: query);
    final headers = await buildHeaders();
    try {
      final client = HttpClient();
      final request = await client.getUrl(uri);
      headers.forEach(request.headers.set);
      final response = await request.close();
      final responseBody = await _readResponse(response);
      return _handleResponse(response.statusCode, responseBody);
    } on SocketException catch (error) {
      return ApiResult.failure(ApiError(message: error.message));
    } on HttpException catch (error) {
      return ApiResult.failure(ApiError(message: error.message));
    } catch (error) {
      return ApiResult.failure(ApiError(message: error.toString()));
    }
  }

  Future<ApiResult<dynamic>> delete(String path) async {
    final uri = _buildUri(path);
    final headers = await buildHeaders();
    try {
      final client = HttpClient();
      final request = await client.deleteUrl(uri);
      headers.forEach(request.headers.set);
      final response = await request.close();
      final responseBody = await _readResponse(response);
      return _handleResponse(response.statusCode, responseBody);
    } on SocketException catch (error) {
      return ApiResult.failure(ApiError(message: error.message));
    } on HttpException catch (error) {
      return ApiResult.failure(ApiError(message: error.message));
    } catch (error) {
      return ApiResult.failure(ApiError(message: error.toString()));
    }
  }

  Future<ApiResult<dynamic>> put(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final uri = _buildUri(path);
    final headers = await buildHeaders();
    try {
      final client = HttpClient();
      final request = await client.putUrl(uri);
      headers.forEach(request.headers.set);
      if (body != null) {
        request.add(utf8.encode(jsonEncode(body)));
      }
      final response = await request.close();
      final responseBody = await _readResponse(response);
      return _handleResponse(response.statusCode, responseBody);
    } on SocketException catch (error) {
      return ApiResult.failure(ApiError(message: error.message));
    } on HttpException catch (error) {
      return ApiResult.failure(ApiError(message: error.message));
    } catch (error) {
      return ApiResult.failure(ApiError(message: error.toString()));
    }
  }

  Uri _buildUri(String path, {Map<String, dynamic>? query}) {
    final normalizedBase =
        baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    final uri = Uri.parse('$normalizedBase$normalizedPath');
    if (query == null || query.isEmpty) {
      return uri;
    }
    final queryParameters = <String, String>{};
    query.forEach((key, value) {
      if (value == null) {
        return;
      }
      queryParameters[key] = value.toString();
    });
    return uri.replace(queryParameters: queryParameters);
  }

  Future<String> _readResponse(HttpClientResponse response) async {
    final buffer = StringBuffer();
    await for (final chunk in response.transform(utf8.decoder)) {
      buffer.write(chunk);
    }
    return buffer.toString();
  }

  ApiResult<dynamic> _handleResponse(int statusCode, String responseBody) {
    dynamic payload;
    if (responseBody.isNotEmpty) {
      try {
        payload = jsonDecode(responseBody);
      } catch (_) {
        payload = responseBody;
      }
    }

    if (statusCode >= 200 && statusCode < 300) {
      return ApiResult.success(payload);
    }

    final message = _extractErrorMessage(payload) ??
        'Request failed with status code $statusCode';
    return ApiResult.failure(ApiError(message: message, statusCode: statusCode));
  }

  String? _extractErrorMessage(dynamic payload) {
    if (payload is Map<String, dynamic>) {
      final message = payload['message'] ?? payload['error'];
      if (message != null) {
        return message.toString();
      }
    }
    return null;
  }
}
