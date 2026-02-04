import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_result.dart';
import 'pos_models.dart';

class PosRepository {
  PosRepository(this._client);

  final ApiClient _client;

  Future<ApiResult<Map<String, dynamic>>> createSale(PosSalePayload payload) {
    return _client.post(ApiEndpoints.posPay, body: payload.payload);
  }

  Future<ApiResult<Map<String, dynamic>>> createCartItem(CartItemPayload payload) {
    return _client.post(ApiEndpoints.cartSales, body: payload.payload);
  }

  Future<ApiResult<void>> deleteCartItem(String cartId) {
    return _client.delete('${ApiEndpoints.cartSales}/$cartId');
  }
}
