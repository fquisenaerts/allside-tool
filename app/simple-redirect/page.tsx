export default function SimpleRedirectPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Stripe Redirect</h1>
      <p className="mb-4">Click the button below to be redirected to Stripe:</p>

      <div className="space-y-4">
        <a
          href="https://buy.stripe.com/test_aEU9AFeey3b29eU7ss"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Direct Stripe Link
        </a>

        <div className="mt-4">
          <a
            href="/api/simple-stripe-redirect"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            API Redirect
          </a>
        </div>
      </div>
    </div>
  )
}
