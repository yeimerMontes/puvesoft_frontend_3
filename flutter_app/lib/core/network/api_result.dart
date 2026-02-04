class ApiResult<T> {
  ApiResult.success(this.data) : error = null;
  ApiResult.failure(this.error) : data = null;

  final T? data;
  final ApiError? error;

  bool get isSuccess => error == null;
}

class ApiError {
  ApiError({
    required this.message,
    this.statusCode,
  });

  final String message;
  final int? statusCode;
}
