import 'secure_store.dart';

class MemoryStore implements SecureStore {
  final Map<String, String> _cache = {};

  @override
  Future<void> write({required String key, required String value}) async {
    _cache[key] = value;
  }

  @override
  Future<String?> read({required String key}) async {
    return _cache[key];
  }

  @override
  Future<void> delete({required String key}) async {
    _cache.remove(key);
  }
}
