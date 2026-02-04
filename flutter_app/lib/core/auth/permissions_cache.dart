import '../storage/secure_store.dart';

class PermissionsCache {
  PermissionsCache(this._store);

  final SecureStore _store;
  static const String _permissionsKey = 'auth.permissions';

  Future<void> save(List<String> permissions) async {
    await _store.write(key: _permissionsKey, value: permissions.join(','));
  }

  Future<List<String>> read() async {
    final raw = await _store.read(key: _permissionsKey);
    if (raw == null || raw.isEmpty) {
      return [];
    }
    return raw.split(',');
  }

  Future<void> clear() async {
    await _store.delete(key: _permissionsKey);
  }
}
