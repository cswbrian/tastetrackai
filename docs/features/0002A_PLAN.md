# Feature 0002A: Queue-Based Processing System (Future Enhancement)

## Context
Implement a robust queue-based processing system that handles online/offline scenarios, ensures discoveries are always saved, and makes LLM processing scalable. This feature will provide immediate user feedback while processing happens in the background.

**Prerequisite**: Features 0001 (Basic Discovery Creation) and 0002 (LLM Integration) must be completed first.

**Future Scope**: Local queue system, offline support, background processing, retry logic, conflict resolution.

## Technical Plan

### Phase 1: Database Schema Updates

#### Processing Queue Table
- **File**: `supabase/migrations/002A_create_processing_queue.sql`
- **Changes**: Create queue table for processing management
```sql
-- Processing queue table
CREATE TABLE processing_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discovery_id UUID REFERENCES discoveries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  queue_type TEXT NOT NULL CHECK (queue_type IN ('llm_processing', 'image_analysis', 'location_enhancement')),
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'retry')),
  priority INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  payload JSONB NOT NULL,
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Queue management indexes
CREATE INDEX idx_processing_queue_status ON processing_queue(status);
CREATE INDEX idx_processing_queue_user_id ON processing_queue(user_id);
CREATE INDEX idx_processing_queue_priority ON processing_queue(priority DESC, created_at ASC);
CREATE INDEX idx_processing_queue_retry ON processing_queue(retry_count, status) WHERE status = 'retry';
```

#### Enhanced Discovery Schema
- **File**: `supabase/migrations/002A_enhance_discoveries_queue.sql`
- **Changes**: Add queue-related fields to discoveries
```sql
-- Add queue tracking to discoveries
ALTER TABLE discoveries ADD COLUMN queue_id UUID REFERENCES processing_queue(id);
ALTER TABLE discoveries ADD COLUMN sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict'));
ALTER TABLE discoveries ADD COLUMN local_id TEXT; -- For offline-created discoveries

-- Index for sync status
CREATE INDEX idx_discoveries_sync_status ON discoveries(sync_status);
CREATE INDEX idx_discoveries_local_id ON discoveries(local_id);
```

### Phase 2: Local Storage & Queue Management

#### Local Queue Service
- **File**: `services/localQueueService.ts`
- **Changes**: Create service for local queue management
```typescript
interface QueueItem {
  id: string;
  discovery_id: string;
  user_id: string;
  queue_type: 'llm_processing' | 'image_analysis' | 'location_enhancement';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'retry';
  priority: number;
  retry_count: number;
  max_retries: number;
  payload: any;
  error_message?: string;
  created_at: string;
}

- addToLocalQueue(item: Omit<QueueItem, 'id' | 'created_at'>): Promise<string>
- getLocalQueue(): Promise<QueueItem[]>
- updateQueueItem(id: string, updates: Partial<QueueItem>): Promise<void>
- removeFromLocalQueue(id: string): Promise<void>
- clearCompletedQueue(): Promise<void>
- getPendingItems(): Promise<QueueItem[]>
- getRetryItems(): Promise<QueueItem[]>
```

#### Network State Service
- **File**: `services/networkService.ts`
- **Changes**: Create service for network state management
```typescript
interface NetworkState {
  isOnline: boolean;
  connectionType: 'wifi' | 'cellular' | 'none';
  lastSync: string;
  pendingSyncCount: number;
}

- getNetworkState(): Promise<NetworkState>
- isOnline(): Promise<boolean>
- onNetworkChange(callback: (state: NetworkState) => void): () => void
- waitForConnection(): Promise<void>
- getConnectionQuality(): Promise<'excellent' | 'good' | 'poor'>
```

### Phase 3: Queue Processing Engine

#### Queue Processor Service
- **File**: `services/queueProcessorService.ts`
- **Changes**: Create service for processing queue items
```typescript
interface ProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
  retry?: boolean;
}

- startProcessing(): Promise<void>
- stopProcessing(): Promise<void>
- processQueueItem(item: QueueItem): Promise<ProcessingResult>
- handleProcessingError(item: QueueItem, error: Error): Promise<void>
- shouldRetry(item: QueueItem, error: Error): boolean
- calculateRetryDelay(retryCount: number): number
- batchProcess(items: QueueItem[]): Promise<ProcessingResult[]>
```

#### Enhanced LLM Service
- **File**: `services/llmService.ts`
- **Changes**: Add queue-aware LLM processing
```typescript
- processDiscoveryWithLLM(discovery: DiscoveryInput): Promise<ExtractedData>
- processFromQueue(queueItem: QueueItem): Promise<ProcessingResult>
- createExtractionPrompt(text: string, imageUrl?: string): string
- parseLLMResponse(response: string): ExtractedData
- validateExtractedData(data: ExtractedData): boolean
- handleLLMError(error: Error, retryCount: number): Promise<boolean>
```

