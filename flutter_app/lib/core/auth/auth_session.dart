import 'permissions_cache.dart';
import 'token_storage.dart';

class AuthSession {
  AuthSession({
    required this.tokenStorage,
    required this.permissionsCache,
  });

  final TokenStorage tokenStorage;
  final PermissionsCache permissionsCache;

  Future<void> clear() async {
    await tokenStorage.clearToken();
    await permissionsCache.clear();
  }
}
