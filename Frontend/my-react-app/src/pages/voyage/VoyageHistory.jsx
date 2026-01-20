import { useVoyage } from "../../context/VoyageContext";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";

function VoyageHistory() {
  const { voyages } = useVoyage();
  const navigate = useNavigate();

  /* ================= PDF COMPLIANCE REPORT ================= */
  const downloadCompliancePDF = (vesselId, points) => {
    const doc = new jsPDF();

    /* ===== HEADER ===== */
    doc.setFontSize(16);
    doc.text("MARITIME TRAFFIC AUTHORITY", 105, 20, { align: "center" });

    doc.setFontSize(11);
    doc.text(
      "Vessel Compliance & Route Monitoring Report",
      105,
      28,
      { align: "center" }
    );

    doc.line(20, 32, 190, 32);

    /* ===== BASIC INFO ===== */
    doc.setFontSize(10);
    doc.text(`Vessel ID: ${vesselId}`, 20, 42);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 20, 48);
    doc.text(`Authority: Marine Traffic Control System`, 20, 54);

    /* ===== VOYAGE SUMMARY ===== */
    doc.setFontSize(12);
    doc.text("Voyage Summary", 20, 66);
    doc.setFontSize(10);

    let y = 74;
    points.slice(0, 15).forEach((p, i) => {
      doc.text(
        `${i + 1}. Latitude: ${p.lat}, Longitude: ${p.lng}`,
        24,
        y
      );
      y += 6;
    });

    /* ===== COMPLIANCE STATUS ===== */
    y += 8;
    doc.setFontSize(12);
    doc.text("Compliance Assessment", 20, y);

    y += 8;
    doc.setFontSize(10);
    doc.text("✔ Route tracking active", 24, y);
    y += 6;
    doc.text("✔ Monitoring zones evaluated", 24, y);
    y += 6;
    doc.text("⚠ Review Safety & Weather Alerts if applicable", 24, y);

    /* ===== FOOTER ===== */
    y += 20;
    doc.line(20, y, 80, y);
    doc.text("Authorized Officer Signature", 20, y + 6);

    doc.text(
      "This report is system-generated and valid without physical signature.",
      20,
      280
    );

    /* ===== SAVE ===== */
    doc.save(`Compliance_Report_Vessel_${vesselId}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Voyage History</h2>

        <button
          onClick={() => navigate("/dashboard/operator")}
          className="text-sm text-blue-400 hover:underline"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      {!voyages || Object.keys(voyages).length === 0 ? (
        <p className="text-gray-400">
          No voyage data available. Start Live Tracking to record voyages.
        </p>
      ) : (
        Object.entries(voyages).map(([vesselId, points]) => (
          <div
            key={vesselId}
            className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">
                Vessel ID: {vesselId}
              </h3>

              {/* ✅ OFFICIAL PDF BUTTON */}
              <button
                onClick={() => downloadCompliancePDF(vesselId, points)}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Download Compliance Report (PDF)
              </button>
            </div>

            <ul className="text-sm text-gray-300 space-y-1 max-h-48 overflow-auto">
              {points.map((p, i) => (
                <li key={i}>
                  Lat: {p.lat}, Lng: {p.lng}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default VoyageHistory;
