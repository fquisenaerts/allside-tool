// Your component code...

const fetchReviewUsage = async (userId: string) => {
  try {
    const res = await fetch(`/api/review-usage?userId=${userId}`)

    // Check if response is OK before parsing JSON
    if (!res.ok) {
      console.error(`Error: API returned status ${res.status}`)
      return { success: false, reviewsAnalyzed: 0 }
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.error("Error fetching review usage:", error)
    return { success: false, reviewsAnalyzed: 0 }
  }
}

// Usage example
// Assuming 'user' is available in the scope, e.g., from context or props
const user = { id: "someUserId" } // Replace with actual user data

const { success, reviewsAnalyzed } = await fetchReviewUsage(user.id)
if (success) {
  console.log(`User has analyzed ${reviewsAnalyzed} reviews`)
} else {
  console.log("Failed to fetch review usage")
}
