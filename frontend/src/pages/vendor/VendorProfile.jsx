import { useState } from "react";

const BRAND = "#C0474A";

export default function VendorProfile() {
  const [form, setForm] = useState({
    businessName: "",
    slogan: "",
    openingTime: "",
    closingTime: "",
    profileImage: null,
    // NEW FIELDS
    email: "",
    phone: "",
    address: "",
    description: "",
    category: "",
    website: "",
    instagram: "",
    facebook: "",
    deliveryAvailable: false,
    minOrderAmount: "",
    preparationTime: "",
    // CERTIFICATE & LEGAL FIELDS
    businessPermit: null,
    sanitaryPermit: null,
    dtiRegistration: null,
    birRegistration: null,
    tinNumber: "",
    businessType: "sole_proprietorship", // sole_proprietorship, partnership, corporation
    yearsInOperation: "",
    numberOfEmployees: "",
    // ADDITIONAL BUSINESS FEATURES
    paymentMethods: [], // cash, card, gcash, paymaya
    maximumDeliveryRadius: "",
    deliveryFee: "",
    freeDeliveryThreshold: "",
    // OPERATIONAL FEATURES
    holidays: [],
    specialAnnouncements: "",
    acceptPreOrders: false,
    preorderLeadTime: "",
    // CONTACT PERSONS
    contactPerson: "",
    contactPersonNumber: "",
    // BANK DETAILS (for payouts)
    bankName: "",
    accountName: "",
    accountNumber: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [certificateFiles, setCertificateFiles] = useState({
    businessPermit: null,
    sanitaryPermit: null,
    dtiRegistration: null,
    birRegistration: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  const handleImage = (file) => {
    if (!file) return;
    setImageFile(file);
    setForm((prev) => ({
      ...prev,
      profileImage: URL.createObjectURL(file),
    }));
  };

  const handleCertificateUpload = (type, file) => {
    if (!file) return;
    setCertificateFiles(prev => ({
      ...prev,
      [type]: file
    }));
    setForm((prev) => ({
      ...prev,
      [type]: URL.createObjectURL(file),
    }));
    // Clear error for this certificate if exists
    if (errors[type]) {
      setErrors(prev => ({ ...prev, [type]: null }));
    }
  };

  const handlePaymentMethodToggle = (method) => {
    setForm(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validations
    if (!form.businessName.trim()) newErrors.businessName = "Business name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    
    // Certificate validations - at least one business document required
    const hasCertificate = certificateFiles.businessPermit || 
                          certificateFiles.dtiRegistration || 
                          certificateFiles.birRegistration;
    if (!hasCertificate) {
      newErrors.certificate = "At least one business registration document is required";
    }
    
    // Time validation
    if (form.openingTime && form.closingTime && form.openingTime >= form.closingTime) {
      newErrors.time = "Closing time must be after opening time";
    }
    
    // Bank details validation if delivery is available
    if (form.deliveryAvailable) {
      if (!form.bankName.trim()) newErrors.bankName = "Bank name is required for payouts";
      if (!form.accountName.trim()) newErrors.accountName = "Account name is required";
      if (!form.accountNumber.trim()) newErrors.accountNumber = "Account number is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    
    // Prepare FormData for all uploads
    const formData = new FormData();
    
    // Basic information
    const basicFields = [
      "businessName", "slogan", "openingTime", "closingTime", "email", "phone",
      "address", "description", "category", "website", "instagram", "facebook",
      "deliveryAvailable", "minOrderAmount", "preparationTime", "tinNumber",
      "businessType", "yearsInOperation", "numberOfEmployees", "maximumDeliveryRadius",
      "deliveryFee", "freeDeliveryThreshold", "specialAnnouncements", "acceptPreOrders",
      "preorderLeadTime", "contactPerson", "contactPersonNumber", "bankName",
      "accountName", "accountNumber"
    ];
    
    basicFields.forEach(field => {
      if (form[field]) formData.append(field, form[field]);
    });
    
    // Array fields
    formData.append("paymentMethods", JSON.stringify(form.paymentMethods));
    formData.append("holidays", JSON.stringify(form.holidays));
    
    // Images and certificates
    if (imageFile) formData.append("profileImage", imageFile);
    if (certificateFiles.businessPermit) formData.append("businessPermit", certificateFiles.businessPermit);
    if (certificateFiles.sanitaryPermit) formData.append("sanitaryPermit", certificateFiles.sanitaryPermit);
    if (certificateFiles.dtiRegistration) formData.append("dtiRegistration", certificateFiles.dtiRegistration);
    if (certificateFiles.birRegistration) formData.append("birRegistration", certificateFiles.birRegistration);

    try {
      // Simulate upload progress
      const simulateProgress = (fileName) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(prev => ({ ...prev, [fileName]: progress }));
          if (progress >= 100) clearInterval(interval);
        }, 200);
        return interval;
      };

      if (imageFile) simulateProgress('profileImage');
      Object.keys(certificateFiles).forEach(key => {
        if (certificateFiles[key]) simulateProgress(key);
      });

      // Replace with your actual API endpoint
      // const response = await fetch("/api/vendor/profile", {
      //   method: "POST",
      //   body: formData,
      // });
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      console.log("Saved profile:", Object.fromEntries(formData));
      alert("Profile saved successfully! Your documents will be reviewed within 24-48 hours.");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
      setUploadProgress({});
    }
  };

  const removeCertificate = (type) => {
    setCertificateFiles(prev => ({ ...prev, [type]: null }));
    setForm(prev => ({ ...prev, [type]: null }));
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ fontWeight: 700, color: BRAND, marginBottom: "20px" }}>
        Vendor Profile
      </h2>

      {/* Image Upload */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div
          onClick={() => document.getElementById("imgInput").click()}
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: "#F5F5F5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            overflow: "hidden",
            margin: "0 auto 10px",
            border: `2px solid ${BRAND}`,
          }}
        >
          {form.profileImage ? (
            <img
              src={form.profileImage}
              alt="profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ color: "#999" }}>📸 Upload</span>
          )}
          <input
            id="imgInput"
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleImage(e.target.files[0])}
          />
        </div>
        <small style={{ color: "#666" }}>Click to upload logo or store image</small>
      </div>

      {/* Business Certificates Section */}
      <div style={{ 
        background: "#FFF3E0", 
        padding: "15px", 
        borderRadius: "10px", 
        marginBottom: "20px",
        border: `1px solid ${BRAND}`
      }}>
        <h3 style={{ margin: "0 0 10px", fontSize: "18px", color: BRAND }}>
          📋 Business Permits & Certificates
        </h3>
        <small style={{ color: "#666", display: "block", marginBottom: "15px" }}>
          Required for verification. Accepted formats: PDF, JPG, PNG (Max 5MB each)
        </small>
        
        {/* Business Permit */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
            Business Permit / Mayors Permit *
          </label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleCertificateUpload("businessPermit", e.target.files[0])}
              style={{ flex: 1 }}
            />
            {form.businessPermit && (
              <button
                onClick={() => removeCertificate("businessPermit")}
                style={{ padding: "5px 10px", background: "#ff4444", color: "white", border: "none", borderRadius: "5px" }}
              >
                Remove
              </button>
            )}
          </div>
          {form.businessPermit && (
            <div style={{ marginTop: "5px" }}>
              <small>✅ Document uploaded</small>
              {uploadProgress.businessPermit && uploadProgress.businessPermit < 100 && (
                <div style={{ background: "#ddd", height: "3px", marginTop: "5px" }}>
                  <div style={{ width: `${uploadProgress.businessPermit}%`, background: BRAND, height: "100%" }}></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sanitary Permit */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
            Sanitary Permit (Food businesses)
          </label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleCertificateUpload("sanitaryPermit", e.target.files[0])}
              style={{ flex: 1 }}
            />
            {form.sanitaryPermit && (
              <button onClick={() => removeCertificate("sanitaryPermit")} style={{ padding: "5px 10px", background: "#ff4444", color: "white", border: "none", borderRadius: "5px" }}>
                Remove
              </button>
            )}
          </div>
        </div>

        {/* DTI Registration */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
            DTI / SEC Registration *
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleCertificateUpload("dtiRegistration", e.target.files[0])}
            style={{ width: "100%" }}
          />
        </div>

        {/* BIR Registration */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
            BIR Certificate of Registration
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleCertificateUpload("birRegistration", e.target.files[0])}
            style={{ width: "100%" }}
          />
        </div>

        {errors.certificate && (
          <small style={{ color: "red" }}>{errors.certificate}</small>
        )}
      </div>

      {/* Basic Info Section */}
      <h3 style={{ margin: "20px 0 10px", fontSize: "18px" }}>Basic Information</h3>
      
      <input
        placeholder="Business Name *"
        value={form.businessName}
        onChange={(e) => setForm({ ...form, businessName: e.target.value })}
        style={{ ...inputStyle, borderColor: errors.businessName ? "red" : "#ddd" }}
      />
      {errors.businessName && <small style={{ color: "red" }}>{errors.businessName}</small>}

      <select
        value={form.businessType}
        onChange={(e) => setForm({ ...form, businessType: e.target.value })}
        style={inputStyle}
      >
        <option value="sole_proprietorship">Sole Proprietorship</option>
        <option value="partnership">Partnership</option>
        <option value="corporation">Corporation</option>
      </select>

      <input
        placeholder="TIN Number"
        value={form.tinNumber}
        onChange={(e) => setForm({ ...form, tinNumber: e.target.value })}
        style={inputStyle}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          placeholder="Years in Operation"
          type="number"
          value={form.yearsInOperation}
          onChange={(e) => setForm({ ...form, yearsInOperation: e.target.value })}
          style={{ ...inputStyle, flex: 1 }}
        />
        <input
          placeholder="Number of Employees"
          type="number"
          value={form.numberOfEmployees}
          onChange={(e) => setForm({ ...form, numberOfEmployees: e.target.value })}
          style={{ ...inputStyle, flex: 1 }}
        />
      </div>

      <input
        placeholder="Business Slogan (e.g., Fresh & Fast!)"
        value={form.slogan}
        onChange={(e) => setForm({ ...form, slogan: e.target.value })}
        style={inputStyle}
      />

      <select
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        style={inputStyle}
      >
        <option value="">Select Category</option>
        <option value="restaurant">Restaurant</option>
        <option value="cafe">Cafe</option>
        <option value="bakery">Bakery</option>
        <option value="grocery">Grocery Store</option>
        <option value="pharmacy">Pharmacy</option>
        <option value="retail">Retail Store</option>
        <option value="other">Other</option>
      </select>

      <textarea
        placeholder="Business Description (what makes you special?)"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows="3"
        style={{ ...inputStyle, resize: "vertical" }}
      />

      {/* Contact Info Section */}
      <h3 style={{ margin: "20px 0 10px", fontSize: "18px" }}>Contact Information</h3>
      
      <input
        type="email"
        placeholder="Email Address *"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        style={{ ...inputStyle, borderColor: errors.email ? "red" : "#ddd" }}
      />
      {errors.email && <small style={{ color: "red" }}>{errors.email}</small>}

      <input
        placeholder="Phone Number *"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        style={{ ...inputStyle, borderColor: errors.phone ? "red" : "#ddd" }}
      />
      {errors.phone && <small style={{ color: "red" }}>{errors.phone}</small>}

      <input
        placeholder="Full Address *"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
        style={{ ...inputStyle, borderColor: errors.address ? "red" : "#ddd" }}
      />
      {errors.address && <small style={{ color: "red" }}>{errors.address}</small>}

      {/* Contact Person */}
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          placeholder="Contact Person Name"
          value={form.contactPerson}
          onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
          style={{ ...inputStyle, flex: 1 }}
        />
        <input
          placeholder="Contact Person Number"
          value={form.contactPersonNumber}
          onChange={(e) => setForm({ ...form, contactPersonNumber: e.target.value })}
          style={{ ...inputStyle, flex: 1 }}
        />
      </div>

      {/* Operating Hours */}
      <h3 style={{ margin: "20px 0 10px", fontSize: "18px" }}>Operating Hours</h3>
      
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="time"
          placeholder="Opening Time"
          value={form.openingTime}
          onChange={(e) => setForm({ ...form, openingTime: e.target.value })}
          style={{ ...inputStyle, flex: 1 }}
        />
        <input
          type="time"
          placeholder="Closing Time"
          value={form.closingTime}
          onChange={(e) => setForm({ ...form, closingTime: e.target.value })}
          style={{ ...inputStyle, flex: 1 }}
        />
      </div>
      {errors.time && <small style={{ color: "red" }}>{errors.time}</small>}

      <input
        placeholder="Avg. Preparation Time (e.g., 15-20 mins)"
        value={form.preparationTime}
        onChange={(e) => setForm({ ...form, preparationTime: e.target.value })}
        style={inputStyle}
      />

      {/* Pre-order Settings */}
      <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <input
          type="checkbox"
          checked={form.acceptPreOrders}
          onChange={(e) => setForm({ ...form, acceptPreOrders: e.target.checked })}
        />
        Accept pre-orders
      </label>

      {form.acceptPreOrders && (
        <input
          placeholder="Pre-order lead time (e.g., 1 day, 24 hours)"
          value={form.preorderLeadTime}
          onChange={(e) => setForm({ ...form, preorderLeadTime: e.target.value })}
          style={inputStyle}
        />
      )}

      {/* Delivery Settings */}
      <h3 style={{ margin: "20px 0 10px", fontSize: "18px" }}>Delivery Settings</h3>
      
      <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <input
          type="checkbox"
          checked={form.deliveryAvailable}
          onChange={(e) => setForm({ ...form, deliveryAvailable: e.target.checked })}
        />
        I offer delivery service
      </label>

      {form.deliveryAvailable && (
        <>
          <input
            type="number"
            placeholder="Minimum Order Amount (₱)"
            value={form.minOrderAmount}
            onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Maximum Delivery Radius (km)"
            value={form.maximumDeliveryRadius}
            onChange={(e) => setForm({ ...form, maximumDeliveryRadius: e.target.value })}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Delivery Fee (₱)"
            value={form.deliveryFee}
            onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Free Delivery Threshold (₱)"
            value={form.freeDeliveryThreshold}
            onChange={(e) => setForm({ ...form, freeDeliveryThreshold: e.target.value })}
            style={inputStyle}
          />
        </>
      )}

      {/* Payment Methods */}
      <h3 style={{ margin: "20px 0 10px", fontSize: "18px" }}>Accepted Payment Methods</h3>
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "15px" }}>
        {["cash", "card", "gcash", "paymaya", "bank_transfer"].map(method => (
          <label key={method} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <input
              type="checkbox"
              checked={form.paymentMethods.includes(method)}
              onChange={() => handlePaymentMethodToggle(method)}
            />
            {method.toUpperCase().replace("_", " ")}
          </label>
        ))}
      </div>

      {/* Bank Details for Payouts */}
      <h3 style={{ margin: "20px 0 10px", fontSize: "18px" }}>Bank Details for Payouts</h3>
      <select
        value={form.bankName}
        onChange={(e) => setForm({ ...form, bankName: e.target.value })}
        style={{ ...inputStyle, borderColor: errors.bankName ? "red" : "#ddd" }}
      >
        <option value="">Select Bank</option>
        <option value="bdo">BDO Unibank</option>
        <option value="bpi">Bank of the Philippine Islands (BPI)</option>
        <option value="metrobank">Metrobank</option>
        <option value="landbank">Landbank</option>
        <option value="pnb">PNB</option>
        <option value="security_bank">Security Bank</option>
        <option value="unionbank">Unionbank</option>
        <option value="rcbc">RCBC</option>
      </select>
      {errors.bankName && <small style={{ color: "red" }}>{errors.bankName}</small>}
      
      <input
        placeholder="Account Name (as shown in bank)"
        value={form.accountName}
        onChange={(e) => setForm({ ...form, accountName: e.target.value })}
        style={{ ...inputStyle, borderColor: errors.accountName ? "red" : "#ddd" }}
      />
      {errors.accountName && <small style={{ color: "red" }}>{errors.accountName}</small>}
      
      <input
        placeholder="Account Number"
        value={form.accountNumber}
        onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
        style={{ ...inputStyle, borderColor: errors.accountNumber ? "red" : "#ddd" }}
      />
      {errors.accountNumber && <small style={{ color: "red" }}>{errors.accountNumber}</small>}

      {/* Social Media Links */}
      <h3 style={{ margin: "20px 0 10px", fontSize: "18px" }}>Online Presence</h3>
      
      <input
        placeholder="Website URL"
        value={form.website}
        onChange={(e) => setForm({ ...form, website: e.target.value })}
        style={inputStyle}
      />
      <input
        placeholder="Instagram Username"
        value={form.instagram}
        onChange={(e) => setForm({ ...form, instagram: e.target.value })}
        style={inputStyle}
      />
      <input
        placeholder="Facebook Page"
        value={form.facebook}
        onChange={(e) => setForm({ ...form, facebook: e.target.value })}
        style={inputStyle}
      />

      {/* Special Announcements */}
      <h3 style={{ margin: "20px 0 10px", fontSize: "18px" }}>Announcements</h3>
      <textarea
        placeholder="Special announcements, holiday closures, or promotions..."
        value={form.specialAnnouncements}
        onChange={(e) => setForm({ ...form, specialAnnouncements: e.target.value })}
        rows="3"
        style={{ ...inputStyle, resize: "vertical" }}
      />

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        style={{
          marginTop: "20px",
          padding: "12px",
          width: "100%",
          background: BRAND,
          color: "white",
          border: "none",
          borderRadius: "25px",
          fontWeight: "bold",
          cursor: isSaving ? "not-allowed" : "pointer",
          opacity: isSaving ? 0.7 : 1,
        }}
      >
        {isSaving ? "Saving and Uploading Documents..." : "💾 Save Profile & Submit for Verification"}
      </button>

      {/* Preview Section */}
      {form.businessName && (
        <div style={{ marginTop: "30px", padding: "20px", background: "#f9f9f9", borderRadius: "10px" }}>
          <h4 style={{ marginBottom: "10px" }}>Preview:</h4>
          <p><strong>{form.businessName}</strong> {form.slogan && `- ${form.slogan}`}</p>
          {form.description && <p>{form.description.substring(0, 100)}...</p>}
          <small>📞 {form.phone || "No phone"}</small><br />
          <small>✉️ {form.email || "No email"}</small><br />
          <small>🏦 {form.bankName ? `Payouts to: ${form.bankName}` : "Bank details not set"}</small>
          {certificateFiles.businessPermit && <small>✅ Business permit uploaded</small>}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "8px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  fontSize: "14px",
  boxSizing: "border-box",
  fontFamily: "inherit",
};