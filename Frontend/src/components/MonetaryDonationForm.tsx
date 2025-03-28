import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createMonetaryDonation } from "../services/donationService";
import PaymentTypeSelection from "./PaymentTypeSelection";
import PersonalInformationForm from "./PersonalInformationForm";

const MonetaryDonationForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [donationType, setDonationType] = useState("one-time");
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [coverFees, setCoverFees] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "creditCard" | "upi" | null
  >(null);
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [billingInfo, setBillingInfo] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "United States",
  });
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [totalAmount, setTotalAmount] = useState(0);

  const calculateCoverFees = (donationAmount: number) => {
    if (donationAmount < 100) return 0;
    return Math.floor(donationAmount / 100) * 5;
  };

  useEffect(() => {
    const donationAmount = customAmount
      ? parseFloat(customAmount)
      : parseFloat(amount);
    const coverFeeAmount = coverFees
      ? calculateCoverFees(donationAmount || 0)
      : 0;
    const calculatedTotal = (donationAmount || 0) + coverFeeAmount;
    setTotalAmount(isNaN(calculatedTotal) ? 0 : calculatedTotal);
  }, [amount, customAmount, coverFees]);
  

  const handleDonationSubmit = async () => {
    const donationAmount = customAmount ? parseFloat(customAmount) : parseFloat(amount);
    
    if (isNaN(donationAmount) || donationAmount <= 0) {
      toast.error("Please select a valid amount");
      return;
    }
  
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
  
    const data = {
      amount: totalAmount,
      paymentMethod,
      coverFees: coverFees,
      donationType,
    };
  
    try {
      await createMonetaryDonation(data);
      toast.success("Monetary donation created successfully!");
      resetForm();
    } catch (error: any) {
      toast.error("Error creating donation: " + error.message);
    }
  };
  

  const handleUPIDonation = async () => {
    const donationAmount = customAmount ? parseFloat(customAmount) : parseFloat(amount);
    
    if (isNaN(donationAmount) || donationAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
  
    const options = {
      key: "rzp_test_qpt3uDasNbystC",
      amount: totalAmount * 100,
      currency: "INR",
      name: "Your Donation Platform",
      description: "Donate via UPI",
      handler: async function (_response: any) {
        try {
          const data = {
            amount: totalAmount,
            paymentMethod: "upi",
            coverFees: coverFees,
            donationType,
          };
  
          await createMonetaryDonation(data);
          toast.success("Donation successful and saved!");
          resetForm();
        } catch (error: any) {
          toast.error("Error creating donation: " + error.message);
        }
      },
      prefill: {
        name: `${personalInfo.firstName} ${personalInfo.lastName}`,
        email: personalInfo.email,
        contact: personalInfo.phone,
      },
      theme: {
        color: "#F37254",
      },
    };
  
    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };
  

  const resetForm = () => {
    setAmount("");
    setCustomAmount("");
    setCoverFees(false);
    setPersonalInfo({ firstName: "", lastName: "", email: "", phone: "" });
    setBillingInfo({
      address: "",
      city: "",
      postalCode: "",
      country: "United States",
    });
    setCardInfo({ cardNumber: "", expiryDate: "", cvv: "" });
    setStep(1);
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="max-w-full mx-auto">
      <ToastContainer />
      {/* Step Indicator */}
      <div className="flex justify-between mb-8">
        {["My Donation", "Payment Type", "Payment Details"].map(
          (label, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`text-lg font-semibold ${
                  step === index + 1 ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {label}
              </div>
              <div className="flex items-center">
                <span
                  className={`w-6 h-6 border rounded-full flex items-center justify-center ${
                    step >= index + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > index ? "✓" : index + 1}
                </span>
                {index < 2 && (
                  <span
                    className={`w-16 border-t ${
                      step > index ? "border-blue-600" : "border-gray-200"
                    }`}
                  ></span>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {step === 1 && (
        // Step 1 content here...
        <div>
          <h2 className="text-xl font-semibold text-center mb-4">
            My Donation
          </h2>
          <div className="flex justify-center mb-4 border rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => setDonationType("one-time")}
              className={`px-4 py-2 font-semibold text-sm w-1/2 ${
                donationType === "one-time"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              One Time
            </button>
            <button
              type="button"
              onClick={() => setDonationType("monthly")}
              className={`px-4 py-2 font-semibold text-sm w-1/2 ${
                donationType === "monthly"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Monthly
            </button>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose a {donationType} amount
          </label>
          <div className="flex flex-wrap gap-3 justify-center mb-4">
            {[75, 125, 250, 500, 1000].map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => setAmount(amt.toString())}
                className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
                  amount === amt.toString()
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                ${amt}
              </button>
            ))}
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Other"
            />
          </div>

          <div className="flex items-center bg-gray-50 p-4 border rounded-lg mt-4">
            <input
              type="checkbox"
              checked={coverFees}
              onChange={(e) => setCoverFees(e.target.checked)}
              className="mr-2"
            />
            <label className="text-gray-700 text-sm">
              Please make my gift go further by adding $
              {isNaN(calculateCoverFees(totalAmount))
                ? 0
                : calculateCoverFees(totalAmount)}{" "}
              to cover the processing fees and other expenses associated with my
              donation.
            </label>
          </div>

          <div className="text-lg font-semibold mt-4">
            Total Amount: ${isNaN(totalAmount) ? 0 : totalAmount.toFixed(2)}
          </div>

          <button
            className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all mt-6"
            onClick={handleNext}
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <PaymentTypeSelection
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          handleUPIDonation={handleUPIDonation}
        />
      )}

      {step === 3 && (
        <PersonalInformationForm
          personalInfo={personalInfo}
          billingInfo={billingInfo}
          cardInfo={cardInfo}
          setPersonalInfo={setPersonalInfo}
          setBillingInfo={setBillingInfo}
          setCardInfo={setCardInfo}
          handleDonationSubmit={handleDonationSubmit}
          handlePrevious={handlePrevious}
        />
      )}
    </div>
  );
};

export default MonetaryDonationForm;
