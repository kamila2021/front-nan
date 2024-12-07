import React, { useState } from "react";
import "./PlataformaPagos.css";

const Mensualidad = () => {
  const [selectedConcept, setSelectedConcept] = useState("");
  const [amount, setAmount] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expirationDate: "",
    cvv: "",
  });

  const handleConceptChange = (e) => {
    const concept = e.target.value;
    setSelectedConcept(concept);
    setAmount(concept === "matricula" ? 50000 : 30000); // Montos simulados
  };

  const handleInputChange = (e) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  const handlePayment = () => {
    alert(
      `Pago realizado exitosamente para ${selectedConcept === "matricula" ? "Matrícula" : "Mensualidad"} por un monto de $${amount}.`
    );
    setSelectedConcept("");
    setAmount(0);
    setPaymentDetails({
      cardNumber: "",
      expirationDate: "",
      cvv: "",
    });
  };

  return (
    <div className="plataforma-pagos-container">
      <h1>Plataforma de Pagos</h1>
      <div className="payment-form">
        <div className="payment-step">
          <h3>Seleccione el concepto de pago:</h3>
          <select value={selectedConcept} onChange={handleConceptChange}>
            <option value="">Seleccione...</option>
            <option value="matricula">Matrícula</option>
            <option value="mensualidad">Mensualidad</option>
          </select>
        </div>

        {selectedConcept && (
          <>
            <div className="payment-step">
              <h3>Detalles del pago:</h3>
              <p>
                Concepto:{" "}
                {selectedConcept === "matricula" ? "Matrícula" : "Mensualidad"}
              </p>
              <p>Monto: ${amount}</p>
            </div>

            <div className="payment-step">
              <h3>Detalles de la tarjeta:</h3>
              <input
                type="text"
                name="cardNumber"
                placeholder="Número de Tarjeta"
                maxLength="16"
                value={paymentDetails.cardNumber}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="expirationDate"
                placeholder="MM/YY"
                maxLength="5"
                value={paymentDetails.expirationDate}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="cvv"
                placeholder="CVV"
                maxLength="3"
                value={paymentDetails.cvv}
                onChange={handleInputChange}
                required
              />
            </div>

            <button
              className="pay-button"
              onClick={handlePayment}
              disabled={
                !paymentDetails.cardNumber ||
                !paymentDetails.expirationDate ||
                !paymentDetails.cvv
              }
            >
              Realizar Pago
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Mensualidad;
