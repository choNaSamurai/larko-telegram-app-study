/**
 * TaskRepository.ts
 * Source: DAD_Global_Data_Layer.md §4 (LocalTask) + §8 (CACHE_TTL.TASKS_LIST)
 */


import { db } from '../AppDB'
import { CachingRepository } from './BaseRepository'
import { CACHE_TTL } from '../../constants/cache'
import type { LocalTask } from '../../types/db.entities'
import type { TaskStatus } from '../../types/task.types'

export class TaskRepository extends CachingRepository<LocalTask> {
  protected cacheKey = 'tasks_list' as const
  protected ttl = CACHE_TTL.TASKS_LIST

  protected getTable(): any {
    return db.tasks
  }

  /** Filter tasks by status */
  async getByStatus(status: TaskStatus): Promise<LocalTask[]> {
    return db.tasks.where('status').equals(status).toArray()
  }

  /** Get all unsorted tasks ordered by deadline */
  async getAllByDeadline(): Promise<LocalTask[]> {
    return db.tasks.orderBy('updatedAt').reverse().toArray()
  }
}

export const taskRepository = new TaskRepository()
