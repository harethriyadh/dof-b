# UI Code Analysis and Fixes

## 🚨 **Critical Issues Found**

### **1. Hardcoded JWT Token (CRITICAL)**
```javascript
// ❌ PROBLEM: Hardcoded placeholder token
const userToken = "YOUR_JWT_TOKEN_HERE";
```

**Issues:**
- This will cause authentication failures
- No actual token management
- Security risk if real token is hardcoded

### **2. Missing Error Handling for Enhanced API Responses**
The code doesn't handle the enhanced error responses we implemented.

### **3. Missing Meta Information Usage**
The code doesn't use the `meta` information from the API response.

### **4. Incomplete Error Handling**
The error handling is too generic and doesn't provide specific feedback.

---

## ✅ **FIXED CODE**

```javascript
import React, { useState, useMemo, useEffect } from "react";
import "../RequestsManagement.css";

// This component handles the management and approval/rejection of employee leave requests.
export default function RequestsManagement() {
  // State for rejection modal
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // State for processed requests filter and export
  const [processedStatusFilter, setProcessedStatusFilter] = useState("all");
  const [isExportingProcessed, setIsExportingProcessed] = useState(false);
  const [exportMessageProcessed, setExportMessageProcessed] = useState("");

  // State for requests
  const [pendingRequests, setPendingRequests] = useState([]);
  const [processedRequests, setProcessedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  // ✅ FIX 1: Get JWT token from localStorage or context
  // This should come from your authentication system
  const getAuthToken = () => {
    // Option 1: From localStorage (if stored after login)
    const token = localStorage.getItem('authToken');
    
    // Option 2: From context/state management
    // const token = authContext.token;
    
    // Option 3: From session storage
    // const token = sessionStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }
    
    return token;
  };

  // Enhanced error handling function
  const handleApiError = (error, response = null) => {
    console.error('API Error:', error);
    
    if (response) {
      const errorData = error;
      
      // Handle specific error types
      if (errorData.type === 'Invalid Parameter') {
        setError(`Invalid parameter: ${errorData.message}. Valid values: ${errorData.validValues?.join(', ')}`);
      } else if (errorData.type === 'Validation Error') {
        setError(`Validation error: ${errorData.message}`);
      } else if (errorData.type === 'Database Connection Error') {
        setError('Database is temporarily unavailable. Please try again later.');
      } else if (errorData.type === 'Server Error') {
        setError('Server error occurred. Please try again later.');
      } else {
        setError(errorData.message || 'An unexpected error occurred.');
      }
    } else {
      // Network or parsing error
      setError('Network error. Please check your connection and try again.');
    }
  };

  // Function to fetch data from the API with enhanced error handling
  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // ✅ FIX 2: Get actual JWT token
      const userToken = getAuthToken();
      
      const response = await fetch("http://localhost:3000/api/leave-requests", {
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
      });

      const result = await response.json();
      
      if (result.success) {
        // ✅ FIX 3: Use enhanced response structure
        const allRequests = result.data;
        setMeta(result.meta);
        
        console.log(`Found ${result.meta.count} leave requests`);
        console.log('Applied filter:', result.meta.filter);

        // Separate requests into pending and processed
        const pending = allRequests.filter((req) => req.status === "pending");
        const processed = allRequests.filter((req) => req.status !== "pending");

        setPendingRequests(pending);
        setProcessedRequests(processed);
      } else {
        // ✅ FIX 4: Handle enhanced error responses
        handleApiError(result, response);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      
      if (err.message.includes('No authentication token')) {
        setError('Please login first to access this page.');
      } else {
        handleApiError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchRequests();
  }, []);

  // Enhanced handle approve/reject action
  const handleProcessRequest = async (requestId, action) => {
    try {
      // ✅ FIX 5: Get actual JWT token
      const userToken = getAuthToken();
      
      const requestBody = {
        status: action,
        processed_by: "المدير الحالي",
      };

      if (action === "rejected") {
        requestBody.reason_for_rejection = rejectionReason || "تم الرفض من قبل المدير";
      }

      const response = await fetch(
        `http://localhost:3000/api/leave-requests/${requestId}/process`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const result = await response.json();
      
      if (result.success) {
        // Show success message
        console.log(`Request ${action} successfully:`, result.data);
        
        // After a successful update, re-fetch the data to keep the UI in sync
        await fetchRequests();
        
        // Close rejection modal if it was open
        if (action === "rejected") {
          setShowRejectionModal(false);
          setRejectionReason("");
          setSelectedRequestId(null);
        }
      } else {
        // Handle API error response
        handleApiError(result, response);
      }
    } catch (error) {
      console.error("Error processing request:", error);
      
      if (error.message.includes('No authentication token')) {
        setError('Please login first to access this page.');
      } else {
        handleApiError(error);
      }
    }
  };

  // Handle reject button click - opens modal
  const handleRejectClick = (requestId) => {
    setSelectedRequestId(requestId);
    setRejectionReason("");
    setShowRejectionModal(true);
  };

  // Handle rejection form submission
  const handleRejectionSubmit = (e) => {
    e.preventDefault();
    if (rejectionReason.trim()) {
      handleProcessRequest(selectedRequestId, "rejected");
    } else {
      setError('Please provide a reason for rejection.');
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowRejectionModal(false);
    setRejectionReason("");
    setSelectedRequestId(null);
  };

  // Filter processed requests based on status
  const filteredProcessedRequests = useMemo(() => {
    if (processedStatusFilter === "all") {
      return processedRequests;
    }
    return processedRequests.filter(
      (request) => request.status === processedStatusFilter
    );
  }, [processedRequests, processedStatusFilter]);

  // Handle export processed requests to PDF (NO CANVAS/JSPDF)
  const handleExportProcessedPDF = () => {
    setIsExportingProcessed(true);
    setExportMessageProcessed("لا يوجد دعم لتصدير PDF حاليًا.");
    setTimeout(() => {
      setIsExportingProcessed(false);
      setExportMessageProcessed("");
    }, 3000);
  };

  // Get status color class
  const getStatusColorClass = (status) => {
    switch (status) {
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      default:
        return "status-pending";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "معتمد";
      case "rejected":
        return "مرفوض";
      default:
        return "قيد الانتظار";
    }
  };

  // Memoized counts
  const counts = useMemo(
    () => ({
      pending: pendingRequests.length,
      approved: processedRequests.filter((req) => req.status === "approved").length,
      rejected: processedRequests.filter((req) => req.status === "rejected").length,
    }),
    [pendingRequests, processedRequests]
  );

  // ✅ FIX 6: Enhanced loading state with retry option
  if (isLoading) {
    return (
      <div className="requests-management-container">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  // ✅ FIX 7: Enhanced error state with retry option
  if (error) {
    return (
      <div className="requests-management-container">
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setError(null);
              fetchRequests();
            }}
          >
            <i className="fas fa-redo"></i>
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="requests-management-container">
      {/* Page Header */}
      <div className="page-header">
        <h2>إدارة الطلبات</h2>
        <p>مراجعة واتخاذ قرارات بشأن طلبات الإجازة</p>
        {/* ✅ FIX 8: Show meta information if available */}
        {meta && (
          <div className="meta-info">
            <small>إجمالي الطلبات: {meta.count} | آخر تحديث: {new Date().toLocaleString('ar-SA')}</small>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="summary-cards-grid">
        <div className="card summary-card summary-card-pending">
          <div className="summary-card-content">
            <div className="summary-main-value summary-main-value-pending">
              {counts.pending}
            </div>
            <div className="summary-label">الطلبات المعلقة</div>
          </div>
        </div>

        <div className="card summary-card summary-card-approved">
          <div className="summary-card-content">
            <div className="summary-main-value summary-main-value-approved">
              {counts.approved}
            </div>
            <div className="summary-label">الطلبات المعتمدة</div>
          </div>
        </div>

        <div className="card summary-card summary-card-rejected">
          <div className="summary-card-content">
            <div className="summary-main-value summary-main-value-rejected">
              {counts.rejected}
            </div>
            <div className="summary-label">الطلبات المرفوضة</div>
          </div>
        </div>
      </div>

      {/* Pending Requests Section */}
      <div className="requests-section">
        <div className="section-header pending-section-header">
          <h3>الطلبات المعلقة</h3>
          <p>الطلبات التي تحتاج إلى مراجعة واتخاذ قرار</p>
        </div>

        <div className="table-responsive-wrapper">
          <table className="requests-table" id="pending-requests-table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>الإجراءات</th>
                <th>تاريخ الطلب</th>
                <th>اسم الموظف</th>
                <th>القسم</th>
                <th>نوع الإجازة</th>
                <th>من تاريخ</th>
                <th>إلى تاريخ</th>
                <th>عدد الأيام</th>
                <th>السبب</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan="10" className="no-data">
                    <i className="fas fa-inbox"></i>
                    <p>لا توجد طلبات معلقة</p>
                  </td>
                </tr>
              ) : (
                pendingRequests.map((request) => (
                  <tr key={request.request_no} className="pending-row">
                    <td>{request.request_no}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="btn btn-approve"
                          onClick={() =>
                            handleProcessRequest(request.request_no, "approved")
                          }
                          title="اعتماد الطلب"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          className="btn btn-reject"
                          onClick={() => handleRejectClick(request.request_no)}
                          title="رفض الطلب"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </td>
                    <td>{request.request_date?.split('T')[0]}</td>
                    <td>{request.employee_name}</td>
                    <td>{request.department}</td>
                    <td>{request.leave_type}</td>
                    <td>{request.start_date?.split('T')[0]}</td>
                    <td>{request.end_date?.split('T')[0]}</td>
                    <td>{request.number_of_days}</td>
                    <td>{request.reason || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters and Export for Processed Requests */}
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="processed-status-filter">حالة الطلب:</label>
          <select
            id="processed-status-filter"
            className="filter-select"
            value={processedStatusFilter}
            onChange={(e) => setProcessedStatusFilter(e.target.value)}
          >
            <option value="all">الكل</option>
            <option value="approved">معتمد</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>
        <button
          className="btn btn-secondary export-pdf-btn"
          onClick={handleExportProcessedPDF}
          disabled={isExportingProcessed}
        >
          <i
            className={`fas ${
              isExportingProcessed ? "fa-spinner fa-spin" : "fa-file-pdf"
            }`}
          ></i>
          {isExportingProcessed ? "جاري التصدير..." : "تصدير كـ PDF"}
        </button>
      </div>

      {exportMessageProcessed && (
        <div
          className={`export-message ${
            exportMessageProcessed.includes("فشل") ? "error" : "success"
          }`}
        >
          {exportMessageProcessed}
        </div>
      )}

      {/* Processed Requests Section */}
      <div className="requests-section">
        <div className="section-header">
          <h3>الطلبات المعالجة</h3>
          <p>الطلبات التي تم اتخاذ قرار بشأنها</p>
        </div>

        <div className="table-responsive-wrapper">
          <table className="requests-table" id="processed-requests-table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>تاريخ الطلب</th>
                <th>اسم الموظف</th>
                <th>القسم</th>
                <th>نوع الإجازة</th>
                <th>من تاريخ</th>
                <th>إلى تاريخ</th>
                <th>عدد الأيام</th>
                <th>السبب</th>
                <th>الحالة</th>
                <th>تاريخ المعالجة</th>
                <th>تمت المعالجة بواسطة</th>
                <th>سبب الرفض</th>
              </tr>
            </thead>
            <tbody>
              {filteredProcessedRequests.length === 0 ? (
                <tr>
                  <td colSpan="13" className="no-data">
                    <i className="fas fa-inbox"></i>
                    <p>لا توجد طلبات معالجة</p>
                  </td>
                </tr>
              ) : (
                filteredProcessedRequests.map((request) => (
                  <tr
                    key={request.request_no}
                    className={`processed-row ${getStatusColorClass(
                      request.status
                    )}`}
                  >
                    <td>{request.request_no}</td>
                    <td>{request.request_date?.split('T')[0]}</td>
                    <td>{request.employee_name}</td>
                    <td>{request.department}</td>
                    <td>{request.leave_type}</td>
                    <td>{request.start_date?.split('T')[0]}</td>
                    <td>{request.end_date?.split('T')[0]}</td>
                    <td>{request.number_of_days}</td>
                    <td>{request.reason || '-'}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusColorClass(
                          request.status
                        )}`}
                      >
                        {getStatusText(request.status)}
                      </span>
                    </td>
                    <td>{request.processing_date?.split('T')[0] || '-'}</td>
                    <td>{request.processed_by || '-'}</td>
                    <td>{request.reason_for_rejection || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>سبب رفض الطلب</h3>
              <button className="modal-close-btn" onClick={handleModalClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleRejectionSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="rejection-reason">سبب الرفض:</label>
                <textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="يرجى كتابة سبب رفض الطلب..."
                  required
                  rows="4"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleModalClose}
                >
                  إلغاء
                </button>
                <button type="submit" className="btn btn-danger">
                  رفض الطلب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🔧 **Key Fixes Applied**

### **1. Authentication Token Management**
- ✅ Removed hardcoded token
- ✅ Added `getAuthToken()` function
- ✅ Multiple token source options (localStorage, context, sessionStorage)
- ✅ Proper error handling for missing tokens

### **2. Enhanced Error Handling**
- ✅ `handleApiError()` function for specific error types
- ✅ Better error messages for users
- ✅ Retry functionality in error state

### **3. API Response Handling**
- ✅ Uses enhanced response structure with `meta` information
- ✅ Handles all error response types
- ✅ Proper success/error flow

### **4. UI Improvements**
- ✅ Empty state handling for tables
- ✅ Meta information display
- ✅ Better loading and error states
- ✅ Retry button in error state

### **5. Data Handling**
- ✅ Proper null/undefined checks
- ✅ Fallback values for missing data
- ✅ Better date formatting

---

## 🚀 **Next Steps**

1. **Implement Authentication System**: Set up proper JWT token management
2. **Add Token Refresh**: Handle token expiration
3. **Add Loading States**: For individual actions
4. **Add Success Messages**: For successful operations
5. **Add Validation**: For form inputs

The code is now much more robust and will handle the enhanced API responses properly! 🎉
