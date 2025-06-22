"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProductPromotionArgumentsProps {
  strengths?: { strength: string; count: number }[]
  weaknesses?: { weakness: string; count: number }[]
  keywords?: { text: string; value: number }[]
}

export function ProductPromotionArguments({
  strengths = [],
  weaknesses = [],
  keywords = [],
}: ProductPromotionArgumentsProps) {
  const [copied, setCopied] = useState<string | null>(null)

  // Filter out generic placeholders
  const filteredStrengths = strengths.filter(
    (s) => s.strength && s.strength !== "not specified" && s.strength !== "good experience",
  )

  const filteredWeaknesses = weaknesses.filter(
    (w) => w.weakness && w.weakness !== "not specified" && w.weakness !== "issues mentioned",
  )

  const filteredKeywords =
    keywords?.filter((k) => k.text && k.text !== "general feedback" && k.text !== "Unknown") || []

  // Generate personalized marketing arguments based on actual data
  const generateMarketingArguments = () => {
    // If we don't have enough data, provide a generic message
    if (filteredStrengths.length === 0 && filteredKeywords.length === 0) {
      return [
        "Our product delivers exceptional value and quality.",
        "Designed with your needs in mind, our solution stands out from the competition.",
        "Join thousands of satisfied customers who have experienced our outstanding service.",
      ]
    }

    // Use actual strengths and keywords to generate personalized arguments
    const marketingArgs = []

    // Use top strengths
    if (filteredStrengths.length > 0) {
      const topStrength = filteredStrengths[0].strength
      marketingArgs.push(`Experience the ${topStrength} that our customers consistently praise.`)

      if (filteredStrengths.length > 1) {
        const secondStrength = filteredStrengths[1].strength
        marketingArgs.push(`Our commitment to ${topStrength} and ${secondStrength} sets us apart from competitors.`)
      }
    }

    // Use keywords
    if (filteredKeywords.length > 0) {
      const topKeywords = filteredKeywords.slice(0, 3).map((k) => k.text)

      if (topKeywords.length >= 2) {
        marketingArgs.push(
          `Discover why customers consistently mention ${topKeywords.slice(0, -1).join(", ")} and ${topKeywords[topKeywords.length - 1]} when describing their experience with us.`,
        )
      } else if (topKeywords.length === 1) {
        marketingArgs.push(`Discover why ${topKeywords[0]} is the most mentioned aspect in our customer reviews.`)
      }
    }

    // Add a call to action
    if (filteredStrengths.length > 0) {
      marketingArgs.push(
        `Join our satisfied customers who enjoy ${filteredStrengths[0].strength} every day. Try our product now!`,
      )
    } else {
      marketingArgs.push("Join our satisfied customers today and experience the difference for yourself!")
    }

    return marketingArgs
  }

  // Generate personalized counter-arguments based on actual data
  const generateCounterArguments = () => {
    // If we don't have enough data, provide a generic message
    if (filteredWeaknesses.length === 0) {
      return [
        "While some may have concerns about pricing, our value proposition justifies the investment.",
        "We acknowledge that the learning curve exists, but our customer support team is always ready to help.",
        "Some competitors may offer lower prices, but they can't match our quality and service.",
      ]
    }

    // Use actual weaknesses to generate personalized counter-arguments
    const counterArgs = []

    // Address top weaknesses
    filteredWeaknesses.slice(0, 3).forEach((weakness) => {
      const issue = weakness.weakness.toLowerCase()

      if (issue.includes("price") || issue.includes("expensive") || issue.includes("cost")) {
        counterArgs.push(
          `While some may mention our pricing, the exceptional quality and durability of our product provides long-term value that justifies the investment.`,
        )
      } else if (issue.includes("delivery") || issue.includes("shipping") || issue.includes("slow")) {
        counterArgs.push(
          `We've heard feedback about ${issue} and have recently upgraded our logistics system to ensure faster and more reliable delivery.`,
        )
      } else if (issue.includes("difficult") || issue.includes("complex") || issue.includes("confusing")) {
        counterArgs.push(
          `We understand some customers find aspects of our product ${issue}. That's why we've enhanced our support resources and simplified the user experience.`,
        )
      } else if (issue.includes("quality") || issue.includes("defect")) {
        counterArgs.push(
          `We take ${issue} concerns seriously and have implemented rigorous quality control measures to ensure every product meets our high standards.`,
        )
      } else {
        counterArgs.push(
          `We've listened to feedback about ${issue} and are actively working on improvements to address this concern.`,
        )
      }
    })

    // Add a reassurance
    counterArgs.push(
      "Our commitment to continuous improvement means we're always working to enhance your experience with us.",
    )

    return counterArgs
  }

  // Generate personalized value propositions based on actual data
  const generateValuePropositions = () => {
    // If we don't have enough data, provide a generic message
    if (filteredStrengths.length === 0 && filteredKeywords.length === 0) {
      return [
        "Superior quality at competitive prices",
        "Exceptional customer service and support",
        "Innovative features that solve real problems",
        "Trusted by thousands of satisfied customers",
      ]
    }

    // Use actual strengths and keywords to generate personalized value propositions
    const propositions = []

    // Use top strengths
    filteredStrengths.slice(0, 3).forEach((strength) => {
      propositions.push(
        `${strength.strength.charAt(0).toUpperCase() + strength.strength.slice(1)} that exceeds expectations`,
      )
    })

    // Use keywords
    filteredKeywords.slice(0, 2).forEach((keyword) => {
      if (!filteredStrengths.some((s) => s.strength.toLowerCase().includes(keyword.text.toLowerCase()))) {
        propositions.push(`${keyword.text.charAt(0).toUpperCase() + keyword.text.slice(1)} you can count on`)
      }
    })

    // Add some general value propositions if we don't have enough
    if (propositions.length < 3) {
      const additionalPropositions = [
        "Exceptional customer service and support",
        "Trusted by thousands of satisfied customers",
        "Innovative solutions to everyday challenges",
      ]

      for (let i = 0; i < additionalPropositions.length && propositions.length < 4; i++) {
        propositions.push(additionalPropositions[i])
      }
    }

    return propositions
  }

  const marketingArguments = generateMarketingArguments()
  const counterArguments = generateCounterArguments()
  const valuePropositions = generateValuePropositions()

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Tabs defaultValue="marketing" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="marketing">Marketing Arguments</TabsTrigger>
        <TabsTrigger value="counter">Counter Arguments</TabsTrigger>
        <TabsTrigger value="value">Value Propositions</TabsTrigger>
      </TabsList>
      <TabsContent value="marketing">
        <Card>
          <CardHeader>
            <CardTitle>Marketing Arguments</CardTitle>
            <CardDescription>Compelling arguments based on customer sentiment analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {marketingArguments.map((argument, index) => (
              <div key={index} className="p-4 border rounded-lg relative">
                <p className="pr-24">{argument}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-3 right-3"
                  onClick={() => copyToClipboard(argument, `marketing-${index}`)}
                >
                  {copied === `marketing-${index}` ? "Copied!" : "Copy"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="counter">
        <Card>
          <CardHeader>
            <CardTitle>Counter Arguments</CardTitle>
            <CardDescription>Responses to potential objections based on identified weaknesses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {counterArguments.map((argument, index) => (
              <div key={index} className="p-4 border rounded-lg relative">
                <p className="pr-24">{argument}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-3 right-3"
                  onClick={() => copyToClipboard(argument, `counter-${index}`)}
                >
                  {copied === `counter-${index}` ? "Copied!" : "Copy"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="value">
        <Card>
          <CardHeader>
            <CardTitle>Value Propositions</CardTitle>
            <CardDescription>Key value points based on customer sentiment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {valuePropositions.map((proposition, index) => (
              <div key={index} className="p-4 border rounded-lg relative">
                <p className="pr-24">{proposition}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-3 right-3"
                  onClick={() => copyToClipboard(proposition, `value-${index}`)}
                >
                  {copied === `value-${index}` ? "Copied!" : "Copy"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
