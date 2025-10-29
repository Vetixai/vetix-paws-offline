import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "./LocalLanguageSupport";
import { Smartphone, CheckCircle, Clock, XCircle } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  purpose: string;
  mpesaCode: string;
  status: "completed" | "pending" | "failed";
  date: string;
  recipient: string;
}

export const MpesaPaymentTracker = () => {
  const { toast } = useToast();
  const { currentLanguage } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: "1",
      amount: 2500,
      purpose: "Vaccination - Cattle",
      mpesaCode: "RFK8X9M2PQ",
      status: "completed",
      date: "2024-01-15",
      recipient: "Dr. Kamau Veterinary"
    },
    {
      id: "2",
      amount: 1800,
      purpose: "Treatment - Goat",
      mpesaCode: "SGT2Y4N8RT",
      status: "completed",
      date: "2024-01-10",
      recipient: "Kiambu Vet Clinic"
    }
  ]);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    purpose: "",
    mpesaCode: "",
    recipient: ""
  });

  const addPayment = () => {
    if (!newPayment.amount || !newPayment.purpose || !newPayment.mpesaCode) {
      toast({
        title: currentLanguage === 'sw-KE' ? "Kuna kosa" : "Error",
        description: currentLanguage === 'sw-KE' 
          ? "Tafadhali jaza sehemu zote" 
          : "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    const payment: Payment = {
      id: Date.now().toString(),
      amount: parseFloat(newPayment.amount),
      purpose: newPayment.purpose,
      mpesaCode: newPayment.mpesaCode,
      status: "completed",
      date: new Date().toISOString().split('T')[0],
      recipient: newPayment.recipient || "Not specified"
    };

    setPayments([payment, ...payments]);
    setNewPayment({ amount: "", purpose: "", mpesaCode: "", recipient: "" });
    
    toast({
      title: currentLanguage === 'sw-KE' ? "Malipo Yamehifadhiwa" : "Payment Recorded",
      description: currentLanguage === 'sw-KE' 
        ? "Malipo yako yamehifadhiwa" 
        : "Your payment has been recorded successfully"
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === "completed") return <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
    if (status === "pending") return <Badge className="bg-warning text-warning-foreground"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
  };

  const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-success" />
          {currentLanguage === 'sw-KE' ? 'Ufuatiliaji wa M-Pesa' : 'M-Pesa Payment Tracker'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="p-4 rounded-lg bg-gradient-health text-white">
          <p className="text-sm opacity-90">
            {currentLanguage === 'sw-KE' ? 'Jumla ya Matumizi' : 'Total Spent'}
          </p>
          <p className="text-3xl font-bold">KSh {totalSpent.toLocaleString()}</p>
          <p className="text-xs opacity-75">
            {payments.length} {currentLanguage === 'sw-KE' ? 'malipo' : 'payments'}
          </p>
        </div>

        {/* Add Payment Form */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-semibold text-foreground">
            {currentLanguage === 'sw-KE' ? 'Ongeza Malipo Mapya' : 'Record New Payment'}
          </h4>
          <Input
            placeholder={currentLanguage === 'sw-KE' ? "Kiasi (KSh)" : "Amount (KSh)"}
            type="number"
            value={newPayment.amount}
            onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
          />
          <Input
            placeholder={currentLanguage === 'sw-KE' ? "Madhumuni" : "Purpose (e.g., Vaccination)"}
            value={newPayment.purpose}
            onChange={(e) => setNewPayment({...newPayment, purpose: e.target.value})}
          />
          <Input
            placeholder={currentLanguage === 'sw-KE' ? "Nambari ya M-Pesa" : "M-Pesa Code"}
            value={newPayment.mpesaCode}
            onChange={(e) => setNewPayment({...newPayment, mpesaCode: e.target.value})}
          />
          <Input
            placeholder={currentLanguage === 'sw-KE' ? "Mpokeaji (Daktari/Kliniki)" : "Recipient (Vet/Clinic)"}
            value={newPayment.recipient}
            onChange={(e) => setNewPayment({...newPayment, recipient: e.target.value})}
          />
          <Button onClick={addPayment} className="w-full bg-success hover:bg-success/90">
            {currentLanguage === 'sw-KE' ? 'Hifadhi Malipo' : 'Record Payment'}
          </Button>
        </div>

        {/* Payment History */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">
            {currentLanguage === 'sw-KE' ? 'Historia ya Malipo' : 'Payment History'}
          </h4>
          {payments.map((payment) => (
            <div key={payment.id} className="p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{payment.purpose}</p>
                  <p className="text-sm text-muted-foreground">{payment.recipient}</p>
                  <p className="text-xs text-muted-foreground">Code: {payment.mpesaCode}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">KSh {payment.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{payment.date}</p>
                </div>
              </div>
              {getStatusBadge(payment.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
