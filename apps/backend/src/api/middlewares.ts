import {
  authenticate,
  configureStoreSearch,
  defineMiddlewares,
  validateAndTransformBody,
} from '@medusajs/framework/http'
import { PostAdminReviewStatusSchema } from './admin/reviews/validators'
import { PostStoreReviewSchema } from './store/products/[id]/reviews/validators'

// The product index declares filterable `status` and `sales_channel_ids`, so
// the route narrows it to published products in the key's sales channels.
export default defineMiddlewares({
  routes: [
    {
      method: ['POST'],
      matcher: '/store/search',
      middlewares: [
        configureStoreSearch({
          allowed_indexes: {
            product: true,
          },
        }),
      ],
    },
    {
      // Reading reviews is public; a signed-in customer also learns whether
      // they have already reviewed the product.
      method: ['GET'],
      matcher: '/store/products/:id/reviews',
      middlewares: [
        authenticate('customer', ['session', 'bearer'], {
          allowUnauthenticated: true,
        }),
      ],
    },
    {
      method: ['POST'],
      matcher: '/store/products/:id/reviews',
      middlewares: [
        authenticate('customer', ['session', 'bearer']),
        validateAndTransformBody(PostStoreReviewSchema),
      ],
    },
    {
      method: ['POST'],
      matcher: '/admin/reviews/:id',
      middlewares: [validateAndTransformBody(PostAdminReviewStatusSchema)],
    },
  ],
})
