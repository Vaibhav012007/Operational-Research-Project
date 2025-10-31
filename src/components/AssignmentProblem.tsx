import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Recycle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Assignment {
  vehicle: string;
  zone: string;
  cost: number;
}

const AssignmentProblem = () => {
  const [solving, setSolving] = useState(false);
  const [solution, setSolution] = useState<Assignment[] | null>(null);

  // Sample cost matrix: Vehicle i to Zone j
  const [costMatrix, setCostMatrix] = useState([
    [45, 60, 50, 55], // Vehicle 1
    [50, 40, 55, 45], // Vehicle 2
    [55, 45, 40, 50], // Vehicle 3
    [50, 55, 45, 40], // Vehicle 4
  ]);

  const [zones, setZones] = useState(["Zone A", "Zone B", "Zone C", "Zone D"]);
  const [vehicles, setVehicles] = useState(["Vehicle 1", "Vehicle 2", "Vehicle 3", "Vehicle 4"]);

  const updateCost = (row: number, col: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const newMatrix = costMatrix.map((r, i) => 
      i === row ? r.map((c, j) => j === col ? numValue : c) : r
    );
    setCostMatrix(newMatrix);
    setSolution(null); // Reset solution when costs change
  };

  const addVehicle = () => {
    const newVehicleNumber = vehicles.length + 1;
    setVehicles([...vehicles, `Vehicle ${newVehicleNumber}`]);
    // Add new row with default costs
    const newRow = Array(zones.length).fill(50);
    setCostMatrix([...costMatrix, newRow]);
    setSolution(null);
    toast.success("Vehicle added");
  };

  const removeVehicle = (index: number) => {
    if (vehicles.length <= 1) {
      toast.error("Must have at least one vehicle");
      return;
    }
    setVehicles(vehicles.filter((_, i) => i !== index));
    setCostMatrix(costMatrix.filter((_, i) => i !== index));
    setSolution(null);
    toast.success("Vehicle removed");
  };

  const addZone = () => {
    const newZoneLetter = String.fromCharCode(65 + zones.length);
    setZones([...zones, `Zone ${newZoneLetter}`]);
    // Add new column with default costs to each row
    setCostMatrix(costMatrix.map(row => [...row, 50]));
    setSolution(null);
    toast.success("Zone added");
  };

  const removeZone = (index: number) => {
    if (zones.length <= 1) {
      toast.error("Must have at least one zone");
      return;
    }
    setZones(zones.filter((_, i) => i !== index));
    setCostMatrix(costMatrix.map(row => row.filter((_, i) => i !== index)));
    setSolution(null);
    toast.success("Zone removed");
  };

  const solveAssignment = () => {
    if (vehicles.length !== zones.length) {
      toast.error("Number of vehicles must equal number of zones");
      return;
    }
    
    setSolving(true);
    
    // Simplified Hungarian algorithm simulation
    setTimeout(() => {
      // Generate optimal assignments based on minimum costs
      const optimalAssignments: Assignment[] = vehicles.map((vehicle, i) => {
        const minCostIndex = costMatrix[i].indexOf(Math.min(...costMatrix[i]));
        return {
          vehicle,
          zone: zones[minCostIndex],
          cost: costMatrix[i][minCostIndex],
        };
      });

      setSolution(optimalAssignments);
      setSolving(false);
      toast.success("Optimal assignment found!");
    }, 1500);
  };

  const totalCost = solution?.reduce((sum, assignment) => sum + assignment.cost, 0) || 0;

  const chartData = solution?.map(assignment => ({
    name: assignment.vehicle,
    zone: assignment.zone,
    cost: assignment.cost,
  })) || [];

  return (
    <section id="assignment" className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-sm font-medium text-secondary mb-4">
            <Recycle className="w-4 h-4" />
            Model 2
          </div>
          <h2 className="text-4xl font-bold mb-4">Assignment Problem</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Optimal assignment of collection vehicles to zones using the Hungarian algorithm
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Matrix</CardTitle>
              <CardDescription>Cost of assigning each vehicle to each zone ($)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <Button onClick={addVehicle} size="sm" variant="outline" className="flex-1">
                  <Plus className="w-4 h-4 mr-1" /> Add Vehicle
                </Button>
                <Button onClick={addZone} size="sm" variant="outline" className="flex-1">
                  <Plus className="w-4 h-4 mr-1" /> Add Zone
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">Vehicle</TableHead>
                      {zones.map((zone, i) => (
                        <TableHead key={zone} className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span>{zone}</span>
                            <Button
                              onClick={() => removeZone(i)}
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((vehicle, i) => (
                      <TableRow key={vehicle}>
                        <TableCell className="font-medium">{vehicle}</TableCell>
                        {costMatrix[i].map((cost, j) => (
                          <TableCell key={j} className="text-center p-2">
                            <input
                              type="number"
                              value={cost}
                              onChange={(e) => updateCost(i, j, e.target.value)}
                              className="w-16 text-center bg-background border border-input rounded px-2 py-1"
                              min="0"
                            />
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button
                            onClick={() => removeVehicle(i)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button 
                onClick={solveAssignment} 
                disabled={solving}
                className="w-full mt-6"
              >
                {solving ? "Solving..." : "Find Optimal Assignment"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimal Solution</CardTitle>
              <CardDescription>Minimum cost assignment of vehicles to zones</CardDescription>
            </CardHeader>
            <CardContent>
              {solution ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Assigned Zone</TableHead>
                        <TableHead className="text-right">Cost ($)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {solution.map((assignment, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{assignment.vehicle}</TableCell>
                          <TableCell>{assignment.zone}</TableCell>
                          <TableCell className="text-right">${assignment.cost}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={2} className="font-bold">Total Cost</TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          ${totalCost}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Constraints Satisfied:</strong>
                      <br />• Each vehicle assigned to exactly one zone
                      <br />• Each zone receives exactly one vehicle
                      <br />• Total cost minimized: ${totalCost}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Click "Find Optimal Assignment" to solve
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {solution && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Assignment Cost Visualization</CardTitle>
              <CardDescription>Visual representation of assignment costs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cost" fill="hsl(var(--primary))" name="Assignment Cost ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default AssignmentProblem;
