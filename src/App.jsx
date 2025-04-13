import React, { useState, useRef } from "react";
import html2pdf from "html2pdf.js";

export default function InvoiceGenerator() {
  const [services, setServices] = useState([
    { description: "", quantite: 1, prix: 0 }
  ]);
  const [client, setClient] = useState("");
  const [adresse, setAdresse] = useState("Dorset Drive\nAbe Milton Parkway, Rockford Hills");
  const [date, setDate] = useState("2025-03-30");
  const invoiceRef = useRef();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const formatted = date.toLocaleDateString('fr-FR', options);
    return formatted.replace(/\b\w/g, (m) => m.toUpperCase());
  };

  const addService = () => {
    setServices([...services, { description: "", quantite: 1, prix: 0 }]);
  };

  const updateService = (index, field, value) => {
    const updated = [...services];
    updated[index][field] = field === "description" ? value : parseFloat(value) || 0;
    setServices(updated);
  };

  const total = services.reduce((sum, item) => sum + item.quantite * item.prix, 0);

  const generatePDF = () => {
    const noPrintElements = document.querySelectorAll(".no-print");
    noPrintElements.forEach((el) => (el.style.display = "none"));
    const printOnlyElements = document.querySelectorAll(".print-only");
    printOnlyElements.forEach((el) => (el.style.display = "block"));
  
    html2pdf()
      .from(invoiceRef.current)
      .outputPdf("blob")
      .then((pdfBlob) => {
        // Check if pdfBlob is a valid Blob
        if (pdfBlob instanceof Blob) {
          // Ensure we have a valid Blob before appending
          const formData = new FormData();
          formData.append("file", pdfBlob, "facture.pdf"); // Append as Blob
          
          // Send to Discord
          fetch('/api/send-to-discord', {
            method: 'POST',
            body: formData,
          })
          .then((res) => {
            if (res.ok) {
              alert('✅ Facture envoyée à Discord avec succès !');
            } else {
              alert('❌ Échec de l\'envoi vers Discord.');
            }
          })
          .catch((err) => {
            console.error('Erreur:', err);
            alert('❌ Une erreur est survenue.');
          });
        } else {
          console.error('Le fichier généré n\'est pas un Blob valide');
          alert('❌ Impossible de générer un fichier valide');
        }
      })
      .finally(() => {
        noPrintElements.forEach((el) => (el.style.display = ""));
        printOnlyElements.forEach((el) => (el.style.display = "none"));
      });
  };
  
  

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto", backgroundColor: "white", border: "0px solid #ddd", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", borderRadius: "10px", textAlign: "center"}}>
      <div ref={invoiceRef} style={{ padding: "30px", textAlign: "center", fontFamily: "HK Grotesk" }}>
        <img src="logo.png" alt="LS Prestige" style={{ width: "400px", marginBottom: "20px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ width: "48%", textAlign: "left" }}>
            <div style={{ fontWeight: "bold", color: "gray" }}>ADRESSE</div>
            <textarea
              placeholder="Adresse"
              value={adresse}
              style={{ width: "100%", padding: "10px", marginBottom: "10px", border: "1px solid #ccc", minHeight: "60px", fontWeight: "bold" }}
              className="no-print"
            />
            <div className="print-only" style={{ display: 'none', whiteSpace: 'pre-line', textAlign: 'left' }}>
              {adresse}
            </div>
          </div>
          <div style={{ width: "48%", textAlign: "right" }}>
            <div style={{ fontWeight: "bold", color: "gray" }}>DATE</div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "10px", border: "1px solid #ccc", fontWeight: "bold" }}
              className="no-print"
            />
            <div className="print-only" style={{ display: 'none', textAlign: 'right' }}>
              {formatDate(date)}
            </div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", border: "0px solid #ddd" }}>
          <thead>
            <tr style={{ backgroundColor: "#e4c071", color: "white" }}>
              <th style={{ padding: "10px", border: "0px solid #ddd" }}>Description</th>
              <th style={{ padding: "10px", border: "0px solid #ddd" }}>Quantité</th>
              <th style={{ padding: "10px", border: "0px solid #ddd" }}>Prix Unitaire</th>
              <th style={{ padding: "10px", border: "0px solid #ddd" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s, i) => (
              <tr key={i} style={{ border: "0px solid #ddd", borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px", border: "0px solid #ddd", textAlign: "left" }}>
                  <input
                    type="text"
                    value={s.description}
                    onChange={(e) => updateService(i, "description", e.target.value)}
                    style={{ width: "100%", border: "none" }}
                    className="no-print"
                  />
                  <span className="print-only" style={{ display: 'none' }}>{s.description}</span>
                </td>
                <td style={{ padding: "10px", border: "0px solid #ddd", textAlign: "center" }}>
                  <input
                    type="number"
                    value={s.quantite}
                    onChange={(e) => updateService(i, "quantite", e.target.value)}
                    style={{ width: "50px", border: "none" }}
                    className="no-print"
                  />
                  <span className="print-only" style={{ display: 'none' }}>{s.quantite}</span>
                </td>
                <td style={{ padding: "10px", border: "0px solid #ddd", textAlign: "right" }}>
                  <input
                    type="number"
                    value={s.prix}
                    onChange={(e) => updateService(i, "prix", e.target.value)}
                    style={{ width: "80px", border: "none" }}
                    className="no-print"
                  />
                  <span className="print-only" style={{ display: 'none' }}>{s.prix.toLocaleString()} $</span>
                </td>
                <td style={{ padding: "10px", border: "0px solid #ddd", textAlign: "right" }}>
                  {(s.quantite * s.prix).toLocaleString()} $
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addService} className="no-print" style={{ marginTop: "10px", backgroundColor: "#007bff", color: "white", padding: "8px 12px", borderRadius: "5px", border: "none" }}>+ Ajouter un service</button>
        <div style={{ textAlign: "right", marginTop: "20px" }}>
          <div style={{ fontWeight: "bold", fontSize: "18px" }}>Total</div>
          <div style={{ fontSize: "18px" }}>{total.toLocaleString()} $</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", textAlign: "left", fontSize: "14px", marginTop: "40px" }}>
          <div>
            <p style={{ fontWeight: "bold", color: "gray" }}>INFOS DE PAIEMENT</p>
            <p>Maze Bank</p>
            <p>Nom du compte: Pacific Production</p>
            <p>RIB: 11758</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: "bold", color: "gray" }}>SIGNATURE</p>
            <img src="sign.png" alt="Signature" style={{ width: "250px", marginBottom: "0px" }} />
          </div>
        </div>
        <p style={{ textAlign: "center", marginTop: "30px", fontWeight: "600", color: "gray" }}>MERCI POUR VOTRE PAIEMENT</p>
      </div>
      <button onClick={generatePDF} className="no-print" style={{ marginTop: "20px", backgroundColor: "#28a745", color: "white", padding: "12px", width: "100%", fontSize: "16px", fontWeight: "bold", borderRadius: "5px", boxShadow: "0px 4px 6px rgba(0,0,0,0.1)" }}>📄 Générer la facture</button>
    </div>
  );
}
