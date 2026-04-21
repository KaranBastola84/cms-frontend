import React, { useState, useEffect } from "react";
import productReviewService from "../../../services/productReviewService";
import toast from "react-hot-toast";
import { Star } from "lucide-react";

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
    } catch {
      toast.error("Failed to load pending reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await productReviewService.approveReview(id);
      toast.success("Review approved");
      fetchPendingReviews();
    } catch {
      toast.error("Failed to approve review");
    }
  };

  const handleReject = async (id) => {
    try {
      await productReviewService.rejectReview(id);
      toast.success("Review rejected");
      fetchPendingReviews();
    } catch {
      toast.error("Failed to reject review");
    }
  };

  const handleDelete = async (id) => {
    try {
      await productReviewService.deleteReview(id);
      toast.success("Review deleted");
      fetchPendingReviews();
    } catch {
      toast.error("Failed to delete review");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-12">
        <h2 className="text-3xl font-heading text-white uppercase tracking-widest mb-2">
          Review Moderation
        </h2>
        <p className="text-[#A0A0A0] text-sm font-light tracking-wide italic">
          Curate the experiences shared by our global guests.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C6A36A]"></div>
        </div>
      ) : pendingReviews.length === 0 ? (
        <div className="text-center py-20 bg-[#1A1A1A] rounded-2xl border border-[#ffffff05] border-dashed">
          <p className="text-[#A0A0A0] font-light tracking-widest uppercase text-xs">No pending reviews require attention.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingReviews.map((review) => (
            <div key={review.id} className="bg-[#1A1A1A] border border-[#ffffff05] rounded-2xl p-6 md:p-8 shadow-xl hover:border-[#C6A36A]/20 transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#333333] border border-[#ffffff10] flex items-center justify-center text-white font-bold uppercase">
                      {review.customerName.charAt(0)}
                    </div>
                    <div>
                      <span className="block font-bold text-white text-lg tracking-wide">{review.customerName}</span>
                      <span className="text-[10px] text-[#C6A36A] uppercase tracking-widest font-bold">{review.customerEmail}</span>
                    </div>
                    <div className="flex text-[#C6A36A] ml-auto md:ml-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[#E0E0E0] text-sm leading-relaxed font-light italic pl-6 border-l-2 border-[#C6A36A]/30 mb-2">
                    "{review.reviewText}"
                  </p>
                </div>
                
                <div className="flex md:flex-col gap-3 shrink-0">
                  <button
                    onClick={() => handleApprove(review.id)}
                    className="flex-1 md:w-32 py-2.5 bg-[#C6A36A] text-[#0F0F0F] text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-[#D4B785] transition-all"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(review.id)}
                    className="flex-1 md:w-32 py-2.5 bg-transparent border border-[#C62828]/50 text-[#C62828] text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-[#C62828]/10 transition-all"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="flex-1 md:w-32 py-2.5 bg-transparent border border-[#ffffff10] text-[#A0A0A0] text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-[#ffffff05] transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviewModeration;
