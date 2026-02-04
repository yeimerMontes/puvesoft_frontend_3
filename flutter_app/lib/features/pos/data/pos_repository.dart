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

  Future<ApiResult<List<dynamic>>> fetchCartItems() {
    return _client.get(ApiEndpoints.cartSales);
  }

  Future<ApiResult<Map<String, dynamic>>> fetchCartDetail(String cartId) {
    return _client.get(ApiEndpoints.cartDetail, query: {'carrito_venta': cartId});
  }

  Future<ApiResult<void>> updateCartAlias(String cartId, String alias) {
    return _client.get('${ApiEndpoints.changeAlias}/$cartId', query: {'alias': alias});
  }

  Future<ApiResult<void>> updateCartNote(String cartId, String note) {
    return _client.get('${ApiEndpoints.saveNote}/$cartId', query: {'nota': note});
  }

  Future<ApiResult<void>> deleteCartItem(String cartId) {
    return _client.delete('${ApiEndpoints.cartSales}/$cartId');
  }
}
