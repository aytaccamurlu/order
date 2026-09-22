import React, { useState, useEffect } from "react";

const API_BASE_URL = "https://main-api.yuksi.tr/api";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("jwt_token") || "");
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState("active"); // 'active', 'completed', 'create', 'detail'

  // Auth Form Alanları
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("905361111111");

  // Yeni Sipariş Oluşturma (POST) Form Alanları
  const [orderDescription, setOrderDescription] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [orderAddress, setOrderAddress] = useState("");

  // Tekil Sipariş Detayı için ID
  const [searchId, setSearchId] = useState("");
  const [singleOrder, setSingleOrder] = useState(null);

  // Sürücü Yanıtı için state
  const [driverResponseText, setDriverResponseText] = useState("");

  // Veriler ve Durumlar
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Giriş Yap
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
      if (!userToken) throw new Error("Token alınamadı!");

      localStorage.setItem("jwt_token", userToken);
      setToken(userToken);
    } catch (err) {
      setError(err.message);
    }
  };

  // Kayıt Ol
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
          phone: phone,
        }),
      });

      const responseText = await response.text();
      if (!response.ok) throw new Error(`Kayıt başarısız: ${responseText}`);

      setSuccessMsg("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
      setIsRegistering(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // 1. GET /api/orders/active
  const fetchActiveOrders = async () => {
    setActiveTab("active");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/active`, {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json",
        },
      });
      if (response.status === 401) {
        handleLogout();
        throw new Error("Oturum süresi doldu.");
      }
      if (!response.ok) throw new Error("Aktif siparişler yüklenemedi.");
      const data = await response.json();
      setOrdersList(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. GET /api/orders/completed
  const fetchCompletedOrders = async () => {
    setActiveTab("completed");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/completed`, {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json",
        },
      });
      if (response.status === 401) {
        handleLogout();
        throw new Error("Oturum süresi doldu.");
      }
      if (!response.ok) throw new Error("Tamamlanan siparişler yüklenemedi.");
      const data = await response.json();
      setOrdersList(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. GET /api/orders/{id}
  const fetchOrderById = async (e) => {
    if (e) e.preventDefault();
    if (!searchId) return;
    setLoading(true);
    setError("");
    setSingleOrder(null);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${searchId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json",
        },
      });
      if (!response.ok) throw new Error("Sipariş bulunamadı veya ID hatalı.");
      const data = await response.json();
      setSingleOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. POST /api/orders
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
        body: JSON.stringify({
          description: orderDescription,
          customer_name: customerName,
          address: orderAddress,
        }),
      });
      const responseText = await response.text();
      if (!response.ok)
        throw new Error(`Sipariş oluşturulamadı: ${responseText}`);

      setSuccessMsg("Sipariş başarıyla oluşturuldu!");
      setOrderDescription("");
      setCustomerName("");
      setOrderAddress("");
      fetchActiveOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  // 5. POST /api/orders/{id}/driver-response
  const handleDriverResponse = async (orderId) => {
    if (!driverResponseText) {
      alert("Lütfen bir sürücü yanıtı girin.");
      return;
    }
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
          body: JSON.stringify({ response: driverResponseText }),
        },
      );
      if (!response.ok) throw new Error("Sürücü yanıtı iletilemedi.");
      alert("Sürücü yanıtı başarıyla gönderildi!");
      setDriverResponseText("");
    } catch (err) {
      alert(err.message);
    }
  };

  // 6. POST /api/orders/{id}/confirm
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
    if (token) {
      fetchActiveOrders();
    }
  }, [token]);

  // Giriş Ekranı
  if (!token) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>
            {isRegistering ? "Yeni Hesap Kaydı" : "Yuksi Admin Girişi"}
          </h2>
          {error && <div style={styles.error}>{error}</div>}
          {successMsg && <div style={styles.success}>{successMsg}</div>}
          <form
            onSubmit={isRegistering ? handleRegister : handleLogin}
            style={styles.form}
          >
            {isRegistering && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Ad</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Soyad</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Telefon</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              </>
            )}
            <div style={styles.inputGroup}>
              <label style={styles.label}>E-posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <button type="submit" style={styles.button}>
              {isRegistering ? "Kayıt Ol" : "Giriş Yap"}
            </button>
          </form>
          <p
            style={styles.switchText}
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
              setSuccessMsg("");
            }}
          >
            {isRegistering
              ? "Zaten hesabınız var mı? Giriş yapın"
              : "Hesabınız yok mu? Kayıt olun"}
          </p>
        </div>
      </div>
    );
  }

  // Yönetim Paneli
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
            onClick={() => setActiveTab("detail")}
            style={activeTab === "detail" ? styles.activeTabBtn : styles.tabBtn}
          >
            Sipariş Sorgula (ID)
          </button>
          <button
            onClick={() => setActiveTab("create")}
            style={activeTab === "create" ? styles.activeTabBtn : styles.tabBtn}
          >
            + Yeni Sipariş
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Çıkış
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {successMsg && <div style={styles.success}>{successMsg}</div>}

      {/* 1 & 2. Aktif veya Tamamlanan Listeler */}
      {(activeTab === "active" || activeTab === "completed") && (
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h3>
              {activeTab === "active"
                ? "Aktif Siparişler Listesi"
                : "Tamamlanan Siparişler Listesi"}
            </h3>
            <button
              onClick={
                activeTab === "active"
                  ? fetchActiveOrders
                  : fetchCompletedOrders
              }
              style={styles.secondaryButton}
            >
              Yenile
            </button>
          </div>
          {loading ? (
            <div style={styles.centerText}>Yükleniyor...</div>
          ) : ordersList.length === 0 ? (
            <div style={styles.centerText}>Kayıt bulunamadı.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHead}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Müşteri / Detay</th>
                  <th style={styles.th}>Durum</th>
                  <th style={styles.thRight}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {ordersList.map((order) => {
                  const oId = order.id || order.orderId;
                  return (
                    <tr key={oId} style={styles.tr}>
                      <td style={styles.td}>{oId}</td>
                      <td style={styles.td}>
                        {order.description || order.customerName || "Detay Yok"}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.badge}>
                          {order.status || "Bilinmiyor"}
                        </span>
                      </td>
                      <td style={styles.tdRight}>
                        {activeTab === "active" && (
                          <button
                            onClick={() => handleConfirmOrder(oId)}
                            style={styles.confirmButton}
                          >
                            Onayla
                          </button>
                        )}
                        <input
                          type="text"
                          placeholder="Sürücü yanıtı..."
                          onChange={(e) =>
                            setDriverResponseText(e.target.value)
                          }
                          style={styles.smallInput}
                        />
                        <button
                          onClick={() => handleDriverResponse(oId)}
                          style={styles.driverButton}
                        >
                          Sürücü Yanıtı Gönder
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

      {/* 3. ID ile Tekil Sipariş Sorgulama GET /api/orders/{id} */}
      {activeTab === "detail" && (
        <div style={styles.cardFormContainer}>
          <h3 style={{ color: "#fff", marginBottom: "16px" }}>
            Sipariş Detayı Sorgula (GET /orders/{`id`})
          </h3>
          <form
            onSubmit={fetchOrderById}
            style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
          >
            <input
              type="text"
              placeholder="Sipariş ID girin..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              style={styles.input}
              required
            />
            <button type="submit" style={styles.button}>
              Sorgula
            </button>
          </form>
          {singleOrder && (
            <div
              style={{
                backgroundColor: "#0f172a",
                padding: "16px",
                borderRadius: "8px",
                color: "#e2e8f0",
              }}
            >
              <p>
                <strong>ID:</strong> {singleOrder.id || singleOrder.orderId}
              </p>
              <p>
                <strong>Açıklama:</strong> {singleOrder.description}
              </p>
              <p>
                <strong>Müşteri:</strong> {singleOrder.customerName}
              </p>
              <p>
                <strong>Durum:</strong> {singleOrder.status}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. Yeni Sipariş Oluşturma POST /api/orders */}
      {activeTab === "create" && (
        <div style={styles.cardFormContainer}>
          <h3 style={{ color: "#fff", marginBottom: "16px" }}>
            Yeni Sipariş Oluştur (POST /orders)
          </h3>
          <form onSubmit={handleCreateOrder} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Müşteri Adı</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Açıklama</label>
              <input
                type="text"
                value={orderDescription}
                onChange={(e) => setOrderDescription(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Adres</label>
              <input
                type="text"
                value={orderAddress}
                onChange={(e) => setOrderAddress(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <button type="submit" style={styles.button}>
              Sipariş Gönder
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
    maxWidth: "600px",
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
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { color: "#94a3b8", fontSize: "13px" },
  input: {
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "6px",
    padding: "10px",
    color: "#fff",
    outline: "none",
    fontSize: "14px",
    width: "100%",
  },
  smallInput: {
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "4px",
    padding: "4px 8px",
    color: "#fff",
    fontSize: "12px",
    marginRight: "6px",
  },
  button: {
    backgroundColor: "#2563eb",
    color: "#fff",
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
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
    flexWrap: "wrap",
    gap: "10px",
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
  secondaryButton: {
    backgroundColor: "#334155",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
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
    borderRadius: "12px",
    border: "1px solid #334155",
    overflow: "hidden",
  },
  tableHeader: {
    padding: "16px 24px",
    borderBottom: "1px solid #334155",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  centerText: { padding: "40px", textAlign: "center", color: "#94a3b8" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  trHead: {
    backgroundColor: "#0f172a",
    color: "#94a3b8",
    fontSize: "12px",
    textTransform: "uppercase",
  },
  th: { padding: "12px 24px" },
  thRight: { padding: "12px 24px", textAlign: "right" },
  tr: { borderBottom: "1px solid #334155" },
  td: { padding: "16px 24px", fontSize: "14px", color: "#e2e8f0" },
  tdRight: {
    padding: "16px 24px",
    textAlign: "right",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "6px",
  },
  badge: {
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    color: "#facc15",
    border: "1px solid rgba(234, 179, 8, 0.3)",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
  },
  confirmButton: {
    backgroundColor: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "bold",
  },
  driverButton: {
    backgroundColor: "#ca8a04",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "bold",
  },
};
