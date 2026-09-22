import React, { useState, useEffect } from "react";

const API_BASE_URL = "https://main-api.yuksi.tr/api";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("jwt_token") || "");
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  // Auth Form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("905361111111");

  // Query Parametreleri
  const [activeFilter, setActiveFilter] = useState("");
  const [completedPage, setCompletedPage] = useState(1);
  const [completedLimit, setCompletedLimit] = useState(10);

  // Sürücü Yanıtı Parametreleri
  const [driverId, setDriverId] = useState(
    "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  );
  const [isAccepted, setIsAccepted] = useState(true);

  // --- TAM ŞEMA: POST /api/orders Alanları ---
  const [userId, setUserId] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [carrierType, setCarrierType] = useState("");
  const [pickupLatitude, setPickupLatitude] = useState(0);
  const [pickupLongitude, setPickupLongitude] = useState(0);

  // pickup_location
  const [pCity, setPCity] = useState("");
  const [pDistrict, setPDistrict] = useState("");
  const [pNeighborhood, setPNeighborhood] = useState("");
  const [pAddressText, setPAddressText] = useState("");
  const [pBuildingNo, setPBuildingNo] = useState("");

  // dropoff_location
  const [dCity, setDCity] = useState("");
  const [dDistrict, setDDistrict] = useState("");
  const [dNeighborhood, setDNeighborhood] = useState("");
  const [dAddressText, setDAddressText] = useState("");
  const [dBuildingNo, setDBuldingNo] = useState("");

  // cargo_details
  const [weightCategory, setWeightCategory] = useState("");
  const [isThermal, setIsThermal] = useState(true);
  const [cargoNote, setCargoNote] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  // pricing
  const [basePrice, setBasePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [currency, setCurrency] = useState("TRY");
  // -------------------------------------------

  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "text/plain" },
        body: JSON.stringify({ email, password }),
      });
      const responseText = await response.text();
      if (!response.ok) throw new Error(`Giriş başarısız: ${responseText}`);
      const data = JSON.parse(responseText);
      const userToken = data.access_token || data.token;
      localStorage.setItem("jwt_token", userToken);
      setToken(userToken);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          phone,
        }),
      });
      if (!response.ok) throw new Error("Kayıt başarısız.");
      setSuccessMsg("Kayıt başarılı! Giriş yapabilirsiniz.");
      setIsRegistering(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchActiveOrders = async () => {
    setActiveTab("active");
    setLoading(true);
    try {
      const queryParam = activeFilter
        ? `?filter=${encodeURIComponent(activeFilter)}`
        : "";
      const response = await fetch(
        `${API_BASE_URL}/orders/active${queryParam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        },
      );
      const data = await response.json();
      setOrdersList(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedOrders = async () => {
    setActiveTab("completed");
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/completed?page=${completedPage}&limit=${completedLimit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        },
      );
      const data = await response.json();
      setOrdersList(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Tam Şema Gönderimi
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const payload = {
      user_id: userId,
      order_number: orderNumber,
      service_type: serviceType,
      carrier_type: carrierType,
      pickup_latitude: Number(pickupLatitude),
      pickup_longitude: Number(pickupLongitude),
      pickup_location: {
        city: pCity,
        district: pDistrict,
        neighborhood: pNeighborhood,
        address_text: pAddressText,
        building_no: pBuildingNo,
      },
      dropoff_location: {
        city: dCity,
        district: dDistrict,
        neighborhood: dNeighborhood,
        address_text: dAddressText,
        building_no: dBuildingNo,
      },
      cargo_details: {
        weight_category: weightCategory,
        is_thermal: Boolean(isThermal),
        note: cargoNote,
        photos: photoUrl ? [photoUrl] : [],
      },
      pricing: {
        base_price: Number(basePrice),
        discount: Number(discount),
        total: Number(total),
        currency: currency,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
        body: JSON.stringify(payload),
      });
      const responseText = await response.text();
      if (!response.ok)
        throw new Error(`Sipariş oluşturulamadı: ${responseText}`);

      setSuccessMsg("Sipariş başarıyla oluşturuldu!");
      fetchActiveOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDriverResponse = async (orderId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/driver-response`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
          body: JSON.stringify({
            driver_id: driverId,
            is_accepted: isAccepted,
          }),
        },
      );
      if (!response.ok) throw new Error("Sürücü yanıtı iletilemedi.");
      alert("Sürücü yanıtı başarıyla gönderildi!");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/confirm`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, accept: "*/*" },
        },
      );
      if (!response.ok) throw new Error("Sipariş onaylanamadı.");
      alert("Sipariş başarıyla onaylandı!");
      fetchActiveOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    setToken("");
  };

  useEffect(() => {
    if (token) fetchActiveOrders();
  }, [token]);

  if (!token) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>
            {isRegistering ? "Kayıt Ol" : "Giriş Yap"}
          </h2>
          {error && <div style={styles.error}>{error}</div>}
          {successMsg && <div style={styles.success}>{successMsg}</div>}
          <form
            onSubmit={isRegistering ? handleRegister : handleLogin}
            style={styles.form}
          >
            {isRegistering && (
              <>
                <input
                  type="text"
                  placeholder="Ad"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={styles.input}
                  required
                />
                <input
                  type="text"
                  placeholder="Soyad"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={styles.input}
                  required
                />
                <input
                  type="text"
                  placeholder="Telefon"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={styles.input}
                  required
                />
              </>
            )}
            <input
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            <button type="submit" style={styles.button}>
              {isRegistering ? "Kayıt Ol" : "Giriş"}
            </button>
          </form>
          <p
            style={styles.switchText}
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering
              ? "Zaten hesabın var mı? Giriş yap"
              : "Hesabın yok mu? Kayıt ol"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.headerBar}>
        <h1 style={styles.headerTitle}>Yuksi Operasyon Paneli</h1>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={fetchActiveOrders}
            style={activeTab === "active" ? styles.activeTabBtn : styles.tabBtn}
          >
            Aktif Siparişler
          </button>
          <button
            onClick={fetchCompletedOrders}
            style={
              activeTab === "completed" ? styles.activeTabBtn : styles.tabBtn
            }
          >
            Tamamlananlar
          </button>
          <button
            onClick={() => setActiveTab("create")}
            style={activeTab === "create" ? styles.activeTabBtn : styles.tabBtn}
          >
            + Yeni Sipariş (Tam Şema)
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Çıkış
          </button>
        </div>
      </div>

      {activeTab === "active" && (
        <div style={styles.tableCard}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <input
              type="text"
              placeholder="Filtrele (filter)..."
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              style={{ ...styles.input, maxWidth: "250px" }}
            />
            <button onClick={fetchActiveOrders} style={styles.buttonSmall}>
              Filtreyi Uygula
            </button>
          </div>
          <h3>Aktif Siparişler Listesi</h3>
          {loading ? (
            <div>Yükleniyor...</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Sipariş No</th>
                  <th style={styles.th}>Servis Tipi</th>
                  <th style={styles.th}>Toplam Tutar</th>
                  <th style={styles.th}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {ordersList.map((o, index) => {
                  const oId = o.id || o.orderId;
                  return (
                    <tr key={index} style={styles.tr}>
                      <td style={styles.td}>{o.order_number || oId}</td>
                      <td style={styles.td}>{o.service_type || "-"}</td>
                      <td style={styles.td}>
                        {o.pricing?.total} {o.pricing?.currency}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleConfirmOrder(oId)}
                          style={styles.confirmBtn}
                        >
                          Onayla
                        </button>
                        <button
                          onClick={() => handleDriverResponse(oId)}
                          style={styles.driverBtn}
                        >
                          Sürücü Yanıtı
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "completed" && (
        <div style={styles.tableCard}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <input
              type="number"
              placeholder="Sayfa (page)"
              value={completedPage}
              onChange={(e) => setCompletedPage(e.target.value)}
              style={{ ...styles.input, maxWidth: "120px" }}
            />
            <input
              type="number"
              placeholder="Limit"
              value={completedLimit}
              onChange={(e) => setCompletedLimit(e.target.value)}
              style={{ ...styles.input, maxWidth: "120px" }}
            />
            <button onClick={fetchCompletedOrders} style={styles.buttonSmall}>
              Getir
            </button>
          </div>
          <h3>Tamamlanan Siparişler</h3>
          {loading ? (
            <div>Yükleniyor...</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Sipariş No</th>
                  <th style={styles.th}>Servis Tipi</th>
                  <th style={styles.th}>Toplam Tutar</th>
                </tr>
              </thead>
              <tbody>
                {ordersList.map((o, index) => (
                  <tr key={index} style={styles.tr}>
                    <td style={styles.td}>{o.order_number || o.id}</td>
                    <td style={styles.td}>{o.service_type || "-"}</td>
                    <td style={styles.td}>
                      {o.pricing?.total} {o.pricing?.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "create" && (
        <div style={styles.cardFormContainer}>
          <h3 style={{ color: "#fff", marginBottom: "16px" }}>
            Yeni Sipariş Oluştur (Tam Şema)
          </h3>
          {error && <div style={styles.error}>{error}</div>}
          {successMsg && <div style={styles.success}>{successMsg}</div>}

          <form onSubmit={handleCreateOrder} style={styles.form}>
            <h4 style={{ color: "#38bdf8", margin: "10px 0 5px 0" }}>
              Temel Bilgiler
            </h4>
            <input
              type="text"
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Order Number"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Service Type"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Carrier Type"
              value={carrierType}
              onChange={(e) => setCarrierType(e.target.value)}
              style={styles.input}
              required
            />

            <h4 style={{ color: "#38bdf8", margin: "10px 0 5px 0" }}>
              Alım Yeri Konumu (Pickup Location)
            </h4>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="number"
                placeholder="Latitude"
                value={pickupLatitude}
                onChange={(e) => setPickupLatitude(e.target.value)}
                style={styles.input}
              />
              <input
                type="number"
                placeholder="Longitude"
                value={pickupLongitude}
                onChange={(e) => setPickupLongitude(e.target.value)}
                style={styles.input}
              />
            </div>
            <input
              type="text"
              placeholder="Şehir (City)"
              value={pCity}
              onChange={(e) => setPCity(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="İlçe (District)"
              value={pDistrict}
              onChange={(e) => setPDistrict(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Mahalle (Neighborhood)"
              value={pNeighborhood}
              onChange={(e) => setPNeighborhood(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Adres Metni (Address Text)"
              value={pAddressText}
              onChange={(e) => setPAddressText(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Bina No (Building No)"
              value={pBuildingNo}
              onChange={(e) => setPBuildingNo(e.target.value)}
              style={styles.input}
            />

            <h4 style={{ color: "#38bdf8", margin: "10px 0 5px 0" }}>
              Teslim Yeri Konumu (Dropoff Location)
            </h4>
            <input
              type="text"
              placeholder="Teslim Şehir (City)"
              value={dCity}
              onChange={(e) => setDCity(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Teslim İlçe (District)"
              value={dDistrict}
              onChange={(e) => setDDistrict(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Teslim Mahalle (Neighborhood)"
              value={dNeighborhood}
              onChange={(e) => setDNeighborhood(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Teslim Adres Metni"
              value={dAddressText}
              onChange={(e) => setDAddressText(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Teslim Bina No"
              value={dBuildingNo}
              onChange={(e) => setDBuldingNo(e.target.value)}
              style={styles.input}
            />

            <h4 style={{ color: "#38bdf8", margin: "10px 0 5px 0" }}>
              Kargo Detayları (Cargo Details)
            </h4>
            <input
              type="text"
              placeholder="Ağırlık Kategorisi (Weight Category)"
              value={weightCategory}
              onChange={(e) => setWeightCategory(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Kargo Notu (Note)"
              value={cargoNote}
              onChange={(e) => setCargoNote(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Fotoğraf URL (Photos)"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              style={styles.input}
            />

            <h4 style={{ color: "#38bdf8", margin: "10px 0 5px 0" }}>
              Fiyatlandırma (Pricing)
            </h4>
            <input
              type="number"
              placeholder="Taban Fiyat (Base Price)"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="İndirim (Discount)"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Toplam Tutar (Total)"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Para Birimi (Currency - Örn: TRY)"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={styles.input}
            />

            <button type="submit" style={styles.button}>
              Tam Şemalı Siparişi Gönder
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "sans-serif",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: "32px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "400px",
    border: "1px solid #334155",
  },
  cardFormContainer: {
    backgroundColor: "#1e293b",
    padding: "32px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "700px",
    margin: "0 auto",
    border: "1px solid #334155",
  },
  title: {
    color: "#fff",
    fontSize: "22px",
    marginBottom: "20px",
    textAlign: "center",
  },
  error: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid #ef4444",
    color: "#f87171",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "16px",
    fontSize: "13px",
  },
  success: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    border: "1px solid #22c55e",
    color: "#4ade80",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "16px",
    fontSize: "13px",
  },
  form: { display: "flex", flexDirection: "column", gap: "8px" },
  input: {
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "6px",
    padding: "8px",
    color: "#fff",
    fontSize: "14px",
    width: "100%",
  },
  button: {
    backgroundColor: "#2563eb",
    color: "#fff",
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "15px",
  },
  buttonSmall: {
    backgroundColor: "#334155",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
  },
  confirmBtn: {
    backgroundColor: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "6px",
    fontSize: "11px",
  },
  driverBtn: {
    backgroundColor: "#ca8a04",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "11px",
  },
  switchText: {
    color: "#38bdf8",
    fontSize: "13px",
    textAlign: "center",
    marginTop: "16px",
    cursor: "pointer",
  },
  dashboardContainer: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    padding: "24px",
    color: "#f8fafc",
    fontFamily: "sans-serif",
  },
  headerBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: "16px 24px",
    borderRadius: "12px",
    border: "1px solid #334155",
    marginBottom: "24px",
  },
  headerTitle: { fontSize: "18px", fontWeight: "bold", margin: 0 },
  tabBtn: {
    backgroundColor: "#334155",
    color: "#94a3b8",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  activeTabBtn: {
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    color: "#f87171",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  tableCard: {
    backgroundColor: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #334155",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    marginTop: "10px",
  },
  th: {
    padding: "10px",
    borderBottom: "1px solid #334155",
    color: "#94a3b8",
    fontSize: "12px",
  },
  tr: { borderBottom: "1px solid #334155" },
  td: { padding: "10px", fontSize: "13px", color: "#e2e8f0" },
};
