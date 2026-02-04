import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_result.dart';
import 'customer_models.dart';

class CustomerRepository {
  CustomerRepository(this._client);

  final ApiClient _client;

  Future<ApiResult<List<dynamic>>> listCustomers(CustomerSearchParams params) {
    return _client.get(ApiEndpoints.customers, query: params.toQuery());
  }

  Future<ApiResult<Map<String, dynamic>>> createCustomer(Map<String, dynamic> payload) {
    return _client.post(ApiEndpoints.customers, body: payload);
  }

  Future<ApiResult<void>> updateCustomer(String id, Map<String, dynamic> payload) {
    return _client.put('${ApiEndpoints.customers}/$id', body: payload);
  }

  Future<ApiResult<void>> deleteCustomer(String id) {
    return _client.delete('${ApiEndpoints.customers}/$id');
  }

  Future<ApiResult<List<dynamic>>> searchCustomerByName(String search) {
    return _client.get(ApiEndpoints.customerSearch, query: {'search': search});
  }

  Future<ApiResult<List<dynamic>>> searchCustomerByDocument(String search) {
    return _client.get(ApiEndpoints.customerSearchDocument, query: {'search': search});
  }
}
