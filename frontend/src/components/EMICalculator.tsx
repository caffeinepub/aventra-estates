import React, { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const emi = useMemo(() => {
    const P = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenure * 12;
    if (r === 0) return P / n;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [loanAmount, interestRate, tenure]);

  const totalAmount = emi * tenure * 12;
  const totalInterest = totalAmount - loanAmount;

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
          <Calculator size={18} className="text-obsidian" />
        </div>
        <div>
          <h3 className="font-serif font-semibold text-foreground">EMI Calculator</h3>
          <p className="text-muted-foreground text-xs">Estimate your monthly payments</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Loan Amount */}
        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-sm font-medium">Loan Amount</Label>
            <span className="text-gold font-semibold text-sm">{formatCurrency(loanAmount)}</span>
          </div>
          <Slider
            min={500000}
            max={50000000}
            step={100000}
            value={[loanAmount]}
            onValueChange={([v]) => setLoanAmount(v)}
            className="mb-1"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹5L</span><span>₹5Cr</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-sm font-medium">Interest Rate (p.a.)</Label>
            <span className="text-gold font-semibold text-sm">{interestRate}%</span>
          </div>
          <Slider
            min={5}
            max={20}
            step={0.1}
            value={[interestRate]}
            onValueChange={([v]) => setInterestRate(v)}
            className="mb-1"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5%</span><span>20%</span>
          </div>
        </div>

        {/* Tenure */}
        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-sm font-medium">Loan Tenure</Label>
            <span className="text-gold font-semibold text-sm">{tenure} Years</span>
          </div>
          <Slider
            min={1}
            max={30}
            step={1}
            value={[tenure]}
            onValueChange={([v]) => setTenure(v)}
            className="mb-1"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 yr</span><span>30 yrs</span>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="mt-6 p-4 rounded-xl gold-gradient">
        <p className="text-obsidian/70 text-xs font-medium mb-1">Monthly EMI</p>
        <p className="font-serif font-bold text-obsidian text-3xl">{formatCurrency(emi)}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-secondary rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Interest</p>
          <p className="font-semibold text-foreground text-sm">{formatCurrency(totalInterest)}</p>
        </div>
        <div className="bg-secondary rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
          <p className="font-semibold text-foreground text-sm">{formatCurrency(totalAmount)}</p>
        </div>
      </div>
    </div>
  );
}
