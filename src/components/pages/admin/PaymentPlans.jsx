import React, { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Loader2,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Eye,
  Edit,
} from "lucide-react";
import {
  createPaymentPlan,
  getPaymentPlanById,
  payInstallment,
  getStudentPaymentPlans,
  getCoursePaymentPlans,
  updatePaymentPlanStatus,
  getOverdueInstallments,
  getUpcomingInstallments,
} from "../../../services/paymentPlanService";
import toast from "react-hot-toast";

function PaymentPlans() {
  const [loading, setLoading] = useState(true);
  const [paymentPlans, setPaymentPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [filterByStudent, setFilterByStudent] = useState("");
  const [filterByCourse, setFilterByCourse] = useState("");
  const [overdueInstallments, setOverdueInstallments] = useState([]);
  const [upcomingInstallments, setUpcomingInstallments] = useState([]);

  const [newPlan, setNewPlan] = useState({
    studentId: "",
    courseId: "",
    totalAmount: "",
    numberOfInstallments: "",
    firstInstallmentDate: "",
    installmentFrequency: "Monthly",
    description: "",
  });

  useEffect(() => {
    // Initial load - fetch overdue and upcoming installments for alerts
    fetchOverdueInstallments();
    fetchUpcomingInstallments();
    setLoading(false);
  }, []);

  const filterPlans = useCallback(() => {
    let filtered = paymentPlans;

    if (searchTerm) {
      filtered = filtered.filter(
        (plan) =>
          plan.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.courseName?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((plan) => plan.status === statusFilter);
    }

    setFilteredPlans(filtered);
  }, [searchTerm, statusFilter, paymentPlans]);

  useEffect(() => {
    filterPlans();
  }, [filterPlans]);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      await createPaymentPlan(newPlan);
      toast.success("Payment plan created successfully");
      setShowCreateModal(false);
      setNewPlan({
        studentId: "",
        courseId: "",
        totalAmount: "",
        numberOfInstallments: "",
        firstInstallmentDate: "",
        installmentFrequency: "Monthly",
        description: "",
      });
      // Clear filters after creation
      setPaymentPlans([]);
      setFilteredPlans([]);
      toast.success("Payment plan created. Use filters to view plans.");
    } catch (error) {
      toast.error("Failed to create payment plan");
      console.error("Error creating payment plan:", error);
    }
  };

  const viewPlanDetails = async (planId) => {
    try {
      const details = await getPaymentPlanById(planId);
      setSelectedPlan(details);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error("Failed to load plan details");
      console.error("Error fetching plan details:", error);
    }
  };

  const handlePayInstallment = async (e) => {
    e.preventDefault();
    try {
      const paymentData = {
        amount: selectedInstallment.amount,
        paymentMethod: "Stripe",
        transactionId: "TXN-" + Date.now(),
        paymentDate: new Date().toISOString(),
        notes: "Manual payment",
      };

      await payInstallment(selectedInstallment.installmentId, paymentData);
      toast.success("Installment marked as paid");
      setShowPayModal(false);
      setSelectedInstallment(null);
      // Refresh plan details
      if (selectedPlan) {
        viewPlanDetails(selectedPlan.paymentPlanId);
      }
    } catch (error) {
      toast.error("Failed to process payment");
      console.error("Error paying installment:", error);
    }
  };

  const filterPlansByStudent = async () => {
    if (!filterByStudent) {
      toast.error("Please enter a student ID");
      return;
    }
    setLoading(true);
    try {
      const plans = await getStudentPaymentPlans(parseInt(filterByStudent));
      setPaymentPlans(plans || []);
      setFilteredPlans(plans || []);
      toast.success(`Showing plans for student ID ${filterByStudent}`);
    } catch (error) {
      toast.error("Failed to fetch student plans");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterPlansByCourse = async () => {
    if (!filterByCourse) {
      toast.error("Please enter a course ID");
      return;
    }
    setLoading(true);
    try {
      const plans = await getCoursePaymentPlans(parseInt(filterByCourse));
      setPaymentPlans(plans || []);
      setFilteredPlans(plans || []);
      toast.success(`Showing plans for course ID ${filterByCourse}`);
    } catch (error) {
      toast.error("Failed to fetch course plans");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (planId, newStatus) => {
    try {
      await updatePaymentPlanStatus(
        selectedPlan.paymentPlanId,
        selectedPlan.status,
      );
      toast.success("Payment plan status updated");
      setShowStatusModal(false);
      setSelectedPlan(null);
      // Refresh the current filter if active
      if (filterByStudent) {
        filterPlansByStudent();
      } else if (filterByCourse) {
        filterPlansByCourse();
      }
      setSelectedPlan(null);
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const fetchOverdueInstallments = async () => {
    try {
      const overdue = await getOverdueInstallments();
      setOverdueInstallments(overdue || []);
    } catch (error) {
      console.error("Failed to fetch overdue installments:", error);
    }
  };

  const fetchUpcomingInstallments = async () => {
    try {
      const upcoming = await getUpcomingInstallments(7);
      setUpcomingInstallments(upcoming || []);
    } catch (error) {
      console.error("Failed to fetch upcoming installments:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#4A2F19] animate-spin mx-auto mb-2" />
          <p className="text-[#6B4423] text-sm">Loading payment plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#3D2817]">Payment Plans</h1>
          <p className="text-[#8B6F47] mt-1">
            Manage student payment installment plans
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
          <p className="text-sm text-[#8B6F47] mb-1">Total Plans</p>
          <h3 className="text-2xl font-bold text-[#3D2817]">
            {paymentPlans.length}
          </h3>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
          <p className="text-sm text-[#8B6F47] mb-1">Active Plans</p>
          <h3 className="text-2xl font-bold text-green-600">
            {paymentPlans.filter((p) => p.status === "Active").length}
          </h3>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
          <p className="text-sm text-[#8B6F47] mb-1">Completed</p>
          <h3 className="text-2xl font-bold text-blue-600">
            {paymentPlans.filter((p) => p.status === "Completed").length}
          </h3>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
          <p className="text-sm text-[#8B6F47] mb-1">On Hold</p>
          <h3 className="text-2xl font-bold text-orange-600">
            {paymentPlans.filter((p) => p.status === "OnHold").length}
          </h3>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B6F47] w-5 h-5" />
            <input
              type="text"
              placeholder="Search by student or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="OnHold">On Hold</option>
          </select>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Student ID"
              value={filterByStudent}
              onChange={(e) => setFilterByStudent(e.target.value)}
              className="flex-1 px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
            />
            <button
              onClick={filterPlansByStudent}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Course ID"
              value={filterByCourse}
              onChange={(e) => setFilterByCourse(e.target.value)}
              className="flex-1 px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
            />
            <button
              onClick={filterPlansByCourse}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {(filterByStudent || filterByCourse || paymentPlans.length > 0) && (
            <button
              onClick={() => {
                setFilterByStudent("");
                setFilterByCourse("");
                setPaymentPlans([]);
                setFilteredPlans([]);
                setStatusFilter("all");
                setSearchTerm("");
                toast.success("Filters cleared");
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Overdue & Upcoming Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {overdueInstallments.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-800">
                  Overdue Installments
                </h3>
              </div>
              <p className="text-sm text-red-700">
                {overdueInstallments.length} installment(s) are overdue
              </p>
            </div>
          )}

          {upcomingInstallments.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-800">
                  Upcoming Installments
                </h3>
              </div>
              <p className="text-sm text-orange-700">
                {upcomingInstallments.length} installment(s) due in next 7 days
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPlans.map((plan) => (
          <div
            key={plan.paymentPlanId}
            className="bg-white rounded-lg shadow-md border border-[#E8DCC8] p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#3D2817]">
                  {plan.studentName}
                </h3>
                <p className="text-sm text-[#8B6F47]">{plan.courseName}</p>
              </div>
              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  plan.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : plan.status === "Completed"
                      ? "bg-blue-100 text-blue-800"
                      : plan.status === "OnHold"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-red-100 text-red-800"
                }`}
              >
                {plan.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#8B6F47]">Total Amount</span>
                <span className="text-sm font-bold text-[#3D2817]">
                  ${plan.totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[#8B6F47]">Paid Amount</span>
                <span className="text-sm font-bold text-green-600">
                  ${plan.paidAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[#8B6F47]">Balance</span>
                <span className="text-sm font-bold text-orange-600">
                  ${plan.balanceAmount.toLocaleString()}
                </span>
              </div>

              <div className="pt-3 border-t border-[#E8DCC8]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-[#8B6F47]">Installments</span>
                  <span className="text-xs font-medium text-[#3D2817]">
                    {plan.paidInstallments} / {plan.numberOfInstallments}
                  </span>
                </div>
                <div className="w-full bg-[#F5E6D3] rounded-full h-2">
                  <div
                    className="bg-[#4A2F19] h-2 rounded-full transition-all"
                    style={{
                      width: `${(plan.paidInstallments / plan.numberOfInstallments) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => viewPlanDetails(plan.paymentPlanId)}
                  className="flex-1 px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] transition-colors flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setShowStatusModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center border border-[#E8DCC8]">
          <CreditCard className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
          <p className="text-[#3D2817] font-semibold mb-2">
            No Payment Plans Loaded
          </p>
          <p className="text-[#8B6F47] text-sm">
            Use the Student ID or Course ID filters above to view payment plans
          </p>
        </div>
      )}

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#E8DCC8]">
              <h2 className="text-2xl font-bold text-[#3D2817]">
                Create Payment Plan
              </h2>
            </div>
            <form onSubmit={handleCreatePlan} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3D2817] mb-1">
                    Student ID
                  </label>
                  <input
                    type="number"
                    required
                    value={newPlan.studentId}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, studentId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3D2817] mb-1">
                    Course ID
                  </label>
                  <input
                    type="number"
                    required
                    value={newPlan.courseId}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, courseId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3D2817] mb-1">
                    Total Amount ($)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={newPlan.totalAmount}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, totalAmount: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3D2817] mb-1">
                    Number of Installments
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPlan.numberOfInstallments}
                    onChange={(e) =>
                      setNewPlan({
                        ...newPlan,
                        numberOfInstallments: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3D2817] mb-1">
                    First Installment Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newPlan.firstInstallmentDate}
                    onChange={(e) =>
                      setNewPlan({
                        ...newPlan,
                        firstInstallmentDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3D2817] mb-1">
                    Frequency
                  </label>
                  <select
                    value={newPlan.installmentFrequency}
                    onChange={(e) =>
                      setNewPlan({
                        ...newPlan,
                        installmentFrequency: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2817] mb-1">
                  Description
                </label>
                <textarea
                  value={newPlan.description}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, description: e.target.value })
                  }
                  rows="3"
                  className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] transition-colors"
                >
                  Create Plan
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan Details Modal */}
      {showDetailsModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#E8DCC8]">
              <h2 className="text-2xl font-bold text-[#3D2817]">
                Payment Plan Details
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Plan Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#8B6F47]">Student</p>
                  <p className="text-lg font-medium text-[#3D2817]">
                    {selectedPlan.studentName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#8B6F47]">Course</p>
                  <p className="text-lg font-medium text-[#3D2817]">
                    {selectedPlan.courseName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#8B6F47]">Total Amount</p>
                  <p className="text-lg font-medium text-[#3D2817]">
                    ${selectedPlan.totalAmount?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#8B6F47]">Status</p>
                  <span
                    className={`px-3 py-1 text-xs rounded-full inline-block ${
                      selectedPlan.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {selectedPlan.status}
                  </span>
                </div>
              </div>

              {/* Installments */}
              <div>
                <h3 className="text-lg font-bold text-[#3D2817] mb-4">
                  Installments
                </h3>
                <div className="space-y-3">
                  {selectedPlan.installments?.map((installment) => (
                    <div
                      key={installment.installmentId}
                      className="flex items-center justify-between p-4 bg-[#FFF8F0] rounded-lg border border-[#E8DCC8]"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-full ${
                            installment.status === "Paid"
                              ? "bg-green-100 text-green-600"
                              : installment.status === "Overdue"
                                ? "bg-red-100 text-red-600"
                                : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {installment.status === "Paid" ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : installment.status === "Overdue" ? (
                            <XCircle className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[#3D2817]">
                            Installment #{installment.installmentNumber}
                          </p>
                          <p className="text-sm text-[#8B6F47]">
                            Due:{" "}
                            {new Date(installment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-[#3D2817]">
                          ${installment.amount}
                        </p>
                        {installment.status !== "Paid" && (
                          <button
                            onClick={() => {
                              setSelectedInstallment(installment);
                              setShowPayModal(true);
                            }}
                            className="px-3 py-1 bg-[#4A2F19] text-white rounded hover:bg-[#3D2817] transition-colors text-sm"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay Installment Modal */}
      {showPayModal && selectedInstallment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-[#E8DCC8]">
              <h2 className="text-2xl font-bold text-[#3D2817]">
                Mark Installment as Paid
              </h2>
            </div>
            <form onSubmit={handlePayInstallment} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-[#8B6F47]">Amount</p>
                <p className="text-2xl font-bold text-[#3D2817]">
                  ${selectedInstallment.amount}
                </p>
              </div>
              <p className="text-sm text-[#8B6F47]">
                Are you sure you want to mark this installment as paid?
              </p>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] transition-colors"
                >
                  Confirm Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPayModal(false);
                    setSelectedInstallment(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-[#E8DCC8]">
              <h2 className="text-2xl font-bold text-[#3D2817]">
                Update Payment Plan Status
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-[#8B6F47] mb-2">Student</p>
                <p className="text-lg font-medium text-[#3D2817]">
                  {selectedPlan.studentName}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#8B6F47] mb-2">Course</p>
                <p className="text-lg font-medium text-[#3D2817]">
                  {selectedPlan.courseName}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#8B6F47] mb-2">Current Status</p>
                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    selectedPlan.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : selectedPlan.status === "Completed"
                        ? "bg-blue-100 text-blue-800"
                        : selectedPlan.status === "OnHold"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedPlan.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3D2817] mb-2">
                  New Status
                </label>
                <select
                  value={selectedPlan.status}
                  onChange={(e) =>
                    setSelectedPlan({ ...selectedPlan, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="OnHold">On Hold</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleUpdateStatus}
                  className="flex-1 px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] transition-colors"
                >
                  Update Status
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedPlan(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentPlans;
