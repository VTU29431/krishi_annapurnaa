import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Building,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowRight,
  QrCode,
  AlertCircle,
  Loader2,
  Receipt,
  FileCheck,
} from 'lucide-react';

export interface PaymentBreakdownItem {
  label: string;
  amount: number;
  isDiscount?: boolean;
}

interface GovtPaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle: string;
  serviceCategory: 'COLD_STORAGE' | 'PRODUCE_BOOKING' | 'GENERAL';
  beneficiaryAgency: string;
  totalAmount: number;
  breakdown: PaymentBreakdownItem[];
  farmerName: string;
  farmerAadhaar: string;
  farmerMobile: string;
  onPaymentSuccess: (result: {
    transactionRef: string;
    challanNumber: string;
    paymentMethod: string;
    paidAt: string;
    amountPaid: number;
  }) => void;
}

export const GovtPaymentGatewayModal: React.FC<GovtPaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  serviceTitle,
  serviceCategory,
  beneficiaryAgency,
  totalAmount,
  breakdown,
  farmerName,
  farmerAadhaar,
  farmerMobile,
  onPaymentSuccess,
}) => {
  const [paymentTab, setPaymentTab] = useState<'UPI' | 'RUPAY' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('ravi.kisan@sbi');
  const [cardNumber, setCardNumber] = useState('6071 8294 1029 4821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('382');
  const [selectedBank, setSelectedBank] = useState('SBI');

  const [paymentState, setPaymentState] = useState<'INPUT' | 'PROCESSING' | 'SUCCESS'>('INPUT');
  const [transactionReceipt, setTransactionReceipt] = useState<{
    ref: string;
    challan: string;
    paidAt: string;
    method: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentState('PROCESSING');

    setTimeout(() => {
      const generatedRef = `TXN-GOV-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const generatedChallan = `CIN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const timestamp = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const methodLabel =
        paymentTab === 'UPI'
          ? `BHIM UPI (${upiId})`
          : paymentTab === 'RUPAY'
          ? `RuPay KCC Card ••••${cardNumber.slice(-4)}`
          : `Net Banking (${selectedBank})`;

      setTransactionReceipt({
        ref: generatedRef,
        challan: generatedChallan,
        paidAt: timestamp,
        method: methodLabel,
      });

      setPaymentState('SUCCESS');
      onPaymentSuccess({
        transactionRef: generatedRef,
        challanNumber: generatedChallan,
        paymentMethod: methodLabel,
        paidAt: timestamp,
        amountPaid: totalAmount,
      });
    }, 1500);
  };

  const handleCloseModal = () => {
    setPaymentState('INPUT');
    setTransactionReceipt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* National Tricolor Stripe */}
        <div className="h-1.5 w-full flex">
          <div className="flex-1 bg-[#FF9933]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-[#138808]"></div>
        </div>

        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700/80 border border-emerald-500/40 flex items-center justify-center text-lg shadow-sm">
              🏛️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  Bharat e-Pay Treasury Gateway
                </h2>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                  PFMS Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official Government of India Direct Payment Portal
              </p>
            </div>
          </div>
          {paymentState !== 'PROCESSING' && (
            <button
              onClick={handleCloseModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {paymentState === 'INPUT' && (
            <>
              {/* Order & Beneficiary Summary Card */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                      {serviceCategory === 'COLD_STORAGE'
                        ? 'Accredited Cold Storage Booking'
                        : 'Government Agricultural Service'}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">
                      {serviceTitle}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Total Payable</span>
                    <span className="text-xl font-extrabold font-mono text-emerald-900">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Breakdown details */}
                <div className="space-y-1 text-[11px]">
                  {breakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600">
                      <span>{item.label}</span>
                      <span
                        className={`font-mono font-semibold ${
                          item.isDiscount ? 'text-emerald-700' : 'text-slate-800'
                        }`}
                      >
                        {item.isDiscount ? `-₹${item.amount.toLocaleString()}` : `₹${item.amount.toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-emerald-200/60 flex justify-between font-bold text-emerald-950 text-xs">
                    <span>Beneficiary Credit Account:</span>
                    <span className="text-right text-[11px] font-medium text-slate-700 max-w-[200px] truncate">
                      {beneficiaryAgency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Farmer KYC Confirmation */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                <div>
                  <span className="font-bold text-slate-900">{farmerName}</span>
                  <span className="text-slate-500 font-mono ml-2">Aadhaar: ••••{farmerAadhaar.slice(-4)}</span>
                </div>
                <span className="font-mono text-slate-600">+91-{farmerMobile}</span>
              </div>

              {/* Payment Methods Tabs */}
              <div className="space-y-3">
                <label className="block font-bold text-slate-800 text-xs">
                  Select Secured Government Payment Method:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentTab('UPI')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center space-y-1 transition-all border ${
                      paymentTab === 'UPI'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-700" />
                    <span>BHIM UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentTab('RUPAY')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center space-y-1 transition-all border ${
                      paymentTab === 'RUPAY'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <span>RuPay / KCC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentTab('NETBANKING')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center space-y-1 transition-all border ${
                      paymentTab === 'NETBANKING'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Building className="w-4 h-4 text-emerald-700" />
                    <span>Net Banking</span>
                  </button>
                </div>

                <form onSubmit={handleInitiatePayment} className="space-y-4 pt-2">
                  {paymentTab === 'UPI' && (
                    <div className="space-y-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800">
                          Enter VPA / UPI ID <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                          Zero Convenience Fee
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. 9876543210@paytm, ravi@okhdfcbank"
                          required
                          className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                        <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Accepted via BHIM, Google Pay, PhonePe, Paytm, Any Bank UPI App</span>
                      </div>
                    </div>
                  )}

                  {paymentTab === 'RUPAY' && (
                    <div className="space-y-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          RuPay / Kisan Credit Card Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="XXXX XXXX XXXX XXXX"
                          required
                          className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs tracking-wider"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Valid Thru</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            required
                            className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">CVV / CVC</label>
                          <input
                            type="password"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            required
                            className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentTab === 'NETBANKING' && (
                    <div className="space-y-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                      <label className="block font-bold text-slate-800">
                        Select Nationalized or Scheduled Bank
                      </label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white"
                      >
                        <option value="SBI">State Bank of India (SBI)</option>
                        <option value="PNB">Punjab National Bank (PNB)</option>
                        <option value="BOB">Bank of Baroda</option>
                        <option value="CANARA">Canara Bank</option>
                        <option value="HDFC">HDFC Bank</option>
                        <option value="ICICI">ICICI Bank</option>
                      </select>
                      <p className="text-[10px] text-slate-500">
                        You will be routed directly via National Electronic Payment clearing (NPCI / RBI Gateway).
                      </p>
                    </div>
                  )}

                  {/* Security Note */}
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>256-Bit SSL Encrypted • Direct Ministry Treasury Credit</span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Confirm Payment of ₹{totalAmount.toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}

          {paymentState === 'PROCESSING' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-500/20 border-t-emerald-600 animate-spin flex items-center justify-center"></div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Communicating with Government Treasury Gateway...
                </h3>
                <p className="text-slate-500 text-xs max-w-sm">
                  Validating NPCI authentication & depositing to official scheme treasury account. Please do not refresh.
                </p>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg font-mono text-[11px] text-slate-600">
                Verifying Beneficiary: {beneficiaryAgency}
              </div>
            </div>
          )}

          {paymentState === 'SUCCESS' && transactionReceipt && (
            <div className="py-4 space-y-5 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 font-mono">
                  PAYMENT CONFIRMED • TREASURY RECEIPT ISSUED
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  Payment of ₹{totalAmount.toLocaleString()} Completed!
                </h3>
                <p className="text-xs text-slate-500">
                  Transaction successfully processed and recorded in official Ministry registers.
                </p>
              </div>

              {/* Official Electronic Challan Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5 font-mono">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Government UTR:</span>
                  <span className="font-bold text-slate-900">{transactionReceipt.ref}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Challan / CIN Number:</span>
                  <span className="font-bold text-emerald-800">{transactionReceipt.challan}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Method Used:</span>
                  <span className="text-slate-800 font-sans text-[11px] font-semibold">
                    {transactionReceipt.method}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Paid Timestamp:</span>
                  <span className="text-slate-800">{transactionReceipt.paidAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Paid by Farmer:</span>
                  <span className="text-slate-900 font-sans font-bold">{farmerName}</span>
                </div>
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>View Verified Policy / e-NWR Certificate</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3.5 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>National Payments Corporation of India (NPCI)</span>
          <span className="font-semibold text-emerald-800">Govt. of India Secured</span>
        </div>
      </div>
    </div>
  );
};
