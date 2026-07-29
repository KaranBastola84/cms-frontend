import React, { useState, useEffect } from "react";
import productReviewService from "../../services/productReviewService";
import toast from "react-hot-toast";
import { Star } from "lucide-react";

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
    <div className="space-y-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Review Form */}
        <div className="bg-[var(--bg-surface)] p-8 rounded-2xl border border-[var(--border-subtle)] shadow-lg h-fit">
          <h3 className="text-xl font-heading font-bold text-[var(--text-primary)] mb-2 uppercase tracking-widest">
            Share Your Experience
          </h3>
          <p className="text-[var(--text-secondary)] text-sm mb-8 tracking-wide">
            Your feedback helps us maintain our standards of excellence.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-[0.2em] ml-2">Guest Name</label>
              <input
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Ex: John Smith"
                required
                className="w-full px-4 py-3 bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-xl focus:border-[var(--brand-primary)] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-[0.2em] ml-2">Email Address</label>
              <input
                type="email"
                name="customerEmail"
                value={form.customerEmail}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                className="w-full px-4 py-3 bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-xl focus:border-[var(--brand-primary)] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-[0.2em] ml-2">Product Rating</label>
              <select
                name="rating"
                value={form.rating}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-xl focus:border-[var(--brand-primary)] focus:outline-none transition-colors appearance-none"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r} className="bg-[var(--bg-page)] text-[var(--text-primary)]">
                    {r} {r === 5 ? "Exceptional" : r === 4 ? "Excellent" : r === 3 ? "Satisfactory" : r === 2 ? "Fair" : "Poor"} ({r} Star{r > 1 ? "s" : ""})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-[0.2em] ml-2">Your Testimonial</label>
              <textarea
                name="reviewText"
                value={form.reviewText}
                onChange={handleChange}
                placeholder="Describe your journey with this selection..."
                required
                rows={4}
                className="w-full px-4 py-3 bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-xl focus:border-[var(--brand-primary)] focus:outline-none transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-4 text-xs font-bold tracking-[0.3em] uppercase transform active:scale-95 mt-4 shadow-md"
            >
              Submit Testimonial
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="flex flex-col">
          <h3 className="text-xl font-heading font-bold text-[var(--text-primary)] mb-8 uppercase tracking-widest flex items-center gap-3">
            <Star className="w-5 h-5 text-[var(--brand-primary)] fill-current" />
            Verified Experiences
          </h3>
          
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
              </div>
            ) : reviews.filter(r => r.isApproved).length === 0 ? (
              <div className="text-center py-20 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] border-dashed">
                <p className="text-[var(--text-secondary)] font-bold tracking-widest uppercase text-xs">No reviews have been published yet.</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                {reviews
                  .filter((r) => r.isApproved)
                  .map((review) => (
                    <div key={review.id} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 hover:border-[var(--brand-primary)] transition-all group shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center text-white font-bold text-xs uppercase shadow-inner">
                            {review.customerName.charAt(0)}
                          </div>
                          <div>
                            <span className="block font-bold text-[var(--text-primary)] text-sm tracking-wide">{review.customerName}</span>
                            <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">Verified Collector</span>
                          </div>
                        </div>
                        <div className="flex text-[var(--brand-primary)]">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[var(--text-secondary)] text-sm leading-relaxed border-l-2 border-[var(--brand-primary)] pl-4">
                        "{review.reviewText}"
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReview;
