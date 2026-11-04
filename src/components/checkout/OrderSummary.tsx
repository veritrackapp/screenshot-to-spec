import { ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const items = [
  { name: "Ofada rice, 5kg", qty: 1, price: 9500 },
  { name: "Palm oil, 2L", qty: 2, price: 3200 },
  { name: "Delivery", qty: 1, price: 2500 },
];

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export function OrderSummary() {
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-2">
          <ShoppingBag className="size-4 text-primary" aria-hidden />
          <p className="font-semibold">Mama Nkechi's Market</p>
        </div>
        <ul className="space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.name} className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                {i.name} {i.qty > 1 && `× ${i.qty}`}
              </span>
              <span>{naira(i.qty * i.price)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t pt-3 font-semibold">
          <span>Total</span>
          <span>{naira(total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