### Phase 4: Sync & Conflict Resolution

#### Sync Service
- **File**: `services/syncService.ts`
- **Changes**: Create service for data synchronization
```typescript
interface SyncResult {
  success: boolean;
  syncedItems: number;
  conflicts: number;
  errors: string[];
}

- syncLocalToRemote(): Promise<SyncResult>
- syncRemoteToLocal(): Promise<SyncResult>
- resolveConflicts(conflicts: Conflict[]): Promise<void>
- mergeDiscoveryData(local: Discovery, remote: Discovery): Discovery
- validateSyncIntegrity(): Promise<boolean>
- getSyncStatus(): Promise<SyncStatus>
```

#### Conflict Resolution Service
- **File**: `services/conflictResolutionService.ts`
- **Changes**: Create service for handling data conflicts
```typescript
interface Conflict {
  id: string;
  localData: any;
  remoteData: any;
  conflictType: 'creation' | 'update' | 'deletion';
  resolution: 'local' | 'remote' | 'merge' | 'manual';
}

- detectConflicts(): Promise<Conflict[]>
- resolveConflict(conflict: Conflict, resolution: string): Promise<void>
- autoResolveConflicts(): Promise<void>
- getConflictResolutionStrategy(conflict: Conflict): string
- validateResolution(conflict: Conflict, resolution: any): boolean
```

### Phase 5: Enhanced Discovery Service

#### Queue-Aware Discovery Service
- **File**: `services/discoveryService.ts`
- **Changes**: Enhance discovery service with queue support
```typescript
- createDiscovery(data: DiscoveryInput): Promise<Discovery>
- createDiscoveryOffline(data: DiscoveryInput): Promise<Discovery>
- syncDiscovery(discoveryId: string): Promise<void>
- getDiscoveryWithQueueStatus(discoveryId: string): Promise<DiscoveryWithQueue>
- updateDiscoveryWithQueue(id: string, data: Partial<Discovery>): Promise<Discovery>
- deleteDiscoveryWithQueue(id: string): Promise<void>
- getPendingDiscoveries(): Promise<Discovery[]>
- getSyncStatus(): Promise<SyncStatus>
```

### Phase 6: State Management Updates

#### Enhanced Discovery Store
- **File**: `stores/discoveryStore.ts`
- **Changes**: Add queue and sync state management
```typescript
interface DiscoveryStore {
  discoveries: Discovery[];
  queueItems: QueueItem[];
  networkState: NetworkState;
  syncStatus: SyncStatus;
  isLoading: boolean;
  
  // Actions
  createDiscovery: (data: DiscoveryInput) => Promise<void>;
  createDiscoveryOffline: (data: DiscoveryInput) => Promise<void>;
  fetchDiscoveries: () => Promise<void>;
  syncDiscoveries: () => Promise<void>;
  processQueue: () => Promise<void>;
  retryFailedProcessing: (discoveryId: string) => Promise<void>;
  resolveConflicts: (conflicts: Conflict[]) => Promise<void>;
  updateNetworkState: (state: NetworkState) => void;
}
```

#### Queue Store
- **File**: `stores/queueStore.ts`
- **Changes**: Create dedicated store for queue management
```typescript
interface QueueStore {
  queueItems: QueueItem[];
  processingStatus: 'idle' | 'processing' | 'paused' | 'error';
  networkState: NetworkState;
  syncStatus: SyncStatus;
  
  // Actions
  addToQueue: (item: Omit<QueueItem, 'id' | 'created_at'>) => Promise<void>;
  processQueue: () => Promise<void>;
  retryItem: (itemId: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  pauseProcessing: () => void;
  resumeProcessing: () => void;
  syncWithRemote: () => Promise<void>;
}
```

### Phase 7: UI Enhancements

#### Queue Status Component
- **File**: `components/queue/QueueStatus.tsx`
- **Changes**: Create component for queue status display
- **Features**:
  - Queue status indicator
  - Pending items count
  - Sync status
  - Network status
  - Manual sync button

#### Enhanced Discovery Card
- **File**: `components/discovery/DiscoveryCard.tsx`
- **Changes**: Add queue status to discovery cards
- **Features**:
  - Queue processing status
  - Sync status indicator
  - Retry button for failed processing
  - Offline indicator

#### Sync Status Component
- **File**: `components/sync/SyncStatus.tsx`
- **Changes**: Create component for sync status
- **Features**:
  - Sync progress indicator
  - Conflict resolution UI
  - Manual sync controls
  - Network status display

### Phase 8: Configuration Migration

