/**
 * OrderPhotoRepository.ts
 * Source: DAD_Global_Data_Layer.md §4 (LocalOrderPhoto) + §6 Data Flow (photo upload/delete)
 */


import { db } from '../AppDB'
import { BaseRepository } from './BaseRepository'
import type { LocalOrderPhoto } from '../../types/db.entities'

export class OrderPhotoRepository extends BaseRepository<LocalOrderPhoto> {
  protected getTable(): any {
    return db.order_photos
  }

  /** Get all photos for a specific order, sorted by uploaded date */
  async getByOrderId(orderId: string): Promise<LocalOrderPhoto[]> {
    return db.order_photos
      .where('orderId')
      .equals(orderId)
      .sortBy('uploadedAt')
  }

  /** Replace temp local photo id with server-assigned id after successful upload */
  async replaceTempId(tempId: string, serverId: string, serverUrl: string): Promise<void> {
    const photo = await db.order_photos.get(tempId)
    if (photo) {
      await db.order_photos.delete(tempId)
      await db.order_photos.put({
        ...photo,
        id: serverId,
        url: serverUrl,
        isSynced: true,
      })
    }
  }
}

export const orderPhotoRepository = new OrderPhotoRepository()
