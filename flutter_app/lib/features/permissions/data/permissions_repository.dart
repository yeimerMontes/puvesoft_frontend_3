import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_result.dart';

class PermissionsRepository {
  PermissionsRepository(this._client);

  final ApiClient _client;

  Future<ApiResult<List<dynamic>>> fetchPermissions() {
    return _client.get(ApiEndpoints.permissions);
  }
}
