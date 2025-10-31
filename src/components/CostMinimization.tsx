import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface OptimizationResult {
  totalCost: number;
  collectionCost: number;
  transportationCost: number;
  processingCost: number;
  disposalCost: number;
  recoveryValue: number;
  netCost: number;
}

const CostMinimization = () => {
  const [inputs, setInputs] = useState({
    collectionVolume: 1000,
    transportationDistance: 50,
    processingRate: 0.8,
    disposalVolume: 200,
  });

  const [result, setResult] = useState<OptimizationResult | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setInputs({ ...inputs, [field]: parseFloat(value) || 0 });
  };

  const calculateOptimization = () => {
    // Simplified LP model calculation
    const collectionCost = inputs.collectionVolume * 5; // $5 per unit
    const transportationCost = inputs.transportationDistance * inputs.collectionVolume * 0.1; // $0.1 per unit-km
    const processingCost = inputs.collectionVolume * inputs.processingRate * 10; // $10 per unit processed
    const disposalCost = inputs.disposalVolume * 15; // $15 per unit
    const recoveryValue = inputs.collectionVolume * inputs.processingRate * 0.6 * 20; // $20 per unit recovered
    
    const totalCost = collectionCost + transportationCost + processingCost + disposalCost;
    const netCost = totalCost - recoveryValue;

    setResult({
      totalCost,
      collectionCost,
      transportationCost,
      processingCost,
      disposalCost,
      recoveryValue,
      netCost,
    });

    toast.success("Optimization complete!");
  };

  return (
    <section id="cost-minimization" className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <TrendingDown className="w-4 h-4" />
            Model 1
          </div>
          <h2 className="text-4xl font-bold mb-4">Cost Minimization Model</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Linear programming model to minimize total operational costs while maximizing recovery value
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Parameters</CardTitle>
              <CardDescription>Configure the e-waste management parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collectionVolume">Collection Volume (units)</Label>
                <Input
                  id="collectionVolume"
                  type="number"
                  value={inputs.collectionVolume}
                  onChange={(e) => handleInputChange("collectionVolume", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transportationDistance">Transportation Distance (km)</Label>
                <Input
                  id="transportationDistance"
                  type="number"
                  value={inputs.transportationDistance}
                  onChange={(e) => handleInputChange("transportationDistance", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="processingRate">Processing Rate (0-1)</Label>
                <Input
                  id="processingRate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={inputs.processingRate}
                  onChange={(e) => handleInputChange("processingRate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disposalVolume">Disposal Volume (units)</Label>
                <Input
                  id="disposalVolume"
                  type="number"
                  value={inputs.disposalVolume}
                  onChange={(e) => handleInputChange("disposalVolume", e.target.value)}
                />
              </div>

              <Button onClick={calculateOptimization} className="w-full">
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Optimal Solution
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Results</CardTitle>
              <CardDescription>Optimal cost breakdown and recovery value</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Collection Cost</div>
                      <div className="text-2xl font-bold">${result.collectionCost.toFixed(2)}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Transportation</div>
                      <div className="text-2xl font-bold">${result.transportationCost.toFixed(2)}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Processing Cost</div>
                      <div className="text-2xl font-bold">${result.processingCost.toFixed(2)}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Disposal Cost</div>
                      <div className="text-2xl font-bold">${result.disposalCost.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-center text-lg">
                      <span>Total Cost:</span>
                      <span className="font-bold">${result.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg text-primary">
                      <span>Recovery Value:</span>
                      <span className="font-bold">-${result.recoveryValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl pt-3 border-t">
                      <span className="font-semibold">Net Cost:</span>
                      <span className="font-bold text-primary">${result.netCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Configure parameters and click Calculate to see results
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CostMinimization;
