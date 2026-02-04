import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_result.dart';
import 'cashbox_models.dart';

class CashboxRepository {
  CashboxRepository(this._client);

  final ApiClient _client;

  Future<ApiResult<Map<String, dynamic>>> openCashbox(CashboxOpenPayload payload) {
    return _client.post(ApiEndpoints.cashboxOpen, body: payload.payload);
  }

  Future<ApiResult<Map<String, dynamic>>> closeCashbox(CashboxClosePayload payload) {
    return _client.post(ApiEndpoints.cashboxClose, body: payload.payload);
  }

  Future<ApiResult<List<dynamic>>> listCashboxes({Map<String, dynamic>? query}) {
    return _client.get(ApiEndpoints.cashboxHistory, query: query);
  }

  Future<ApiResult<Map<String, dynamic>>> cashboxStatus() {
    return _client.get(ApiEndpoints.cashboxStatus);
  }
}
