const faqs = [
  { q: "Do you deliver outside Dhaka?", a: "Yes. The checkout supports Bangladesh addresses. Update delivery fee rules in your backend when you add courier integrations." },
  { q: "Is online payment included?", a: "Not yet. This MVP is designed for cash-on-delivery style orders. You can add SSLCommerz, ShurjoPay, or bKash later." },
  { q: "Can I change products?", a: "Yes. Admin can create, edit, hide, discount, and remove products from the dashboard after Supabase is set up." },
  { q: "How does Google Sheets automation work?", a: "When an order is placed, the API saves it to Supabase first and then appends a row to your Google Sheet using the service account." },
  { q: "How does the AI chatbot work?", a: "The floating chat widget calls the Next.js API, which forwards messages to your FastAPI service. If the FastAPI URL is missing, it returns a fallback reply." }
];

export const metadata = { title: "FAQ | OpenPaws" };

export default function FAQPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-5xl font-black text-cocoa">Frequently asked questions</h1>
      <p className="mt-4 text-lg leading-8 text-cocoa/70">Useful answers for customers and for your own setup.</p>
      <div className="mt-10 space-y-4">
        {faqs.map((faq) => (
          <div key={faq.q} className="card p-6">
            <h2 className="text-xl font-black text-cocoa">{faq.q}</h2>
            <p className="mt-3 leading-7 text-cocoa/65">{faq.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
