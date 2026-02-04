import '../../../core/network/api_client.dart';
import '../../../core/network/api_result.dart';
import 'product_models.dart';

class ProductRepository {
  ProductRepository(this._client);

  final ApiClient _client;

  Future<ApiResult<List<dynamic>>> listProducts(ProductSearchParams params) {
    return _client.get('/productos', query: params.toQuery());
  }

  Future<ApiResult<List<dynamic>>> searchActiveProducts({required String search}) {
    return _client.get('/busquedaPorNombreProductosActivas', query: {'search': search});
  }

  Future<ApiResult<Map<String, dynamic>>> createProduct(Map<String, dynamic> payload) {
    return _client.post('/productos', body: payload);
  }

  Future<ApiResult<void>> updateProduct(String id, Map<String, dynamic> payload) {
    return _client.put('/productos/$id', body: payload);
  }

  Future<ApiResult<void>> deleteProduct(String id) {
    return _client.delete('/productos/$id');
  }
}
