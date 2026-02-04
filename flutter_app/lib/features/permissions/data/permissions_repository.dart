import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_result.dart';
import 'permissions_model.dart';

class PermissionsRepository {
  PermissionsRepository(this._client);

  final ApiClient _client;

  Future<ApiResult<List<String>>> fetchPermissions() async {
    final result = await _client.get(ApiEndpoints.permissions);
    if (result.isSuccess) {
      return ApiResult.success(PermissionsModel.fromDynamic(result.data));
    }
    return ApiResult.failure(result.error ?? ApiError(message: 'Unknown error'));
  }
}
