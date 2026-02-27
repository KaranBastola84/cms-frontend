import React, { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  BookOpen,
  CheckCircle,
  XCircle,
  Save,
  X,
  Eye,
  Info,
} from "lucide-react";
import {
  getAllFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getCourseTotalFee,
  getCourseFees,
} from "../../../services/feeStructureService";
import toast from "react-hot-toast";

function FeeManagement() {
  const [loading, setLoading] = useState(true);
  const [feeStructures, setFeeStructures] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCourseDetailsModal, setShowCourseDetailsModal] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loadingCourseDetails, setLoadingCourseDetails] = useState(false);

  const [newFee, setNewFee] = useState({
    courseId: "",
    feeType: "CourseFee",
    amount: "",
    description: "",
    isActive: true,
  });

  const filterFees = useCallback(() => {
    let filtered = feeStructures;

    if (searchTerm) {
      filtered = filtered.filter(
        (fee) =>
          fee.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fee.feeType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fee.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredFees(filtered);
  }, [searchTerm, feeStructures]);

  useEffect(() => {
    fetchFeeStructures();
  }, []);

  useEffect(() => {
    filterFees();
  }, [filterFees]);

  const fetchFeeStructures = async () => {
    setLoading(true);
    try {
      const data = await getAllFeeStructures();
      setFeeStructures(data || []);
      setFilteredFees(data || []);
    } catch (error) {
      toast.error("Failed to load fee structures");
      console.error("Error fetching fee structures:", error);
      setFeeStructures([]);
      setFilteredFees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFee = async (e) => {
    e.preventDefault();
    try {
      await createFeeStructure(newFee);
      toast.success("Fee structure created successfully");
      setShowCreateModal(false);
      setNewFee({
        courseId: "",
        feeType: "CourseFee",
        amount: "",
        description: "",
        isActive: true,
      });
      fetchFeeStructures();
    } catch (error) {
      toast.error("Failed to create fee structure");
      console.error("Error creating fee structure:", error);
    }
  };

  const handleUpdateFee = async (e) => {
    e.preventDefault();
    try {
      await updateFeeStructure(editingFee.feeStructureId, editingFee);
      toast.success("Fee structure updated successfully");
      setShowEditModal(false);
      setEditingFee(null);
      fetchFeeStructures();
    } catch (error) {
      toast.error("Failed to update fee structure");
      console.error("Error updating fee structure:", error);
    }
  };

  const handleDeleteFee = async (feeId) => {
    if (
      !window.confirm("Are you sure you want to delete this fee structure?")
    ) {
      return;
    }

    try {
      await deleteFeeStructure(feeId);
      toast.success("Fee structure deleted successfully");
      fetchFeeStructures();
    } catch (error) {
      toast.error("Failed to delete fee structure");
      console.error("Error deleting fee structure:", error);
    }
  };

  const openEditModal = (fee) => {
    setEditingFee({ ...fee });
    setShowEditModal(true);
  };

  const fetchCourseDetails = async (courseId) => {
    setLoadingCourseDetails(true);
    setShowCourseDetailsModal(true);
    try {
      const [totalFeeData, courseFees] = await Promise.all([
        getCourseTotalFee(courseId),
        getCourseFees(courseId),
      ]);
      setCourseDetails({ ...totalFeeData, fees: courseFees });
    } catch (error) {
      toast.error("Failed to load course details");
      console.error(error);
      setShowCourseDetailsModal(false);
    } finally {
      setLoadingCourseDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#4A2F19] animate-spin mx-auto mb-2" />
          <p className="text-[#6B4423] text-sm">Loading fee structures...</p>
        </div>
      </div>
    );
  }

  // Group fees by course
  const groupedFees = filteredFees.reduce((acc, fee) => {
    const courseName = fee.courseName || "Unknown Course";
    if (!acc[courseName]) {
      acc[courseName] = [];
    }
    acc[courseName].push(fee);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#3D2817]">Fee Management</h1>
          <p className="text-[#8B6F47] mt-1">
            Manage course fees and pricing structures
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Fee Structure
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8B6F47] mb-1">
                Total Fee Structures
              </p>
              <h3 className="text-2xl font-bold text-[#3D2817]">
                {feeStructures.length}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8B6F47] mb-1">Active Fees</p>
              <h3 className="text-2xl font-bold text-green-600">
                {feeStructures.filter((f) => f.isActive).length}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8B6F47] mb-1">Courses</p>
              <h3 className="text-2xl font-bold text-[#3D2817]">
                {Object.keys(groupedFees).length}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-[#E8DCC8]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B6F47] w-5 h-5" />
          <input
            type="text"
            placeholder="Search by course, fee type, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
          />
        </div>
      </div>

      {/* Fee Structures by Course */}
      <div className="space-y-6">
        {Object.keys(groupedFees).map((courseName) => (
          <div
            key={courseName}
            className="bg-white rounded-lg shadow-md border border-[#E8DCC8] overflow-hidden"
          >
            <div className="bg-[#FFF8F0] px-6 py-4 border-b border-[#E8DCC8]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 text-[#4A2F19] mr-2" />
                  <h2 className="text-xl font-bold text-[#3D2817]">
                    {courseName}
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-lg font-bold text-[#4A2F19]">
                    Total: $
                    {groupedFees[courseName]
                      .filter((f) => f.isActive)
                      .reduce((sum, f) => sum + f.amount, 0)
                      .toLocaleString()}
                  </div>
                  <button
                    onClick={() =>
                      fetchCourseDetails(groupedFees[courseName][0].courseId)
                    }
                    className="flex items-center gap-2 px-3 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] transition-colors text-sm"
                  >
                    <Info className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedFees[courseName].map((fee) => (
                  <div
                    key={fee.feeStructureId}
                    className={`border-2 rounded-lg p-4 ${
                      fee.isActive
                        ? "border-[#4A2F19] bg-white"
                        : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-[#3D2817]">
                          {fee.feeType}
                        </p>
                        <p className="text-xs text-[#8B6F47] mt-1">
                          {fee.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(fee)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFee(fee.feeStructureId)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-[#E8DCC8]">
                      <span className="text-2xl font-bold text-[#4A2F19]">
                        ${fee.amount.toLocaleString()}
                      </span>
                      {fee.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full flex items-center">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFees.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center border border-[#E8DCC8]">
          <DollarSign className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
          <p className="text-[#8B6F47]">No fee structures found</p>
        </div>
      )}

      {/* Create Fee Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-[#E8DCC8]">
              <h2 className="text-2xl font-bold text-[#3D2817]">
                Create Fee Structure
              </h2>
            </div>
            <form onSubmit={handleCreateFee} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3D2817] mb-1">
                  Course ID
                </label>
                <input
                  type="number"
                  required
                  value={newFee.courseId}
                  onChange={(e) =>
                    setNewFee({ ...newFee, courseId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2817] mb-1">
                  Fee Type
                </label>
                <select
                  value={newFee.feeType}
                  onChange={(e) =>
                    setNewFee({ ...newFee, feeType: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                >
                  <option value="CourseFee">Course Fee</option>
                  <option value="RegistrationFee">Registration Fee</option>
                  <option value="ExamFee">Exam Fee</option>
                  <option value="MaterialFee">Material Fee</option>
                  <option value="LabFee">Lab Fee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2817] mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={newFee.amount}
                  onChange={(e) =>
                    setNewFee({ ...newFee, amount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2817] mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={newFee.description}
                  onChange={(e) =>
                    setNewFee({ ...newFee, description: e.target.value })
                  }
                  rows="3"
                  className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newFee.isActive}
                  onChange={(e) =>
                    setNewFee({ ...newFee, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-[#4A2F19] border-[#E8DCC8] rounded"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-[#3D2817]"
                >
                  Active
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] transition-colors flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Fee
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Fee Modal */}
      {showEditModal && editingFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-[#E8DCC8]">
              <h2 className="text-2xl font-bold text-[#3D2817]">
                Edit Fee Structure
              </h2>
            </div>
            <form onSubmit={handleUpdateFee} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3D2817] mb-1">
                  Fee Type
                </label>
                <select
                  value={editingFee.feeType}
                  onChange={(e) =>
                    setEditingFee({ ...editingFee, feeType: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                >
                  <option value="CourseFee">Course Fee</option>
                  <option value="RegistrationFee">Registration Fee</option>
                  <option value="ExamFee">Exam Fee</option>
                  <option value="MaterialFee">Material Fee</option>
                  <option value="LabFee">Lab Fee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2817] mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={editingFee.amount}
                  onChange={(e) =>
                    setEditingFee({ ...editingFee, amount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2817] mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={editingFee.description}
                  onChange={(e) =>
                    setEditingFee({
                      ...editingFee,
                      description: e.target.value,
                    })
                  }
                  rows="3"
                  className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2F19]"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editingFee.isActive}
                  onChange={(e) =>
                    setEditingFee({ ...editingFee, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-[#4A2F19] border-[#E8DCC8] rounded"
                />
                <label
                  htmlFor="editIsActive"
                  className="ml-2 text-sm text-[#3D2817]"
                >
                  Active
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#4A2F19] text-white rounded-lg hover:bg-[#3D2817] transition-colors flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Fee
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingFee(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Details Modal */}
      {showCourseDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#E8DCC8] sticky top-0 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-[#3D2817]">
                    {courseDetails?.courseName || "Course Details"}
                  </h2>
                  <p className="text-sm text-[#8B6F47] mt-1">
                    Complete fee breakdown for this course
                  </p>
                </div>
                <button
                  onClick={() => setShowCourseDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {loadingCourseDetails ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-[#4A2F19] animate-spin mx-auto mb-2" />
                <p className="text-[#6B4423]">Loading course details...</p>
              </div>
            ) : courseDetails ? (
              <div className="p-6 space-y-6">
                {/* Total Fee Summary */}
                <div className="bg-[#FFF8F0] rounded-lg p-6 border border-[#E8DCC8]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-[#3D2817]">
                      Total Course Fee
                    </h3>
                    <div className="text-3xl font-bold text-[#4A2F19]">
                      ${courseDetails.totalFee?.toLocaleString()}
                    </div>
                  </div>
                  <p className="text-sm text-[#8B6F47]">
                    Course ID: {courseDetails.courseId}
                  </p>
                </div>

                {/* Fee Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold text-[#3D2817] mb-4">
                    Fee Breakdown
                  </h3>
                  <div className="space-y-3">
                    {courseDetails.breakdown &&
                    courseDetails.breakdown.length > 0 ? (
                      courseDetails.breakdown.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-4 border border-[#E8DCC8] rounded-lg bg-white"
                        >
                          <div>
                            <p className="font-medium text-[#3D2817]">
                              {item.feeType}
                            </p>
                            {item.description && (
                              <p className="text-sm text-[#8B6F47] mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="text-lg font-bold text-[#4A2F19]">
                            ${item.amount?.toLocaleString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[#8B6F47] text-center py-4">
                        No fee breakdown available
                      </p>
                    )}
                  </div>
                </div>

                {/* All Course Fees */}
                {courseDetails.fees && courseDetails.fees.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#3D2817] mb-4">
                      All Fee Structures
                    </h3>
                    <div className="space-y-2">
                      {courseDetails.fees.map((fee, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            fee.isActive
                              ? "border-green-200 bg-green-50"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-[#3D2817]">
                                  {fee.feeType}
                                </span>
                                {fee.isActive ? (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                    Active
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">
                                    Inactive
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-[#8B6F47] mt-1">
                                {fee.description}
                              </p>
                            </div>
                            <div className="text-lg font-bold text-[#4A2F19]">
                              ${fee.amount?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-[#8B6F47]">No details available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FeeManagement;
