export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);

  return Response.json({
    hostname: url.hostname,
    env: {
      hasClerkSecretKey: Boolean(process.env.CLERK_SECRET_KEY),
      hasPublishableKey: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
      secretKeyKind: process.env.CLERK_SECRET_KEY?.startsWith("sk_test_")
        ? "sk_test"
        : process.env.CLERK_SECRET_KEY?.startsWith("sk_live_")
          ? "sk_live"
          : "missing-or-unknown",
      publishableKeyKind: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith(
        "pk_test_",
      )
        ? "pk_test"
        : process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_live_")
          ? "pk_live"
          : "missing-or-unknown",
    },
  });
}
