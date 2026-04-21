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
    } catch {
      toast.error("Failed to load reviews");
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
    } catch {
      toast.error("Failed to submit review");
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Review Form */}
        <div className="bg-[#0F0F0F] p-8 rounded-2xl border border-[#ffffff05] shadow-xl h-fit">
          <h3 className="text-xl font-heading font-bold text-white mb-2 uppercase tracking-widest">
            Share Your Experience
          </h3>
          <p className="text-[#A0A0A0] text-sm mb-8 font-light tracking-wide italic">
            Your feedback helps us maintain our standards of excellence.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#C6A36A] uppercase tracking-[0.2em] ml-2">Guest Name</label>
              <input
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Ex: John Smith"
                required
                className="luxury-input !rounded-xl !bg-[#1A1A1A] !border-[#ffffff10]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#C6A36A] uppercase tracking-[0.2em] ml-2">Email Address</label>
              <input
                type="email"
                name="customerEmail"
                value={form.customerEmail}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                className="luxury-input !rounded-xl !bg-[#1A1A1A] !border-[#ffffff10]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#C6A36A] uppercase tracking-[0.2em] ml-2">Product Rating</label>
              <select
                name="rating"
                value={form.rating}
                onChange={handleChange}
                className="luxury-input !rounded-xl !bg-[#1A1A1A] !border-[#ffffff10] appearance-none"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r} className="bg-[#1A1A1A]">
                    {r} {r === 5 ? "Exceptional" : r === 4 ? "Excellent" : r === 3 ? "Satisfactory" : r === 2 ? "Fair" : "Poor"} ({r} Star{r > 1 ? "s" : ""})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#C6A36A] uppercase tracking-[0.2em] ml-2">Your Testimonial</label>
              <textarea
                name="reviewText"
                value={form.reviewText}
                onChange={handleChange}
                placeholder="Describe your journey with this selection..."
                required
                rows={4}
                className="luxury-input !rounded-xl !bg-[#1A1A1A] !border-[#ffffff10] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-gold-primary py-4 text-xs font-black tracking-[0.3em] uppercase transform active:scale-95 mt-4"
            >
              Submit Testimonial
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="flex flex-col">
          <h3 className="text-xl font-heading font-bold text-white mb-8 uppercase tracking-widest flex items-center gap-3">
            <Star className="w-5 h-5 text-[#C6A36A] fill-current" />
            Verified Experiences
          </h3>
          
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C6A36A]"></div>
              </div>
            ) : reviews.filter(r => r.isApproved).length === 0 ? (
              <div className="text-center py-20 bg-[#0F0F0F]/50 rounded-2xl border border-[#ffffff05] border-dashed">
                <p className="text-[#A0A0A0] font-light tracking-widest uppercase text-xs">No reviews have been published yet.</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                {reviews
                  .filter((r) => r.isApproved)
                  .map((review) => (
                    <div key={review.id} className="bg-[#1A1A1A]/40 border border-[#ffffff05] rounded-2xl p-6 hover:border-[#C6A36A]/20 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#333333] border border-[#ffffff10] flex items-center justify-center text-white font-bold text-xs uppercase">
                            {review.customerName.charAt(0)}
                          </div>
                          <div>
                            <span className="block font-bold text-white text-sm tracking-wide">{review.customerName}</span>
                            <span className="text-[10px] text-[#A0A0A0] uppercase tracking-widest">Verified Collector</span>
                          </div>
                        </div>
                        <div className="flex text-[#C6A36A]">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[#E0E0E0] text-sm leading-relaxed font-light italic pl-4 border-l border-[#C6A36A]/20">
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
