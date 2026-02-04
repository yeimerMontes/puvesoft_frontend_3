import 'data/sync_queue.dart';

class SyncService {
  SyncService(this._queueRepository);

  final SyncQueueRepository _queueRepository;

  Future<void> syncPending() async {
    final items = await _queueRepository.pendingItems();
    for (final item in items) {
      try {
        final success = await _dispatch(item);
        if (success) {
          await _queueRepository.markCompleted(item.id);
        } else {
          await _queueRepository.markFailed(item.id);
        }
      } catch (_) {
        await _queueRepository.markFailed(item.id);
      }
    }
  }

  Future<bool> _dispatch(SyncQueueItem item) async {
    if (!item.type.isKnown) {
      return false;
    }
    switch (item.type) {
      case SyncQueueItemType.saleCreate:
      case SyncQueueItemType.cartUpdate:
      case SyncQueueItemType.cashboxOpen:
      case SyncQueueItemType.cashboxClose:
        // TODO: route item to correct repository based on type.
        return true;
    }
  }
}