#### Processing Configuration Update
- **File**: `config/processing.ts`
- **Changes**: Update configuration to enable queue mode
```typescript
export const PROCESSING_CONFIG = {
  // Switch to queue mode
  mode: 'queue' as 'immediate' | 'queue',
  
  // LLM configuration
  llm: {
    timeout: 30000,
    maxRetries: 3,
    retryDelay: 5000,
    model: 'gpt-4o-mini' as 'gpt-4o-mini' | 'gemini-flash'
  },
  
  // Queue configuration
  queue: {
    enabled: true,
    batchSize: 10,
    retryAttempts: 3,
    retryDelay: 5000,
    priorityLevels: ['high', 'normal', 'low'],
    maxConcurrent: 3
  }
};
```

## Algorithms

### Queue Processing Flow
1. **Discovery Creation**: User creates discovery
2. **Local Save**: Save to local database immediately
3. **Queue Addition**: Add to local processing queue
4. **UI Feedback**: Show discovery in timeline with pending status
5. **Background Processing**: Process queue when online
6. **Sync**: Sync with remote database
7. **UI Update**: Update timeline with processed data

### Offline Handling Algorithm
1. **Network Check**: Monitor network connectivity
2. **Local Storage**: Store discoveries locally when offline
3. **Queue Management**: Maintain local queue for processing
4. **Sync Detection**: Detect when connection is restored
5. **Batch Sync**: Sync all pending items when online
6. **Conflict Resolution**: Handle any data conflicts
7. **Queue Processing**: Process queued items

### Retry Logic Algorithm
1. **Error Detection**: Detect processing failures
2. **Retry Decision**: Determine if retry is appropriate
3. **Backoff Calculation**: Calculate retry delay (exponential backoff)
4. **Retry Execution**: Retry processing after delay
5. **Max Retries**: Stop after maximum retry attempts
6. **Error Reporting**: Report final failure to user
7. **Manual Retry**: Allow user to manually retry

### Conflict Resolution Algorithm
1. **Conflict Detection**: Compare local and remote data
2. **Conflict Classification**: Categorize conflict type
3. **Auto Resolution**: Attempt automatic resolution
4. **Manual Resolution**: Prompt user for manual resolution
5. **Data Merging**: Merge conflicting data appropriately
6. **Validation**: Validate resolved data
7. **Sync Update**: Update both local and remote data

## Migration Strategy

### Step 1: Enable Queue Mode
```typescript
// config/processing.ts
export const PROCESSING_CONFIG = {
  mode: 'queue', // Switch from 'immediate' to 'queue'
  // ... rest of configuration
};
```

### Step 2: Update Discovery Service
```typescript
// services/discoveryService.ts
async createDiscovery(data: DiscoveryInput): Promise<Discovery> {
  if (PROCESSING_CONFIG.mode === 'queue') {
    return this.createDiscoveryWithQueue(data);
  } else {
    return this.createDiscoveryImmediate(data);
  }
}
```

### Step 3: Deploy Database Changes
```sql
-- Run migration scripts
-- 002A_create_processing_queue.sql
-- 002A_enhance_discoveries_queue.sql
```

### Step 4: Update UI Components
```typescript
// Add queue status indicators to existing components
// Update discovery cards to show queue status
// Add sync status components
```

## Files to Create/Modify

### New Files
- `services/localQueueService.ts`
- `services/networkService.ts`
- `services/queueProcessorService.ts`
- `services/syncService.ts`
- `services/conflictResolutionService.ts`
- `components/queue/QueueStatus.tsx`
- `components/sync/SyncStatus.tsx`
- `stores/queueStore.ts`

### Modified Files
- `services/discoveryService.ts` - Add queue support
- `services/llmService.ts` - Add queue processing
- `stores/discoveryStore.ts` - Add queue state
- `components/discovery/DiscoveryCard.tsx` - Add queue status
- `app/(tabs)/create.tsx` - Add offline handling
- `app/(tabs)/index.tsx` - Add sync status
- `types/discovery.ts` - Add queue types
- `config/processing.ts` - Enable queue mode

### Dependencies to Add
```json
{
  "expo-network": "latest",
  "expo-sqlite": "latest",
  "@react-native-async-storage/async-storage": "latest"
}
```

## Success Criteria
- [ ] Discoveries are saved immediately (online/offline)
- [ ] Queue processes items in background when online
- [ ] Failed processing can be retried automatically
- [ ] Data syncs correctly when connection is restored
- [ ] Conflicts are resolved automatically or manually
- [ ] Queue status is visible to users
- [ ] Processing doesn't block user interaction
- [ ] System handles network interruptions gracefully
- [ ] Queue performance scales with large datasets
- [ ] Data integrity is maintained across sync cycles
- [ ] Migration from immediate to queue mode is seamless
- [ ] Offline functionality works reliably 