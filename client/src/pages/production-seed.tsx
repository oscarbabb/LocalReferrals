import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function ProductionSeed() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/import-csv-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Import failed");
      }

      setSuccess(true);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Production Database Seeding</CardTitle>
            <CardDescription>
              Import all categories and subcategories to the production database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!success && !loading && (
              <>
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    What this will do:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <li>Import 50+ service categories</li>
                    <li>Import 400+ subcategories</li>
                    <li>Set proper icons and colors for each category</li>
                    <li>Safe operation - won't duplicate existing data</li>
                  </ul>
                </div>

                <Button
                  onClick={handleImport}
                  size="lg"
                  className="w-full"
                  data-testid="button-import"
                >
                  Import Categories to Production
                </Button>
              </>
            )}

            {loading && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Importing categories... This may take a minute.
                </AlertDescription>
              </Alert>
            )}

            {success && result && (
              <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <div className="font-semibold mb-2">Import Successful!</div>
                  <div className="text-sm space-y-1">
                    <div>Categories imported: {result.importedCategories || 0}</div>
                    <div>Subcategories imported: {result.importedSubcategories || 0}</div>
                    <div>Total items: {result.totalItems || 0}</div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                    <p className="text-sm">
                      ✅ Your production database is now populated!
                      <br />
                      Visit your live site to see all categories.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-1">Error:</div>
                  {error}
                  <Button
                    onClick={handleImport}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    data-testid="button-retry"
                  >
                    Try Again
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
