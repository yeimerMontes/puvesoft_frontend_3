enum SyncQueueItemType {
  saleCreate,
  cartUpdate,
  cashboxOpen,
  cashboxClose,
}

extension SyncQueueItemTypeX on SyncQueueItemType {
  static SyncQueueItemType fromValue(String value) {
    for (final type in SyncQueueItemType.values) {
      if (type.name == value || type.key == value) {
        return type;
      }
    }
    return SyncQueueItemType.saleCreate;
  }

  String get key {
    switch (this) {
      case SyncQueueItemType.saleCreate:
        return 'sale:create';
      case SyncQueueItemType.cartUpdate:
        return 'cart:update';
      case SyncQueueItemType.cashboxOpen:
        return 'cashbox:open';
      case SyncQueueItemType.cashboxClose:
        return 'cashbox:close';
    }
  }
}
