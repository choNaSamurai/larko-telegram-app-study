/**
 * index.ts — Repository Layer exports
 * Source: DAD_Global_Data_Layer.md §9 Data Layer Architecture
 *
 * Import singletons from this file:
 *   import { taskRepository, orderRepository } from '../db/repositories'
 */

export { taskRepository, TaskRepository } from './TaskRepository'
export { orderRepository, OrderRepository } from './OrderRepository'
export { timeLogRepository, TimeLogRepository } from './TimeLogRepository'
export { orderPhotoRepository, OrderPhotoRepository } from './OrderPhotoRepository'
export { leaveRequestRepository, LeaveRequestRepository } from './LeaveRequestRepository'
export { leaveTypeRepository, LeaveTypeRepository } from './LeaveTypeRepository'
export { userProfileRepository, UserProfileRepository } from './UserProfileRepository'
export { cacheMetadataRepository, CacheMetadataRepository } from './CacheMetadataRepository'
export { syncQueueRepository, SyncQueueRepository } from './SyncQueueRepository'
export { BaseRepository, CachingRepository } from './BaseRepository'
