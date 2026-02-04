import '../storage/secure_store.dart';

class TokenStorage {
  TokenStorage(this._store);

  final SecureStore _store;
  static const String _tokenKey = 'auth.token';

  Future<void> saveToken(String token) async {
    await _store.write(key: _tokenKey, value: token);
  }

  Future<String?> readToken() async {
    return _store.read(key: _tokenKey);
  }

  Future<void> clearToken() async {
    await _store.delete(key: _tokenKey);
  }
}
