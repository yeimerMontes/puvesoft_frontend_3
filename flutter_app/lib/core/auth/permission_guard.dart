class PermissionGuard {
  PermissionGuard(this.permissions);

  final List<String> permissions;

  bool can(String permission) {
    return permissions.contains(permission);
  }

  bool canAny(List<String> required) {
    return required.any(permissions.contains);
  }

  bool canAll(List<String> required) {
    return required.every(permissions.contains);
  }
}
