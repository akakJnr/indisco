import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Table,
  Text,
  toast,
  Toaster,
  usePrompt,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

type Status = "pending" | "approved" | "rejected"

type AdminReview = {
  id: string
  product_id: string
  author_name: string
  rating: number
  title: string | null
  content: string
  status: Status
  created_at: string
  product: { title: string; handle: string } | null
}

type ReviewsResponse = { reviews: AdminReview[]; count: number }

const PAGE_SIZE = 15
const FILTERS: { label: string; value: Status | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Approved", value: "approved" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
]

const STATUS_COLOR: Record<Status, "green" | "orange" | "red"> = {
  approved: "green",
  pending: "orange",
  rejected: "red",
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message ?? `Request failed (${response.status})`)
  }
  return response.json() as Promise<T>
}

const stars = (rating: number) =>
  "★".repeat(rating) + "☆".repeat(5 - rating)

const ReviewsPage = () => {
  const [filter, setFilter] = useState<Status | "all">("all")
  const [page, setPage] = useState(0)
  const queryClient = useQueryClient()
  const prompt = usePrompt()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-reviews", filter, page],
    queryFn: () =>
      request<ReviewsResponse>(
        `/admin/reviews?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}${
          filter === "all" ? "" : `&status=${filter}`
        }`
      ),
  })

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-reviews"] })

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) =>
      request(`/admin/reviews/${id}`, {
        method: "POST",
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_result, { status }) => {
      toast.success(
        status === "approved" ? "Review is now visible" : "Review hidden"
      )
      refresh()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const remove = useMutation({
    mutationFn: (id: string) =>
      request(`/admin/reviews/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Review deleted")
      refresh()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const confirmDelete = async (review: AdminReview) => {
    const confirmed = await prompt({
      title: "Delete this review?",
      description: `The review by ${review.author_name} will be removed from the store. This cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    })
    if (confirmed) {
      remove.mutate(review.id)
    }
  }

  const reviews = data?.reviews ?? []
  const count = data?.count ?? 0
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <Container className="divide-y p-0">
      <Toaster />
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Product reviews</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Customer reviews are published immediately. Hide or delete any that
            should not be shown.
          </Text>
        </div>
        <div className="flex gap-x-2">
          {FILTERS.map((item) => (
            <Button
              key={item.value}
              size="small"
              variant={filter === item.value ? "primary" : "secondary"}
              onClick={() => {
                setFilter(item.value)
                setPage(0)
              }}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {isError ? (
        <div className="px-6 py-8">
          <Text className="text-ui-fg-error">Could not load reviews.</Text>
        </div>
      ) : isLoading ? (
        <div className="px-6 py-8">
          <Text className="text-ui-fg-subtle">Loading reviews...</Text>
        </div>
      ) : reviews.length === 0 ? (
        <div className="px-6 py-8">
          <Text className="text-ui-fg-subtle">No reviews found.</Text>
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Rating</Table.HeaderCell>
              <Table.HeaderCell>Review</Table.HeaderCell>
              <Table.HeaderCell>Product</Table.HeaderCell>
              <Table.HeaderCell>Author</Table.HeaderCell>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {reviews.map((review) => (
              <Table.Row key={review.id}>
                <Table.Cell>
                  <span className="whitespace-nowrap text-ui-tag-orange-icon">
                    {stars(review.rating)}
                  </span>
                </Table.Cell>
                <Table.Cell className="max-w-[320px]">
                  {review.title && (
                    <Text size="small" weight="plus" className="truncate">
                      {review.title}
                    </Text>
                  )}
                  <Text size="small" className="line-clamp-2 text-ui-fg-subtle">
                    {review.content}
                  </Text>
                </Table.Cell>
                <Table.Cell>{review.product?.title ?? "Deleted product"}</Table.Cell>
                <Table.Cell>{review.author_name}</Table.Cell>
                <Table.Cell className="whitespace-nowrap">
                  {new Date(review.created_at).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>
                  <Badge size="2xsmall" color={STATUS_COLOR[review.status]}>
                    {review.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex justify-end gap-x-2">
                    {review.status !== "approved" && (
                      <Button
                        size="small"
                        variant="secondary"
                        isLoading={setStatus.isPending}
                        onClick={() =>
                          setStatus.mutate({ id: review.id, status: "approved" })
                        }
                      >
                        Show
                      </Button>
                    )}
                    {review.status !== "rejected" && (
                      <Button
                        size="small"
                        variant="secondary"
                        isLoading={setStatus.isPending}
                        onClick={() =>
                          setStatus.mutate({ id: review.id, status: "rejected" })
                        }
                      >
                        Hide
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => confirmDelete(review)}
                    >
                      Delete
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {count > PAGE_SIZE && (
        <div className="flex items-center justify-between px-6 py-3">
          <Text size="small" className="text-ui-fg-subtle">
            Page {page + 1} of {pageCount} ({count} reviews)
          </Text>
          <div className="flex gap-x-2">
            <Button
              size="small"
              variant="secondary"
              disabled={page === 0}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </Button>
            <Button
              size="small"
              variant="secondary"
              disabled={page + 1 >= pageCount}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Reviews",
  icon: ChatBubbleLeftRight,
})

export default ReviewsPage
