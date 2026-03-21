import React, { useState, useEffect } from "react";
import productReviewService from "../../services/productReviewService";
import toast from "react-hot-toast";

const ProductReview = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    rating: 5,
    reviewText: "",
  });

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await productReviewService.getReviewsByProduct(productId);
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await productReviewService.submitReview({
        ...form,
        productId,
      });
      toast.success("Review submitted for moderation");
      setForm({
        customerName: "",
        customerEmail: "",
        rating: 5,
        reviewText: "",
      });
      fetchReviews();
    } catch (error) {
      toast.error(error.message || "Failed to submit review");
    }
  };

  return (
    <div className="my-8">
      <h3 className="text-lg font-bold mb-4">Product Reviews</h3>
      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <input
          type="text"
          name="customerName"
          value={form.customerName}
          onChange={handleChange}
          placeholder="Your Name"
          required
          className="w-full border rounded p-2"
        />
        <input
          type="email"
          name="customerEmail"
          value={form.customerEmail}
          onChange={handleChange}
          placeholder="Your Email"
          required
          className="w-full border rounded p-2"
        />
        <select
          name="rating"
          value={form.rating}
          onChange={handleChange}
          className="w-full border rounded p-2"
        >
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>
              {r} Star{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>
        <textarea
          name="reviewText"
          value={form.reviewText}
          onChange={handleChange}
          placeholder="Your Review"
          required
          className="w-full border rounded p-2"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#4A2F19] text-white rounded"
        >
          Submit Review
        </button>
      </form>
      <div>
        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <ul className="space-y-4">
            {reviews
              .filter((r) => r.isApproved)
              .map((review) => (
                <li key={review.id} className="border rounded p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{review.customerName}</span>
                    <span className="text-yellow-500">
                      {"★".repeat(review.rating)}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-1">{review.reviewText}</p>
                  <p className="text-xs text-gray-500">
                    {review.customerEmail}
                  </p>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProductReview;
