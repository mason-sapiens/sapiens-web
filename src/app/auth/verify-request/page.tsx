export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg border border-charcoal/10 p-8 text-center">
        <div className="text-h2 text-teal mb-4">📧</div>
        <h1 className="text-h2 text-charcoal mb-4 font-serif">Check your email</h1>
        <p className="text-body text-charcoal/70 mb-6">
          A sign-in link has been sent to your email address.
        </p>
        <p className="text-small text-charcoal/60">
          Click the link in the email to complete your sign-in. You can close this page.
        </p>
      </div>
    </div>
  )
}
