import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { differenceInDays, isValid } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

const schema = z.object({
  restaurantName: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  chargePerWeek: z.string().optional(),
  onlineCardSale: z.string().optional(),
  onlineCardFeePercent: z.string().optional(),
  terminalSale: z.string().optional(),
  terminalCardFeePercent: z.string().optional(),
  paidByDate: z.string().optional(),
  terminalOrders: z.string().optional(),
  extraName: z.string().optional(),
  extraAmount: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type CalculationMode = "both" | "terminal" | "online";

export default function FoodinnCalculator() {
  const [results, setResults] = useState<any>(null);
  const [mode, setMode] = useState<CalculationMode>("online");
  const [showExtra, setShowExtra] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      restaurantName: "",
      startDate: "",
      endDate: "",
      chargePerWeek: "",
      onlineCardSale: "",
      onlineCardFeePercent: "",
      terminalSale: "",
      terminalCardFeePercent: "",
      paidByDate: "",
      terminalOrders: "",
      extraName: "Extra Charge",
      extraAmount: "",
    },
  });

  const { register, handleSubmit } = form;

  const calculate = (data: FormData) => {
    const start = data.startDate ? new Date(data.startDate) : null;
    const end = data.endDate ? new Date(data.endDate) : null;

    let periodDays = 0;
    if (start && end && isValid(start) && isValid(end)) {
      periodDays = differenceInDays(end, start) + 1;
    }

    const chargePerWeek = parseFloat(data.chargePerWeek || "0");
    const onlineCardSale = parseFloat(data.onlineCardSale || "0");
    const onlineCardFeePercent = parseFloat(data.onlineCardFeePercent || "0");
    const terminalSale = parseFloat(data.terminalSale || "0");
    const terminalCardFeePercent = parseFloat(data.terminalCardFeePercent || "0");
    const extraAmountVal = parseFloat(data.extraAmount || "0");

    const effectiveOnlineSale = mode === "terminal" ? 0 : onlineCardSale;
    const effectiveTerminalSale = mode === "online" ? 0 : terminalSale;
    const effectiveChargePerWeek = mode === "terminal" ? 0 : chargePerWeek;

    const chargePerPeriod = (effectiveChargePerWeek / 7) * periodDays;
    const onlineCardFee = effectiveOnlineSale * (onlineCardFeePercent / 100);
    const terminalCardFee = effectiveTerminalSale * (terminalCardFeePercent / 100);
    const extraAmount = showExtra ? extraAmountVal : 0;

    const subTotalFees = chargePerPeriod + onlineCardFee + terminalCardFee + extraAmount;
    const vat = subTotalFees * 0.23;
    const includingVat = subTotalFees + vat;
    
    const totalSale = onlineCardSale + terminalSale;
    
    const totalSalesForBalance = effectiveOnlineSale + effectiveTerminalSale;
    const accountBalance = totalSalesForBalance - includingVat;

    setResults({
      periodDays,
      chargePerPeriod,
      onlineCardFee,
      terminalCardFee,
      extraAmount,
      extraName: data.extraName || "Extra Charge",
      subTotalFees,
      vat,
      includingVat,
      totalSale,
      accountBalance,
    });
  };

  const onSubmit = (data: FormData) => {
    calculate(data);
  };

  const formatNum = (val: number) => val.toFixed(2);

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 font-sans flex flex-col items-start justify-start gap-4">
      <Card className="w-[560px] border-none shadow-lg rounded-2xl overflow-hidden relative">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-[#cc0000] h-[65px] w-full flex items-center justify-center px-4 overflow-hidden relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full border border-white/40">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-white border-none shadow-xl">
                  <DropdownMenuItem 
                    onClick={() => setMode("both")}
                    className={cn("text-black font-bold focus:bg-gray-100 cursor-pointer", mode === "both" && "bg-gray-100")}
                  >
                    All Together
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setMode("terminal")}
                    className={cn("text-black font-bold focus:bg-gray-100 cursor-pointer", mode === "terminal" && "bg-gray-100")}
                  >
                    Only Terminal
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setMode("online")}
                    className={cn("text-black font-bold focus:bg-gray-100 cursor-pointer", mode === "online" && "bg-gray-100")}
                  >
                    Only No Terminal
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuCheckboxItem
                    checked={showExtra}
                    onCheckedChange={setShowExtra}
                    className="text-black font-bold focus:bg-gray-100 cursor-pointer"
                  >
                    Add Extra
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <h1 className="text-white text-[28px] font-bold tracking-tight whitespace-nowrap leading-none w-full text-center">Foodinn Calculator</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-3 grid grid-cols-2 gap-4 items-start">
            {/* Left Column - Inputs */}
            <div className="space-y-2">
              <div className="space-y-0.5">
                <Label className="text-xs font-bold">Restaurant Name</Label>
                <Input {...register("restaurantName")} className="h-7 border-gray-200 text-xs" data-testid="input-restaurant-name" placeholder="" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold">Start Date</Label>
                  <Input type="date" {...register("startDate")} className="h-7 border-gray-200 text-xs" data-testid="input-start-date" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold">End Date</Label>
                  <Input type="date" {...register("endDate")} className="h-7 border-gray-200 text-xs" data-testid="input-end-date" />
                </div>
              </div>

              {mode !== "terminal" && (
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold">Charge per Week</Label>
                  <Input type="number" step="0.01" {...register("chargePerWeek")} className="h-7 border-gray-200 text-xs" data-testid="input-charge-per-week" placeholder="" />
                </div>
              )}

              {mode !== "terminal" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold">Online Card Sale</Label>
                    <Input type="number" step="0.01" {...register("onlineCardSale")} className="h-7 border-gray-200 text-xs" data-testid="input-online-sale" placeholder="" />
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold">Online Card Fee %</Label>
                    <Input type="number" step="0.01" {...register("onlineCardFeePercent")} className="h-7 border-gray-200 text-xs" data-testid="input-online-fee-percent" placeholder="" />
                  </div>
                </div>
              )}

              {mode !== "online" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold">Terminal Sale</Label>
                      <Input type="number" step="0.01" {...register("terminalSale")} className="h-7 border-gray-200 text-xs" data-testid="input-terminal-sale" placeholder="" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold">Terminal Card Fee %</Label>
                      <Input type="number" step="0.01" {...register("terminalCardFeePercent")} className="h-7 border-gray-200 text-xs" data-testid="input-terminal-fee-percent" placeholder="" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold">Terminal Orders</Label>
                    <Input placeholder="" {...register("terminalOrders")} className="h-7 border-gray-200 text-xs" data-testid="input-terminal-orders" />
                  </div>
                </>
              )}

              {showExtra && (
                <div className="flex gap-3 border-t pt-2 mt-2 border-dashed">
                  <div className="flex-[2] space-y-0.5">
                    <Label className="text-xs font-bold">Extra Name</Label>
                    <Input {...register("extraName")} placeholder="" className="h-7 border-gray-200 text-xs" data-testid="input-extra-name" />
                  </div>
                  <div className="flex-[1] space-y-0.5">
                    <Label className="text-xs font-bold">Extra Amount</Label>
                    <Input type="number" step="0.01" {...register("extraAmount")} className="h-7 border-gray-200 text-xs" data-testid="input-extra-amount" placeholder="" />
                  </div>
                </div>
              )}

              <div className="space-y-0.5">
                <Label className="text-xs font-bold">Will Be Paid By</Label>
                <Input type="date" {...register("paidByDate")} className="h-7 border-gray-200 text-xs" data-testid="input-paid-by" />
              </div>

              <div className="pt-1">
                <Button type="submit" className="w-full bg-[#007bff] hover:bg-[#0069d9] text-white font-bold px-4 h-7 text-xs rounded-md" data-testid="button-calculate">
                  Calculate
                </Button>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-0.5 pt-4">
              <h2 className="text-sm font-bold mb-3 border-b pb-1">Calculation Results</h2>
              <ResultRow label="Period (Days)" value={results?.periodDays ?? 0} color="text-[#007bff]" />
              
              {mode !== "terminal" && (
                <ResultRow label="Charge per Period" value={formatNum(results?.chargePerPeriod ?? 0)} color="text-[#007bff]" />
              )}
              
              {mode !== "terminal" && (
                <ResultRow label="Online Card Fee" value={formatNum(results?.onlineCardFee ?? 0)} color="text-[#007bff]" />
              )}
              
              {mode !== "online" && (
                <ResultRow label="Terminal Card Fee" value={formatNum(results?.terminalCardFee ?? 0)} color="text-[#007bff]" />
              )}

              {showExtra && results?.extraAmount > 0 && (
                <ResultRow label={results?.extraName || "Extra Charge"} value={formatNum(results?.extraAmount ?? 0)} color="text-[#007bff]" />
              )}

              <ResultRow label="Sub Total (Fees)" value={formatNum(results?.subTotalFees ?? 0)} color="text-[#007bff]" />
              <ResultRow label="VAT 23%" value={formatNum(results?.vat ?? 0)} color="text-[#007bff]" />
              <ResultRow label="Including VAT" value={formatNum(results?.includingVat ?? 0)} color="text-[#007bff]" />
              {mode === "both" && (
                <ResultRow label="Total Sale" value={formatNum(results?.totalSale ?? 0)} color="text-[#007bff]" />
              )}
              <div className="pt-2 mt-2 border-t border-gray-100">
                <ResultRow label="Account Balance" value={formatNum(results?.accountBalance ?? 0)} color="text-[#cc0000]" />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultRow({ label, value, color = "text-black" }: { label: string, value: string | number, color?: string }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-xs font-bold">{label}</span>
      <span className={cn("text-xs font-bold", color)}>{value}</span>
    </div>
  );
}
