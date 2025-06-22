import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AIResponseGeneratorProps {
  responses: { [key: string]: string }
}

export function AIResponseGenerator({ responses }: AIResponseGeneratorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Generated Responses</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.entries(responses).map(([id, response], index) => (
          <div key={id} className="mb-4">
            <h4 className="font-medium">Review {index + 1}</h4>
            <p className="text-sm">{response}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
