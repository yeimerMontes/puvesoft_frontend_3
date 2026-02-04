import 'data/sync_queue.dart';

class SyncService {
  SyncService(this._queueRepository);

  final SyncQueueRepository _queueRepository;

  Future<void> syncPending() async {
    final items = await _queueRepository.pendingItems();
    for (final item in items) {
      if (item.status != SyncQueueStatus.pending) {
        continue;
      }
      // TODO: send item to server based on type
      await _queueRepository.markCompleted(item.id);
    }
  }
}
