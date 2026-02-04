enum SyncQueueItemType {
  saleCreate,
  cartUpdate,
  cashboxOpen,
  cashboxClose,
}

extension SyncQueueItemTypeX on SyncQueueItemType {
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
