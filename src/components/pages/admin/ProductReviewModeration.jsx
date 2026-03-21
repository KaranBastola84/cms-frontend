import React, { useState, useEffect } from "react";
import productReviewService from "../../../services/productReviewService";
import toast from "react-hot-toast";

const ProductReviewModeration = () => {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    setLoading(true);
    try {
      const data = await productReviewService.getPendingReviews();
      setPendingReviews(data || []);
    } catch (error) {
      toast.error(error.message || "Failed to load pending reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await productReviewService.approveReview(id);
      toast.success("Review approved");
      fetchPendingReviews();
    } catch (error) {
      toast.error(error.message || "Failed to approve review");
    }
  };

  const handleReject = async (id) => {
    try {
      await productReviewService.rejectReview(id);
      toast.success("Review rejected");
      fetchPendingReviews();
    } catch (error) {
      toast.error(error.message || "Failed to reject review");
    }
  };

  const handleDelete = async (id) => {
    try {
      await productReviewService.deleteReview(id);
      toast.success("Review deleted");
      fetchPendingReviews();
    } catch (error) {
      toast.error(error.message || "Failed to delete review");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Pending Product Reviews</h2>
      {loading ? (
        <p>Loading...</p>
      ) : pendingReviews.length === 0 ? (
        <p>No pending reviews.</p>
      ) : (
        <ul className="space-y-6">
          {pendingReviews.map((review) => (
            <li key={review.id} className="border rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{review.customerName}</span>
                <span className="text-yellow-500">
                  {"★".repeat(review.rating)}
                </span>
              </div>
              <p className="text-gray-700 mb-1">{review.reviewText}</p>
              <p className="text-xs text-gray-500">{review.customerEmail}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleApprove(review.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(review.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductReviewModeration;
