import mongoose from 'mongoose';

// to invalidate cache we need following props
export type InvalidateCacheType = {
 product?: boolean,
 order?: boolean,
 admin?: boolean,
 userId?: mongoose.Types.ObjectId,
 orderId?: string,
 productId?: string | string[]
}
