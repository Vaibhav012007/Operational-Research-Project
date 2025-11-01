import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GitBranch, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface TransportationPlan {
  from: string;
  to: string;
  quantity: number;
  cost: number;
}

const TransportationModel = () => {
  const [solving, setSolving] = useState(false);
  const [solution, setSolution] = useState<TransportationPlan[] | null>(null);

  // Supply (collection points), Demand (processing centers), Unit costs
  const [sources, setSources] = useState(["Collection A", "Collection B", "Collection C"]);
  const [destinations, setDestinations] = useState(["Processing 1", "Processing 2", "Processing 3"]);
  const [supply, setSupply] = useState([300, 400, 500]); // units available
  const [demand, setDemand] = useState([400, 500, 300]); // units needed
  
  // Cost matrix: source i to destination j ($/unit)
  const [costMatrix, setCostMatrix] = useState([
    [8, 6, 10],
    [9, 12, 13],
    [14, 9, 16],
  ]);

  const updateSupply = (index: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const newSupply = [...supply];
    newSupply[index] = numValue;
    setSupply(newSupply);
    setSolution(null);
  };

  const updateDemand = (index: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const newDemand = [...demand];
    newDemand[index] = numValue;
    setDemand(newDemand);
    setSolution(null);
  };

  const updateCost = (row: number, col: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const newMatrix = costMatrix.map((r, i) => 
      i === row ? r.map((c, j) => j === col ? numValue : c) : r
    );
    setCostMatrix(newMatrix);
    setSolution(null);
  };

  const addSource = () => {
    const newSourceLetter = String.fromCharCode(65 + sources.length);
    setSources([...sources, `Collection ${newSourceLetter}`]);
    setSupply([...supply, 100]);
    // Add new row with default costs
    const newRow = Array(destinations.length).fill(10);
    setCostMatrix([...costMatrix, newRow]);
    setSolution(null);
    toast.success("Collection point added");
  };

  const removeSource = (index: number) => {
    if (sources.length <= 1) {
      toast.error("Must have at least one collection point");
      return;
    }
    setSources(sources.filter((_, i) => i !== index));
    setSupply(supply.filter((_, i) => i !== index));
    setCostMatrix(costMatrix.filter((_, i) => i !== index));
    setSolution(null);
    toast.success("Collection point removed");
  };

  const addDestination = () => {
    const newDestNumber = destinations.length + 1;
    setDestinations([...destinations, `Processing ${newDestNumber}`]);
    setDemand([...demand, 100]);
    // Add new column with default costs to each row
    setCostMatrix(costMatrix.map(row => [...row, 10]));
    setSolution(null);
    toast.success("Processing center added");
  };

  const removeDestination = (index: number) => {
    if (destinations.length <= 1) {
      toast.error("Must have at least one processing center");
      return;
    }
    setDestinations(destinations.filter((_, i) => i !== index));
    setDemand(demand.filter((_, i) => i !== index));
    setCostMatrix(costMatrix.map(row => row.filter((_, i) => i !== index)));
    setSolution(null);
    toast.success("Processing center removed");
  };

  const solveTransportation = () => {
    const solveTransportation = () => {
    const totalSupply = supply.reduce((a, b) => a + b, 0);
    const totalDemand = demand.reduce((a, b) => a + b, 0);

    if (totalSupply !== totalDemand) {
      toast.error(`Supply (${totalSupply}) must equal Demand (${totalDemand})`);
      return;
    }

    setSolving(true);

    setTimeout(() => {
      const n = sources.length;
      const m = destinations.length;

      const remainingSupply = [...supply];
      const remainingDemand = [...demand];
      const allocated = Array.from({ length: n }, () => Array(m).fill(0));
      const usedRow = Array(n).fill(false);
      const usedCol = Array(m).fill(false);

      const calcPenalty = (matrix, usedRow, usedCol) => {
        const rowPenalty = Array(n).fill(0);
        const colPenalty = Array(m).fill(0);

        // Row penalties
        for (let i = 0; i < n; i++) {
          if (usedRow[i]) continue;
          const costs = matrix[i].filter((_, j) => !usedCol[j]);
          if (costs.length >= 2) {
            const sorted = [...costs].sort((a, b) => a - b);
            rowPenalty[i] = sorted[1] - sorted[0];
          } else if (costs.length === 1) {
            rowPenalty[i] = costs[0];
          }
        }

        // Column penalties
        for (let j = 0; j < m; j++) {
          if (usedCol[j]) continue;
          const costs = matrix.map(row => row[j]).filter((_, i) => !usedRow[i]);
          if (costs.length >= 2) {
            const sorted = [...costs].sort((a, b) => a - b);
            colPenalty[j] = sorted[1] - sorted[0];
          } else if (costs.length === 1) {
            colPenalty[j] = costs[0];
          }
        }

        return { rowPenalty, colPenalty };
      };

      while (usedRow.some(v => !v) && usedCol.some(v => !v)) {
        const { rowPenalty, colPenalty } = calcPenalty(costMatrix, usedRow, usedCol);

        let maxRowPenalty = Math.max(...rowPenalty);
        let maxColPenalty = Math.max(...colPenalty);

        let isRow = maxRowPenalty >= maxColPenalty;
        let selectedRow = -1, selectedCol = -1;

        if (isRow) {
          selectedRow = rowPenalty.indexOf(maxRowPenalty);
          // Choose min-cost cell in this row
          let minCost = Infinity;
          for (let j = 0; j < m; j++) {
            if (!usedCol[j] && costMatrix[selectedRow][j] < minCost) {
              minCost = costMatrix[selectedRow][j];
              selectedCol = j;
            }
          }
        } else {
          selectedCol = colPenalty.indexOf(maxColPenalty);
          // Choose min-cost cell in this column
          let minCost = Infinity;
          for (let i = 0; i < n; i++) {
            if (!usedRow[i] && costMatrix[i][selectedCol] < minCost) {
              minCost = costMatrix[i][selectedCol];
              selectedRow = i;
            }
          }
        }

        const quantity = Math.min(remainingSupply[selectedRow], remainingDemand[selectedCol]);
        allocated[selectedRow][selectedCol] = quantity;

        remainingSupply[selectedRow] -= quantity;
        remainingDemand[selectedCol] -= quantity;

        if (remainingSupply[selectedRow] === 0) usedRow[selectedRow] = true;
        if (remainingDemand[selectedCol] === 0) usedCol[selectedCol] = true;
      }

      const optimalPlan: TransportationPlan[] = [];
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
          if (allocated[i][j] > 0) {
            optimalPlan.push({
              from: sources[i],
              to: destinations[j],
              quantity: allocated[i][j],
              cost: costMatrix[i][j],
            });
          }
        }
      }

      setSolution(optimalPlan);
      setSolving(false);
      toast.success("Optimal transportation plan (VAM) found!");
    }, 1200);
  };

  };

  const totalCost = solution?.reduce((sum, plan) => sum + (plan.quantity * plan.cost), 0) || 0;

  const flowData = solution?.map(plan => ({
    route: `${plan.from} → ${plan.to}`,
    quantity: plan.quantity,
    cost: plan.quantity * plan.cost,
  })) || [];

  return (
    <section id="transportation" className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-sm font-medium text-accent mb-4">
            <GitBranch className="w-4 h-4" />
            Model 3
          </div>
          <h2 className="text-4xl font-bold mb-4">Transportation & Network Flow</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Multi-stage transportation model for moving e-waste from collection points to processing centers
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supply Points</CardTitle>
                <Button onClick={addSource} size="sm" variant="outline" className="w-full mt-2">
                  <Plus className="w-4 h-4 mr-1" /> Add Collection
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sources.map((source, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-muted rounded gap-2">
                      <span className="text-sm font-medium flex-1">{source}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={supply[i]}
                          onChange={(e) => updateSupply(i, e.target.value)}
                          className="w-20 text-center bg-background border border-input rounded px-2 py-1 text-sm"
                          min="0"
                        />
                        <span className="text-xs text-muted-foreground">units</span>
                        <Button
                          onClick={() => removeSource(i)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-bold">
                      <span>Total Supply:</span>
                      <span>{supply.reduce((a, b) => a + b, 0)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cost Matrix ($/unit)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20 text-xs">From/To</TableHead>
                        {destinations.map((dest, i) => (
                          <TableHead key={i} className="text-center text-xs p-1">
                            <div className="flex flex-col items-center gap-1">
                              <span>P{i + 1}</span>
                              <Button
                                onClick={() => removeDestination(i)}
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0"
                              >
                                <Trash2 className="w-2 h-2" />
                              </Button>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {costMatrix.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs p-1">C{String.fromCharCode(65 + i)}</TableCell>
                          {row.map((cost, j) => (
                            <TableCell key={j} className="text-center p-1">
                              <input
                                type="number"
                                value={cost}
                                onChange={(e) => updateCost(i, j, e.target.value)}
                                className="w-12 text-center bg-background border border-input rounded px-1 text-xs"
                                min="0"
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Demand Points</CardTitle>
                <Button onClick={addDestination} size="sm" variant="outline" className="w-full mt-2">
                  <Plus className="w-4 h-4 mr-1" /> Add Processing
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {destinations.map((dest, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-muted rounded gap-2">
                      <span className="text-sm font-medium flex-1">{dest}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={demand[i]}
                          onChange={(e) => updateDemand(i, e.target.value)}
                          className="w-20 text-center bg-background border border-input rounded px-2 py-1 text-sm"
                          min="0"
                        />
                        <span className="text-xs text-muted-foreground">units</span>
                        <Button
                          onClick={() => removeDestination(i)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-bold">
                      <span>Total Demand:</span>
                      <span>{demand.reduce((a, b) => a + b, 0)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Optimal Transportation Plan</CardTitle>
              <CardDescription>Minimum cost allocation satisfying all constraints</CardDescription>
            </CardHeader>
            <CardContent>
              {solution ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Cost</TableHead>
                        <TableHead className="text-right">Total Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {solution.map((plan, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{plan.from}</TableCell>
                          <TableCell>{plan.to}</TableCell>
                          <TableCell className="text-right">{plan.quantity}</TableCell>
                          <TableCell className="text-right">${plan.cost}</TableCell>
                          <TableCell className="text-right font-semibold">
                            ${plan.quantity * plan.cost}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={4} className="font-bold">Minimum Total Transportation Cost</TableCell>
                        <TableCell className="text-right font-bold text-primary text-lg">
                          ${totalCost}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <h4 className="font-semibold mb-2 text-sm">Supply Constraints</h4>
                      <p className="text-xs text-muted-foreground">
                        ✓ All collection points fully utilized<br />
                        ✓ No excess inventory at sources
                      </p>
                    </div>
                    <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
                      <h4 className="font-semibold mb-2 text-sm">Demand Constraints</h4>
                      <p className="text-xs text-muted-foreground">
                        ✓ All processing centers fully supplied<br />
                        ✓ No shortages at destinations
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Button onClick={solveTransportation} disabled={solving} size="lg">
                    {solving ? "Solving..." : "Solve Transportation Problem"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {solution && (
            <Card>
              <CardHeader>
                <CardTitle>Transportation Flow Visualization</CardTitle>
                <CardDescription>Visual representation of optimal flow and costs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={flowData} layout="vertical" margin={{ left: 120 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="route" type="category" width={110} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quantity" fill="hsl(var(--primary))" name="Quantity (units)" />
                    <Bar dataKey="cost" fill="hsl(var(--secondary))" name="Total Cost ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default TransportationModel;
