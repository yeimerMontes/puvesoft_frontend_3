class ApiResult<T> {
  ApiResult.success(this.data)
      : error = null,
        _isSuccess = true;
  ApiResult.failure(this.error)
      : data = null,
        _isSuccess = false;

  final T? data;
  final ApiError? error;
  final bool _isSuccess;

  bool get isSuccess => _isSuccess;
  bool get isFailure => !_isSuccess;
}

class ApiError {
  ApiError({
    required this.message,
    this.statusCode,
  });

  final String message;
  final int? statusCode;
}
