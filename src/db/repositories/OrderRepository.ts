/**
 * OrderRepository.ts
 * Source: DAD_Global_Data_Layer.md §4 (LocalOrder) + §8 (CACHE_TTL.ORDER_DETAIL)
 */


import { db } from '../AppDB'
import { CachingRepository } from './BaseRepository'
import { CACHE_TTL } from '../../constants/cache'
import type { LocalOrder } from '../../types/db.entities'

export class OrderRepository extends CachingRepository<LocalOrder> {
  // cacheKey is per-order; dynamic — override isCacheFresh/markFetched with orderId
  protected cacheKey = '' // Set dynamically via withOrderId()
  protected ttl = CACHE_TTL.ORDER_DETAIL

  protected getTable(): any {
    return db.orders
  }

  /** Returns a new instance scoped to a specific orderId for cache operations */
  forOrder(orderId: string): OrderRepository {
    const repo = new OrderRepository()
    repo.cacheKey = `order_detail_${orderId}`
    return repo
  }

  /** Update status only — used by optimistic status transition */
  async updateStatus(id: string, status: LocalOrder['status']): Promise<void> {
    await db.orders.update(id, {
      status,
      isSynced: false,
      updatedAt: Date.now(),
      _localVersion: (await db.orders.get(id))?._localVersion ?? 0 + 1,
    })
  }

  /** Increment photosAddedToday count */
  async incrementPhotosToday(orderId: string): Promise<void> {
    const order = await db.orders.get(orderId)
    if (order) {
      await db.orders.update(orderId, {
        photosAddedToday: order.photosAddedToday + 1,
      })
    }
  }

  /** Decrement photosAddedToday count */
  async decrementPhotosToday(orderId: string): Promise<void> {
    const order = await db.orders.get(orderId)
    if (order && order.photosAddedToday > 0) {
      await db.orders.update(orderId, {
        photosAddedToday: order.photosAddedToday - 1,
      })
    }
  }
}

export const orderRepository = new OrderRepository()
