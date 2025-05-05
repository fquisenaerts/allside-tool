import { Card, CardContent } from "@/components/ui/card"

interface AdSuggestionsProps {
  suggestions: string[] | { [key: string]: string }
}

export function AdSuggestions({ suggestions }: AdSuggestionsProps) {
  const suggestionArray = Array.isArray(suggestions) ? suggestions : Object.values(suggestions)

  return (
    <Card>
      <CardContent>
        <h3 className="text-lg font-semibold mb-2">Ad Copy and Targeting Suggestions</h3>
        <ul className="list-disc pl-5">
          {suggestionArray.map((suggestion, index) => (
            <li key={index} className="mb-2">
              {suggestion}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
