import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../utils/api";
import { loadMe } from "../redux/slices/authSlice";

const Addresses = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const addresses = user?.addresses || [];

  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
  });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const addAddress = async (e) => {
    e.preventDefault();

    if (!form.fullName || !form.phone || !form.addressLine1 || !form.city || !form.state || !form.pincode) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await api.post("/users/addresses", form);
      toast.success("Address added");
      dispatch(loadMe());

      setForm((p) => ({
        ...p,
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false,
      }));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add address");
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      await api.delete(`/users/addresses/${addressId}`);
      toast.success("Address deleted");
      dispatch(loadMe());
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const setDefault = async (addressId) => {
    try {
      await api.put(`/users/addresses/${addressId}`, { isDefault: true });
      toast.success("Default address updated");
      dispatch(loadMe());
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to set default");
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800 }}>My Addresses</h2>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Saved list */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 10 }}>Saved</h3>

          {addresses.length === 0 ? (
            <p>No addresses yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {addresses.map((a) => (
                <div key={a._id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 }}>
                  <p style={{ fontWeight: 800 }}>
                    {a.fullName} {a.isDefault ? "(Default)" : ""}
                  </p>
                  <p>{a.phone}</p>
                  <p>{a.addressLine1} {a.addressLine2}</p>
                  <p>{a.city}, {a.state} - {a.pincode}</p>
                  <p>{a.country}</p>

                  <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {!a.isDefault && (
                      <button onClick={() => setDefault(a._id)} style={{ padding: "6px 10px", cursor: "pointer" }}>
                        Set Default
                      </button>
                    )}
                    <button onClick={() => deleteAddress(a._id)} style={{ padding: "6px 10px", cursor: "pointer" }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add form */}
        <form onSubmit={addAddress} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 10 }}>Add New Address</h3>

          <div style={{ display: "grid", gap: 10 }}>
            <input name="fullName" value={form.fullName} onChange={onChange} placeholder="Full Name *" style={{ padding: 10 }} />
            <input name="phone" value={form.phone} onChange={onChange} placeholder="Phone *" style={{ padding: 10 }} />
            <input name="addressLine1" value={form.addressLine1} onChange={onChange} placeholder="Address Line 1 *" style={{ padding: 10 }} />
            <input name="addressLine2" value={form.addressLine2} onChange={onChange} placeholder="Address Line 2" style={{ padding: 10 }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input name="city" value={form.city} onChange={onChange} placeholder="City *" style={{ padding: 10 }} />
              <input name="state" value={form.state} onChange={onChange} placeholder="State *" style={{ padding: 10 }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input name="pincode" value={form.pincode} onChange={onChange} placeholder="Pincode *" style={{ padding: 10 }} />
              <input name="country" value={form.country} onChange={onChange} placeholder="Country" style={{ padding: 10 }} />
            </div>

            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={onChange} />
              Make this default
            </label>

            <button type="submit" style={{ padding: 10, cursor: "pointer" }}>
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Addresses;